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

  const products = JSON.parse(session.productData || "[]");

  const pinnedProduct = session.pinnedProductId
    ? products.find((p) => p.id === session.pinnedProductId) || null
    : null;

  const appUrl = process.env.SHOPIFY_APP_URL || "";
  const wsProtocol = appUrl.startsWith("https") ? "wss" : "ws";
  const wsHost = appUrl.replace(/^https?:\/\//, "");

  const data = {
    id: session.id,
    title: session.title,
    status: session.status,
    playbackId: session.muxPlaybackId,
    wsUrl: `${wsProtocol}://${wsHost}/ws/chat/${session.id}`,
    pinnedProduct,
    products: products.filter((p) => p.id !== session.pinnedProductId),
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
