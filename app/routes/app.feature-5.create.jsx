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
    <s-page
      heading="Create Livestream"
      backAction={{ url: "/app/feature-5" }}
    >
      <Form method="post">
        <s-section heading="Stream Details">
          <s-card>
            <s-box padding="base">
              <s-stack direction="block" gap="base">
                <label>
                  <s-text fontWeight="bold">Title</s-text>
                  <s-text variant="bodySm" tone="subdued">
                    Give your livestream a name that describes the event.
                  </s-text>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Summer Collection Launch"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #8c9196",
                      fontSize: "14px",
                      marginTop: "8px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </label>
              </s-stack>
            </s-box>
          </s-card>
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
                    border: "2px solid #e1e3e5",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    background: "#fff",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#005bd3";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 1px #005bd3";
                  }}
                  onMouseLeave={(e) => {
                    const cb =
                      e.currentTarget.querySelector("input[type=checkbox]");
                    if (!cb?.checked) {
                      e.currentTarget.style.borderColor = "#e1e3e5";
                      e.currentTarget.style.boxShadow = "none";
                    }
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
                      accentColor: "#005bd3",
                    }}
                    onChange={(e) => {
                      const label = e.target.closest("label");
                      if (e.target.checked) {
                        label.style.borderColor = "#005bd3";
                        label.style.boxShadow = "0 0 0 1px #005bd3";
                      } else {
                        label.style.borderColor = "#e1e3e5";
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
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        background: "#f6f6f7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#8c9196",
                        fontSize: "13px",
                      }}
                    >
                      No image
                    </div>
                  )}
                  <div style={{ padding: "10px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        lineHeight: "1.3",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.title}
                    </div>
                    {price && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6d7175",
                          marginTop: "2px",
                        }}
                      >
                        ${price}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </s-section>

        <s-section>
          <button
            type="submit"
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#005bd3",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          >
            Create Livestream
          </button>
        </s-section>
      </Form>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
