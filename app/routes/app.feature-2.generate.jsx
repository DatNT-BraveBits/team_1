import { authenticate } from "../shopify.server";
import OpenAI, { toFile } from "openai";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { image, options, fabricDescription, mode, previousImage, editInstructions } =
    await request.json();

  const variations = Math.min(Math.max(options.variations || 1, 1), 4);

  if (mode === "edit" && previousImage && editInstructions?.length > 0) {
    const imageUrls = await editImage(client, previousImage, editInstructions, options, fabricDescription, variations);
    return Response.json({ imageUrls });
  } else {
    const imageUrls = await generateImage(client, options, fabricDescription, variations);
    return Response.json({ imageUrls });
  }
};

async function generateImage(client, options, fabricDescription, variations) {
  const prompt = buildFullPrompt(options, fabricDescription);

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    n: variations,
    size: "1024x1024",
  });

  return response.data.map((d) => `data:image/png;base64,${d.b64_json}`);
}

async function editImage(client, previousImage, editInstructions, options, fabricDescription, variations) {
  // Build a targeted edit prompt
  const editPrompt = buildEditPrompt(editInstructions, options, fabricDescription);

  // Convert base64 data URL to buffer for the API
  const base64Data = previousImage.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");
  const imageFile = await toFile(imageBuffer, "previous.png", { type: "image/png" });

  const response = await client.images.edit({
    model: "gpt-image-1",
    image: imageFile,
    prompt: editPrompt,
    n: variations,
    size: "1024x1024",
  });

  return response.data.map((d) => `data:image/png;base64,${d.b64_json}`);
}

function buildEditPrompt(editInstructions, options, fabricDescription) {
  const parts = [
    "Edit this fashion photograph. Keep the overall composition, model, and unchanged elements exactly the same.",
    "Only modify the following specific aspects:",
  ];

  for (const instruction of editInstructions) {
    parts.push(`- ${instruction}`);
  }

  parts.push(
    "Keep everything else identical to the original image.",
    "Maintain the same professional fashion editorial quality and lighting.",
  );

  return parts.join("\n");
}

function buildFullPrompt(options, fabricDescription) {
  const parts = [
    "Generate a high-end fashion editorial photograph of a model wearing a designer outfit.",
  ];

  if (fabricDescription) {
    parts.push(`The fabric material is: ${fabricDescription}.`);
  }

  if (options.garment) {
    parts.push(`Garment type: ${options.garment}.`);
  }
  if (options.style?.length > 0) {
    parts.push(`Fashion style: ${options.style.join(", ")}.`);
  }
  if (options.color) {
    parts.push(`The primary color of the outfit is ${options.color}.`);
  }
  if (options.nationality) {
    parts.push(`The model should be ${options.nationality}.`);
  }
  if (options.bodyType) {
    parts.push(`Model body type: ${options.bodyType}.`);
  }
  if (options.height) {
    parts.push(`Model height: ${options.height}cm.`);
  }
  if (options.weight) {
    parts.push(`Model weight: ${options.weight}kg.`);
  }
  if (options.bust || options.waist || options.hips) {
    const measurements = [
      options.bust ? `bust ${options.bust}cm` : null,
      options.waist ? `waist ${options.waist}cm` : null,
      options.hips ? `hips ${options.hips}cm` : null,
    ].filter(Boolean).join(", ");
    parts.push(`Model body measurements: ${measurements}.`);
  }
  if (options.pose) {
    parts.push(`Model pose: ${options.pose}.`);
  }
  if (options.background) {
    parts.push(`Background setting: ${options.background}.`);
  }
  if (options.customPrompt) {
    parts.push(`IMPORTANT specific design details: ${options.customPrompt}.`);
  }

  // Prompt strength controls how strictly the AI follows instructions
  const strength = Math.min(Math.max(options.promptStrength || 7, 1), 10);

  if (strength <= 3) {
    parts.push(
      "Use the above descriptions as loose inspiration only.",
      "Feel free to take creative liberties with the design, colors, and styling.",
      "Artistic interpretation is encouraged — the result can differ significantly from the description.",
      "Professional fashion photography, high resolution.",
    );
  } else if (strength <= 5) {
    parts.push(
      "Follow the above descriptions as general guidelines.",
      "Some creative interpretation is acceptable, but keep the core elements recognizable.",
      "Professional fashion photography with good lighting, full body shot, high resolution.",
    );
  } else if (strength <= 7) {
    parts.push(
      "Follow the above descriptions closely.",
      "Professional fashion photography with cinematic lighting.",
      "Full body shot, outfit clearly visible, high resolution, luxury editorial quality.",
    );
  } else if (strength <= 9) {
    parts.push(
      "Follow ALL the above descriptions VERY precisely and accurately.",
      "Every specified detail MUST be clearly visible and exact in the final image.",
      "Professional fashion photography with cinematic lighting.",
      "Full body shot, outfit clearly visible, high resolution, luxury editorial quality.",
      "Do NOT deviate from any of the specified options.",
    );
  } else {
    parts.push(
      "CRITICAL: Follow EVERY SINGLE detail above with ABSOLUTE precision.",
      "The garment, style, color, fabric, pose, background, body type, and ALL measurements MUST be rendered EXACTLY as described.",
      "Zero creative deviation allowed — match the description pixel-perfectly.",
      "Professional fashion photography with cinematic lighting.",
      "Full body shot, outfit clearly visible, ultra high resolution, luxury editorial quality.",
      "Any deviation from the specified details is unacceptable.",
    );
  }

  if (options.negativePrompt) {
    parts.push(`Strictly avoid these elements: ${options.negativePrompt}.`);
  }

  return parts.join(" ");
}
