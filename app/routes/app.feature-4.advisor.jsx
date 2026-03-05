import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getSizeAdvice } from "../features/feature-4/utils/size-logic.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const body = await request.json();
  const { productId, height, weight } = body;

  if (!productId) {
    return Response.json({ error: "Missing productId" }, { status: 400 });
  }

  const result = await getSizeAdvice({ productId, height, weight });
  return Response.json(result);
};

export const headers = (headersArgs) => boundary.headers(headersArgs);
