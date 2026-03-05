import prisma from "../db.server";

export const loader = async ({ params }) => {
  const session = await prisma.feature5_LiveSession.findUnique({
    where: { id: params.sessionId },
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const productIds = JSON.parse(session.productIds || "[]");

  // Build a simplified product list for the storefront
  // In production, you'd cache this or use metafields
  const products = productIds.map((id) => ({
    id,
    title: "Product",
    price: "0.00",
    image: "",
    handle: "",
  }));

  const data = {
    id: session.id,
    title: session.title,
    status: session.status,
    playbackId: session.muxPlaybackId,
    pinnedProduct: null,
    products,
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
