import { streamText } from "ai";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { defaultModel } from "../shared/ai.server";
import {
  getProductsByIds,
  formatProductsForAI,
} from "../features/feature-5/utils/products.server";

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { messages } = await request.json();

  const session = await prisma.feature5_LiveSession.findUnique({
    where: { id: params.sessionId },
  });
  if (!session) throw new Response("Session not found", { status: 404 });

  const productIds = JSON.parse(session.productIds);
  const products =
    productIds.length > 0 ? await getProductsByIds(admin, productIds) : [];
  const productContext = formatProductsForAI(products);

  const result = streamText({
    model: defaultModel,
    system: `You are a friendly live shopping assistant helping viewers during a livestream called "${session.title}".

Available products in this stream:
${productContext}

Rules:
- Answer in the same language the viewer uses
- Be concise and enthusiastic
- If asked about a product not in the list, say you can only help with products in this stream
- Include prices and availability when relevant
- Keep responses under 3 sentences unless more detail is asked for`,
    messages,
  });

  return result.toDataStreamResponse();
};
