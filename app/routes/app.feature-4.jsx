// Route: /app/feature-4
// Owner: Person 4 — edit app/features/feature-4/ instead of this file
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import Feature4Page from "../features/feature-4";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function () {
  return <Feature4Page />;
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
