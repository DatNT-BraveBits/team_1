import { generateText } from "ai";
import { defaultModel } from "../../../shared/ai.server";
import prisma from "../../../db.server";

export async function getSizeAdvice({ productId, height, weight }) {
  const product = await prisma.feature4_Product.findUnique({
    where: { id: productId },
    include: { sizeCharts: true },
  });

  if (!product) throw new Error("Product not found");

  const sizeChartText = product.sizeCharts
    .map((s) => `${s.size}: chest=${s.chest}cm, waist=${s.waist}cm, hips=${s.hips}cm, shoulder=${s.shoulder}cm (${s.notes})`)
    .join("\n");

  const { text } = await generateText({
    model: defaultModel,
    prompt: `You are a smart size advisor for an online clothing store. Be friendly, specific, and helpful.

Product: ${product.name}
Description: ${product.description}

Size chart:
${sizeChartText}

Customer info:
- Height: ${height ? height + "cm" : "not provided"}
- Weight: ${weight ? weight + "kg" : "not provided"}

Based on the customer's body measurements and the size chart, recommend the best size. Explain your reasoning briefly. If there are fit concerns (e.g., might be tight at shoulders), mention them helpfully. Keep response to 2-3 sentences. Use a warm, confident tone.`,
  });

  return { advice: text, product: product.name };
}
