import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const body = await request.json();
  const { productId, imageUrl, customerName } = body;

  if (!productId || !imageUrl) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ugcPhoto = await prisma.feature4_UgcPhoto.create({
    data: {
      productId,
      imageUrl,
      customerName: customerName || "Anonymous",
      approved: false,
    },
  });

  return Response.json({ success: true, id: ugcPhoto.id });
};

export const headers = (headersArgs) => boundary.headers(headersArgs);
