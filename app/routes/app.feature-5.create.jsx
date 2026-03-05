import { useLoaderData, Form, redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { createLiveStream } from "../features/feature-5/utils/mux.server";
import { useState } from "react";

const PRODUCTS_LIST_QUERY = `#graphql
  query listProducts {
    products(first: 20) {
      edges {
        node {
          id
          title
          images(first: 1) { edges { node { url } } }
          variants(first: 1) { edges { node { price } } }
        }
      }
    }
  }
`;

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const res = await admin.graphql(PRODUCTS_LIST_QUERY);
  const data = await res.json();
  return { products: data.data.products.edges.map((e) => e.node) };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const productIds = formData.getAll("products");
  const mux = await createLiveStream();

  const liveSession = await prisma.feature5_LiveSession.create({
    data: {
      shop: session.shop,
      title,
      muxStreamId: mux.streamId,
      muxPlaybackId: mux.playbackId,
      muxStreamKey: mux.streamKey,
      productIds: JSON.stringify(productIds),
    },
  });

  return redirect(`/app/feature-5/${liveSession.id}`);
};

function ProductCard({ product, selected, onToggle }) {
  const imgUrl = product.images.edges[0]?.node.url;
  const price = product.variants.edges[0]?.node.price;

  return (
    <s-card>
      <s-box padding="small">
        <s-stack direction="block" gap="small">
          {imgUrl ? (
            <s-box borderRadius="base" overflow="hidden">
              <s-image src={imgUrl} alt={product.title} objectFit="cover" />
            </s-box>
          ) : (
            <s-box padding="large" background="subdued" borderRadius="base">
              <s-stack direction="block" align="center">
                <s-icon type="image" />
                <s-text tone="subdued" variant="bodySm">No image</s-text>
              </s-stack>
            </s-box>
          )}
          <s-stack direction="block" gap="small">
            <s-text variant="bodySm" fontWeight="semibold">
              {product.title}
            </s-text>
            {price && (
              <s-text variant="bodySm" tone="subdued">${price}</s-text>
            )}
            <s-checkbox
              label="Select"
              labelHidden
              checked={selected}
              onChange={onToggle}
            />
          </s-stack>
        </s-stack>
      </s-box>
    </s-card>
  );
}

export default function CreateSession() {
  const { products } = useLoaderData();
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  const toggleProduct = (id) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Form method="post" data-save-bar>
      {/* Hidden inputs for selected products */}
      {[...selectedProducts].map((id) => (
        <input key={id} type="hidden" name="products" value={id} />
      ))}

      <s-page heading="Create Livestream" backAction={{ url: "/app/feature-5" }}>
        <s-button slot="primary-action" variant="primary" submit>
          Create Livestream
        </s-button>

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
              <s-text tone="subdued">
                Choose products to showcase during your livestream.
              </s-text>
              {selectedProducts.size > 0 && (
                <s-badge tone="info">
                  {selectedProducts.size} selected
                </s-badge>
              )}
            </s-stack>
            <s-grid columns="3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  selected={selectedProducts.has(p.id)}
                  onToggle={() => toggleProduct(p.id)}
                />
              ))}
            </s-grid>
          </s-stack>
        </s-section>
      </s-page>
    </Form>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
