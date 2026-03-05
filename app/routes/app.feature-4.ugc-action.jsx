import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const body = await request.json();
  const { id, action: ugcAction } = body;

  if (!id || !ugcAction) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (ugcAction === "approve") {
    await prisma.feature4_UgcPhoto.update({
      where: { id },
      data: { approved: true },
    });
    return Response.json({ success: true });
  }

  if (ugcAction === "reject") {
    await prisma.feature4_UgcPhoto.delete({ where: { id } });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
};

export const headers = (headersArgs) => boundary.headers(headersArgs);
