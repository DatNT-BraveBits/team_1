import { generateText } from "ai";
import { openai } from "../../../shared/ai.server";
import prisma from "../../../db.server";

export async function generateTryOn({ productId, productName, productDescription, photoBase64 }) {
  // Step 1: GPT-4o vision — describe the person/subject from their photo
  const { text: personDescription } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Describe this person/subject in 1 short sentence for an AI image generator. Focus ONLY on: gender, body type, skin tone, hair style/color, pose. Do NOT describe their current clothing. Be concise. Example: "A slim East Asian woman with shoulder-length black hair, light skin, standing straight facing camera."`,
          },
          {
            type: "image",
            image: photoBase64,
          },
        ],
      },
    ],
    maxTokens: 100,
  });

  // Step 2: DALL-E 3 — generate try-on image using person description + product
  const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `Fashion try-on photo: ${personDescription} wearing a ${productName}. ${productDescription}. The clothing fits naturally on this specific person with realistic fabric draping, proper shadows, and correct proportions. Studio lighting, clean white background, full body shot, professional product photography.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }),
  });

  const imageData = await imageResponse.json();

  if (imageData.error) {
    throw new Error(imageData.error.message || "Image generation failed");
  }

  const imageUrl = imageData.data?.[0]?.url || "";

  const session = await prisma.feature4_TryOnSession.create({
    data: {
      productId,
      photoUrl: "uploaded",
      resultUrl: imageUrl,
    },
  });

  return { imageUrl, description: personDescription, sessionId: session.id };
}
