import { Form, redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { createLiveStream } from "../features/feature-5/utils/mux.server";
import { useState } from "react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return {};
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const productIds = formData.getAll("products");
  const productDataRaw = formData.get("productData");
  const mux = await createLiveStream();

  const liveSession = await prisma.feature5_LiveSession.create({
    data: {
      shop: session.shop,
      title,
      muxStreamId: mux.streamId,
      muxPlaybackId: mux.playbackId,
      muxStreamKey: mux.streamKey,
      productIds: JSON.stringify(productIds),
      productData: productDataRaw || "[]",
    },
  });

  return redirect(`/app/feature-5/${liveSession.id}`);
};

export default function CreateSession() {
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleSelectProducts = async () => {
    const selected = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      action: "select",
      selectionIds: selectedProducts.map((p) => ({ id: p.id })),
    });
    if (selected) {
      setSelectedProducts(
        selected.map((p) => ({
          id: p.id,
          title: p.title,
          imageUrl: p.images?.[0]?.originalSrc,
          price: p.variants?.[0]?.price,
        })),
      );
    }
  };

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Form method="post" data-save-bar>
      {selectedProducts.map((p) => (
        <input key={p.id} type="hidden" name="products" value={p.id} />
      ))}
      <input
        type="hidden"
        name="productData"
        value={JSON.stringify(
          selectedProducts.map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price || "0.00",
            image: p.imageUrl || "",
            handle: p.id.split("/").pop(),
          })),
        )}
      />

      <s-page heading="Create Livestream">
        <s-link slot="breadcrumb-actions" href="/app/feature-5">Live Shopping</s-link>
        <s-section heading="Stream Details">
          <s-text-field
            label="Title"
            name="title"
            placeholder="e.g. Summer Collection Launch"
            details="Give your livestream a name that describes the event."
            required
          />
          <s-text-field
            label="Description"
            name="description"
            placeholder="Tell viewers what to expect"
            multiline
          />
        </s-section>

        <s-section heading="Select Products">
          <s-stack direction="block" gap="base">
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-button variant="secondary" onClick={handleSelectProducts}>
                {selectedProducts.length > 0 ? "Change products" : "Browse products"}
              </s-button>
              {selectedProducts.length > 0 && (
                <s-badge tone="info">
                  {selectedProducts.length} selected
                </s-badge>
              )}
            </s-stack>

            {selectedProducts.length > 0 && (
              <s-table>
                <s-table-header-row>
                  <s-table-header listSlot="primary">Product</s-table-header>
                  <s-table-header listSlot="labeled">Price</s-table-header>
                  <s-table-header listSlot="secondary">
                    <s-stack alignItems="end">Remove</s-stack>
                  </s-table-header>
                </s-table-header-row>
                <s-table-body>
                  {selectedProducts.map((p) => (
                    <s-table-row key={p.id}>
                      <s-table-cell>
                        <s-stack direction="inline" gap="small" alignItems="center">
                          {p.imageUrl && (
                            <s-box
                              border="base"
                              borderRadius="base"
                              overflow="hidden"
                              inlineSize="40px"
                              blockSize="40px"
                            >
                              <s-image
                                src={p.imageUrl}
                                alt={p.title}
                                objectFit="cover"
                              />
                            </s-box>
                          )}
                          <s-text fontWeight="semibold">{p.title}</s-text>
                        </s-stack>
                      </s-table-cell>
                      <s-table-cell>
                        {p.price ? `$${p.price}` : "—"}
                      </s-table-cell>
                      <s-table-cell>
                        <s-stack alignItems="end">
                          <s-button
                            variant="tertiary"
                            tone="critical"
                            icon="x"
                            accessibilityLabel={`Remove ${p.title}`}
                            onClick={() => removeProduct(p.id)}
                          />
                        </s-stack>
                      </s-table-cell>
                    </s-table-row>
                  ))}
                </s-table-body>
              </s-table>
            )}
          </s-stack>
        </s-section>
      </s-page>
    </Form>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
