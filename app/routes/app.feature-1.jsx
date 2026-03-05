// Route: /app/feature-1
// Owner: Person 1 — edit app/features/feature-1/ instead of this file
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import Feature1Page from "../features/feature-1";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function () {
  return <Feature1Page />;
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
