// Route: /app/feature-3
// Owner: Gavin — edit app/features/feature-3/ instead of this file
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import Feature3Page from "../features/feature-3";
import { uploadGifToProduct } from "../features/feature-3/utils/shopify-upload.server";
import { generateText } from "ai";
import { defaultModel } from "../shared/ai.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "removeBg") {
    const imageFile = formData.get("imageFile");
    if (!imageFile || imageFile.size === 0) return { bgError: "No image provided" };

    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64 = buffer.toString("base64");

      // Use OpenAI gpt-image-1 to remove background
      const res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: (() => {
          const fd = new FormData();
          fd.append("model", "gpt-image-1");
          fd.append("image", new Blob([buffer], { type: imageFile.type || "image/png" }), "image.png");
          fd.append("prompt", "Remove the background completely. Keep only the main subject with a transparent background. Do not change the subject at all.");
          fd.append("size", "1024x1024");
          fd.append("background", "transparent");
          fd.append("output_format", "png");
          return fd;
        })(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
      }

      const result = await res.json();
      const imageBase64 = result.data?.[0]?.b64_json;
      if (!imageBase64) throw new Error("Failed to generate image");

      return { bgResult: `data:image/png;base64,${imageBase64}` };
    } catch (err) {
      return { bgError: err.message };
    }
  }

  if (actionType === "generateAlt") {
    const productTitle = formData.get("productTitle") || "";
    const imageCount = formData.get("imageCount") || "1";
    const effect = formData.get("effect") || "none";

    try {
      const { text } = await generateText({
        model: defaultModel,
        prompt: `Generate a short, descriptive alt text (max 125 characters) for an animated GIF product image. Context:
- Product: ${productTitle || "a product"}
- The GIF contains ${imageCount} image(s) animated together
- Animation effect: ${effect}
Return ONLY the alt text, nothing else.`,
      });
      return { altText: text.trim() };
    } catch (err) {
      return { altError: err.message };
    }
  }

  if (actionType === "save") {
    const productId = formData.get("productId");
    const gifFile = formData.get("gifFile");
    const altText = formData.get("altText") || "Animated GIF";

    if (!productId) return { error: "No product selected" };
    if (!gifFile || gifFile.size === 0) return { error: "No GIF file provided" };

    try {
      await uploadGifToProduct(admin, productId, gifFile, altText);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  }

  return { error: "Invalid action" };
};

export default function () {
  return <Feature3Page />;
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
