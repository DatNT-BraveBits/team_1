// Route: /app/feature-2
// Owner: Person 2 — edit app/features/feature-2/ instead of this file
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import Feature2Page from "../features/feature-2";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function () {
  return <Feature2Page />;
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
