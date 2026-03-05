import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { createLiveStream } from "../features/feature-5/utils/mux.server";
import { redirect } from "react-router";

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
          variants(first: 1) {
            edges { node { price } }
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
  const fetcher = useFetcher();
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState([]);
  const isSubmitting = fetcher.state !== "idle";

  const toggleProduct = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("title", title);
    selected.forEach((id) => formData.append("products", id));
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <s-page heading="Create Livestream" backAction={{ url: "/app/feature-5" }}>
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={handleSubmit}
        disabled={!title.trim() || isSubmitting}
        loading={isSubmitting}
      >
        Create Livestream
      </s-button>

      <s-section heading="Stream Details">
        <s-card>
          <s-box padding="base">
            <s-text-field
              label="Title"
              placeholder="My Live Shopping Event"
              value={title}
              required
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
          </s-box>
        </s-card>
      </s-section>

      <s-section heading={`Select Products (${selected.length} selected)`}>
        <s-grid columns="4">
          {products.map((p) => {
            const imgUrl = p.images.edges[0]?.node.url;
            const price = p.variants.edges[0]?.node.price;
            const isSelected = selected.includes(p.id);
            return (
              <s-card
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                style={{ cursor: "pointer" }}
              >
                <s-box padding="small-200">
                  <s-stack direction="block" gap="small-200">
                    <s-checkbox
                      label=""
                      checked={isSelected}
                      onChange={() => toggleProduct(p.id)}
                    />
                    {imgUrl ? (
                      <s-thumbnail
                        src={imgUrl}
                        alt={p.title}
                        size="large"
                      />
                    ) : (
                      <s-box padding="large-100" background="subdued">
                        <s-text tone="subdued" alignment="center">
                          No image
                        </s-text>
                      </s-box>
                    )}
                    <s-text fontWeight="semibold" truncate>
                      {p.title}
                    </s-text>
                    {price && <s-text tone="subdued">${price}</s-text>}
                  </s-stack>
                </s-box>
              </s-card>
            );
          })}
        </s-grid>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
