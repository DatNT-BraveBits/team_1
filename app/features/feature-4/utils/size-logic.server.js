import { generateObject } from "ai";
import { z } from "zod";
import { defaultModel } from "../../../shared/ai.server";
import prisma from "../../../db.server";

const sizeAdviceSchema = z.object({
  recommendedSize: z.string(),
  confidence: z.number().min(1).max(10),
  summary: z.string(),
  fitWarnings: z.array(z.object({
    bodyPart: z.string(),
    issue: z.string(),
    severity: z.enum(["info", "warning", "critical"]),
  })),
  comparedToPrevious: z.string().nullable(),
});

export async function getSizeAdvice({ productId, height, weight, customerId }) {
  const product = await prisma.feature4_Product.findUnique({
    where: { id: productId },
    include: { sizeCharts: true },
  });

  if (!product) throw new Error("Product not found");

  const sizeChartText = product.sizeCharts
    .map((s) => `${s.size}: chest=${s.chest}cm, waist=${s.waist}cm, hips=${s.hips}cm, shoulder=${s.shoulder}cm (${s.notes})`)
    .join("\n");

  // Fetch purchase history for comparison
  const previousPurchases = await prisma.feature4_PurchaseHistory.findMany({
    where: { customerId: customerId || "customer-demo-001" },
    include: { product: { include: { sizeCharts: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const purchaseHistoryText = previousPurchases.length > 0
    ? previousPurchases.map((p) =>
        `- ${p.productName} (size ${p.size}): ${p.fitFeedback || "no feedback"}${p.returned ? " [RETURNED: " + p.returnReason + "]" : ""}`
      ).join("\n")
    : "No previous purchases";

  const { object } = await generateObject({
    model: defaultModel,
    schema: sizeAdviceSchema,
    prompt: `You are a smart size advisor. Analyze and recommend the best size.

Product: ${product.name}
Description: ${product.description}

Size chart:
${sizeChartText}

Customer info:
- Height: ${height ? height + "cm" : "not provided"}
- Weight: ${weight ? weight + "kg" : "not provided"}

Previous purchases:
${purchaseHistoryText}

Instructions:
1. Recommend the best size based on body measurements and size chart
2. Give a confidence score 1-10
3. List specific fit warnings for body parts (shoulder, chest, waist, hips) with severity
4. If there are previous purchases, compare: "You bought [product] in size [X] which was [feedback]. For this product, we recommend [Y] because..."
5. Summary should be 1-2 friendly sentences
6. Be warm and helpful, not clinical`,
  });

  return {
    advice: object.summary,
    recommendedSize: object.recommendedSize,
    confidence: object.confidence,
    fitWarnings: object.fitWarnings,
    comparedToPrevious: object.comparedToPrevious,
    product: product.name,
  };
}
