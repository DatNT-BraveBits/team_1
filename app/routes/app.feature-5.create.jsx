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
          images(first: 1) {
            edges { node { url } }
          }
        }
      }
    }
  }
`;

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(PRODUCTS_LIST_QUERY);
  const json = await response.json();
  const products = json.data.products.edges.map((e) => e.node);
  return { products };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const selectedProducts = formData.getAll("products");

  const muxStream = await createLiveStream();

  const liveSession = await prisma.feature5_LiveSession.create({
    data: {
      shop: session.shop,
      title,
      muxStreamId: muxStream.streamId,
      muxPlaybackId: muxStream.playbackId,
      muxStreamKey: muxStream.streamKey,
      productIds: JSON.stringify(selectedProducts),
    },
  });

  return redirect(`/app/feature-5/${liveSession.id}`);
};

export default function CreateSession() {
  const { products } = useLoaderData();

  return (
    <s-page heading="Create Livestream" backAction={{ url: "/app/feature-5" }}>
      <Form method="post">
        <s-section heading="Stream Details">
          <s-stack direction="block" gap="base">
            <label>
              <s-text fontWeight="bold">Title</s-text>
              <input
                type="text"
                name="title"
                required
                placeholder="My Live Shopping Event"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              />
            </label>
          </s-stack>
        </s-section>

        <s-section heading="Select Products">
          <s-stack direction="block" gap="base">
            {products.map((p) => (
              <label
                key={p.id}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input type="checkbox" name="products" value={p.id} />
                {p.title}
              </label>
            ))}
          </s-stack>
        </s-section>

        <s-box padding="base">
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#008060",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Create Livestream
          </button>
        </s-box>
      </Form>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
