// Route: /app/feature-5
// Owner: Person 5 — edit app/features/feature-5/ instead of this file
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import Feature5Page from "../features/feature-5";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function () {
  return <Feature5Page />;
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
