/**
 * Upload a GIF to Shopify Files and add it as product media.
 */
export async function uploadGifToProduct(admin, productId, gifFile, altText = "Animated GIF") {
  const buffer = await gifFile.arrayBuffer();
  const fileSize = gifFile.size;

  // 1. Create staged upload
  const stagedRes = await admin.graphql(
    `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters { name value }
        }
        userErrors { field message }
      }
    }`,
    {
      variables: {
        input: [
          {
            resource: "FILE",
            filename: "animated.gif",
            mimeType: "image/gif",
            httpMethod: "POST",
            fileSize: String(fileSize),
          },
        ],
      },
    },
  );

  const stagedData = await stagedRes.json();
  const stagedErrors = stagedData.data.stagedUploadsCreate.userErrors;
  if (stagedErrors?.length) throw new Error(stagedErrors[0].message);

  const target = stagedData.data.stagedUploadsCreate.stagedTargets[0];

  // 2. Upload file to staged URL
  const uploadForm = new FormData();
  target.parameters.forEach((p) => uploadForm.append(p.name, p.value));
  uploadForm.append(
    "file",
    new Blob([buffer], { type: "image/gif" }),
    "animated.gif",
  );

  const uploadRes = await fetch(target.url, {
    method: "POST",
    body: uploadForm,
  });
  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${uploadRes.status}`);
  }

  // 3. Add as product media via productUpdate
  const mediaRes = await admin.graphql(
    `mutation productUpdate($product: ProductUpdateInput, $media: [CreateMediaInput!]) {
      productUpdate(product: $product, media: $media) {
        product {
          id
        }
        userErrors { field message }
      }
    }`,
    {
      variables: {
        product: {
          id: productId,
        },
        media: [
          {
            originalSource: target.resourceUrl,
            mediaContentType: "IMAGE",
            alt: altText,
          },
        ],
      },
    },
  );

  const mediaData = await mediaRes.json();
  const mediaErrors = mediaData.data.productUpdate.userErrors;
  if (mediaErrors?.length) throw new Error(mediaErrors[0].message);

  return { success: true };
}
