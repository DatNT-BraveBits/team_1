import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { generateTryOn } from "../features/feature-4/utils/tryon.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const body = await request.json();
  const { productId, productName, productDescription, photoBase64 } = body;

  if (!productId || !photoBase64) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await generateTryOn({ productId, productName, productDescription, photoBase64 });
  return Response.json(result);
};

export const headers = (headersArgs) => boundary.headers(headersArgs);
