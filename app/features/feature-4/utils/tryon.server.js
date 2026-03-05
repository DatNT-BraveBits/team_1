import { generateText } from "ai";
import { openai } from "../../../shared/ai.server";
import prisma from "../../../db.server";

async function tryGptImage1({ photoBase64, productName, productDescription }) {
  const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");
  const mimeMatch = photoBase64.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const ext = mimeType.split("/")[1] || "png";

  const blob = new Blob([imageBuffer], { type: mimeType });
  const formData = new FormData();
  formData.append("model", "gpt-image-1");
  formData.append("image[]", blob, `photo.${ext}`);
  formData.append("prompt",
    `Edit this photo: dress this exact person in a ${productName}. ${productDescription}. ` +
    `Keep the person's face, body, pose, and background exactly the same. ` +
    `Only change their clothing to the described product. ` +
    `Make the clothing look natural with realistic fabric draping and shadows.`
  );
  formData.append("size", "1024x1024");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: formData,
  });

  const data = await response.json();
  console.log("[MirrorAI] gpt-image-1 response:", JSON.stringify(data).slice(0, 300));

  if (data.error) throw new Error(data.error.message);

  if (data.data?.[0]?.b64_json) {
    return `data:image/png;base64,${data.data[0].b64_json}`;
  } else if (data.data?.[0]?.url) {
    return data.data[0].url;
  }
  throw new Error("No image in response");
}

async function fallbackDallE3({ photoBase64, productName, productDescription }) {
  // Describe the person first with vision
  let personDescription = "a person";
  try {
    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [{
        role: "user",
        content: [
          { type: "text", text: `Describe this person in 1 sentence for an image generator. Focus on: gender, body type, skin tone, hair. Do NOT describe clothing. Be concise.` },
          { type: "image", image: photoBase64 },
        ],
      }],
      maxTokens: 80,
    });
    personDescription = result.text;
    console.log("[MirrorAI] Fallback vision OK:", personDescription);
  } catch (err) {
    console.error("[MirrorAI] Fallback vision error:", err.message);
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `Fashion photo: ${personDescription} wearing a ${productName}. ${productDescription}. Natural fit, realistic draping, studio lighting, clean background, full body.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }),
  });

  const data = await response.json();
  console.log("[MirrorAI] DALL-E 3 response:", JSON.stringify(data).slice(0, 200));

  if (data.error) throw new Error(data.error.message);
  return data.data?.[0]?.url || "";
}

export async function generateTryOn({ productId, productName, productDescription, photoBase64 }) {
  let imageUrl;

  // Try gpt-image-1 first (best quality, keeps original face)
  try {
    console.log("[MirrorAI] Trying gpt-image-1...");
    imageUrl = await tryGptImage1({ photoBase64, productName, productDescription });
    console.log("[MirrorAI] gpt-image-1 success!");
  } catch (err) {
    console.error("[MirrorAI] gpt-image-1 failed:", err.message);
    console.log("[MirrorAI] Falling back to DALL-E 3...");

    // Fallback to DALL-E 3 + vision
    try {
      imageUrl = await fallbackDallE3({ photoBase64, productName, productDescription });
      console.log("[MirrorAI] DALL-E 3 fallback success!");
    } catch (err2) {
      console.error("[MirrorAI] DALL-E 3 also failed:", err2.message);
      throw new Error("Image generation failed. Please check your OpenAI API key and billing.");
    }
  }

  const session = await prisma.feature4_TryOnSession.create({
    data: {
      productId,
      photoUrl: "uploaded",
      resultUrl: imageUrl.startsWith("data:") ? "base64_stored" : imageUrl,
    },
  });

  return { imageUrl, sessionId: session.id };
}
