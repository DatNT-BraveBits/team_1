import { useLoaderData, Form, redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { createLiveStream } from "../features/feature-5/utils/mux.server";

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

export default function CreateSession() {
  const { products } = useLoaderData();

  return (
    <Form method="post" data-save-bar>
      <s-page heading="Create Livestream" backAction={{ url: "/app/feature-5" }}>
        <s-section heading="Stream Details">
          <s-text-field
            label="Title"
            name="title"
            placeholder="e.g. Summer Collection Launch"
            details="Give your livestream a name that describes the event."
            required
          />
        </s-section>

        <s-section heading="Select Products">
          <s-text tone="subdued">
            Choose products to showcase during your livestream. You can pin
            products in real-time while streaming.
          </s-text>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            {products.map((p) => {
              const imgUrl = p.images.edges[0]?.node.url;
              const price = p.variants.edges[0]?.node.price;
              return (
                <label
                  key={p.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    border: "2px solid var(--p-color-border)",
                    borderRadius: "var(--p-border-radius-300)",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    background: "var(--p-color-bg-surface)",
                  }}
                >
                  <input
                    type="checkbox"
                    name="products"
                    value={p.id}
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      width: "18px",
                      height: "18px",
                      zIndex: 1,
                      accentColor: "var(--p-color-bg-fill-brand)",
                    }}
                    onChange={(e) => {
                      const label = e.target.closest("label");
                      if (e.target.checked) {
                        label.style.borderColor = "var(--p-color-border-brand)";
                        label.style.boxShadow =
                          "0 0 0 1px var(--p-color-border-brand)";
                      } else {
                        label.style.borderColor = "var(--p-color-border)";
                        label.style.boxShadow = "none";
                      }
                    }}
                  />
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={p.title}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <s-box
                      padding="large-300"
                      background="subdued"
                      inlineSize="100%"
                    >
                      <s-stack direction="block" align="center">
                        <s-icon type="image" />
                        <s-text tone="subdued" variant="bodySm">
                          No image
                        </s-text>
                      </s-stack>
                    </s-box>
                  )}
                  <s-box padding="small">
                    <s-text variant="bodySm" fontWeight="semibold">
                      {p.title}
                    </s-text>
                    {price && (
                      <s-text variant="bodySm" tone="subdued">
                        ${price}
                      </s-text>
                    )}
                  </s-box>
                </label>
              );
            })}
          </div>
        </s-section>

        <s-section>
          <s-button submit variant="primary">
            Create Livestream
          </s-button>
        </s-section>
      </s-page>
    </Form>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
