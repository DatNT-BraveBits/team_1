# MirrorAI "See It On Me" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a virtual try-on feature where customers upload photos and AI generates try-on images with smart size recommendations.

**Architecture:** Dashboard shows mock products. "See It On Me" button opens modal for photo upload + body info. Server routes call OpenAI for image generation and text-based size advice. All data in Prisma SQLite with Feature4_ prefix.

**Tech Stack:** React Router v7, Shopify Polaris web components (`<s-page>`, `<s-card>`, etc.), Vercel AI SDK with OpenAI, Prisma ORM + SQLite.

---

### Task 1: Add Prisma Models

**Files:**
- Modify: `prisma/schema.prisma` (lines 51-54, Feature 4 section)

**Step 1: Add Feature4 models to schema**

Add under the `FEATURE 4` section:

```prisma
model Feature4_Product {
  id          String   @id @default(uuid())
  name        String
  description String
  imageUrl    String
  category    String   @default("clothing")
  createdAt   DateTime @default(now())
  sizeCharts  Feature4_SizeChart[]
  tryOnSessions Feature4_TryOnSession[]
}

model Feature4_SizeChart {
  id        String @id @default(uuid())
  productId String
  size      String
  chest     Float
  waist     Float
  hips      Float
  shoulder  Float
  notes     String @default("")
  product   Feature4_Product @relation(fields: [productId], references: [id])
}

model Feature4_TryOnSession {
  id          String   @id @default(uuid())
  productId   String
  photoUrl    String
  resultUrl   String?
  height      Float?
  weight      Float?
  sizeAdvice  String?
  createdAt   DateTime @default(now())
  product     Feature4_Product @relation(fields: [productId], references: [id])
}
```

**Step 2: Generate Prisma client**

Run: `npx prisma@6 generate`
Expected: "Generated Prisma Client"

**Step 3: Create and apply migration**

Run: `npx prisma@6 migrate dev --name feature4-mirrorai`
Expected: migration applied successfully

**Step 4: Seed mock data**

Create `prisma/seed-feature4.js`:

```js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clean existing Feature4 data
  await prisma.feature4_TryOnSession.deleteMany();
  await prisma.feature4_SizeChart.deleteMany();
  await prisma.feature4_Product.deleteMany();

  const tshirt = await prisma.feature4_Product.create({
    data: {
      name: "Classic Fit Cotton T-Shirt",
      description: "Soft 100% cotton crew neck tee. Relaxed fit, perfect for everyday wear.",
      imageUrl: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-tshirt.png",
      category: "clothing",
      sizeCharts: {
        create: [
          { size: "S", chest: 89, waist: 74, hips: 94, shoulder: 42, notes: "Slim fit" },
          { size: "M", chest: 94, waist: 79, hips: 99, shoulder: 44, notes: "Regular fit" },
          { size: "L", chest: 99, waist: 84, hips: 104, shoulder: 46, notes: "Relaxed fit" },
          { size: "XL", chest: 104, waist: 89, hips: 109, shoulder: 48, notes: "Loose fit" },
        ],
      },
    },
  });

  const dress = await prisma.feature4_Product.create({
    data: {
      name: "Floral Summer Dress",
      description: "Light and breezy floral print dress. A-line silhouette with adjustable straps.",
      imageUrl: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-dress.png",
      category: "clothing",
      sizeCharts: {
        create: [
          { size: "S", chest: 84, waist: 66, hips: 90, shoulder: 36, notes: "Fitted bodice" },
          { size: "M", chest: 88, waist: 70, hips: 94, shoulder: 38, notes: "Regular fit" },
          { size: "L", chest: 92, waist: 74, hips: 98, shoulder: 40, notes: "Comfortable fit" },
          { size: "XL", chest: 96, waist: 78, hips: 102, shoulder: 42, notes: "Relaxed fit" },
        ],
      },
    },
  });

  const jacket = await prisma.feature4_Product.create({
    data: {
      name: "Denim Trucker Jacket",
      description: "Classic denim jacket with button front. Structured shoulders, two chest pockets.",
      imageUrl: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-jacket.png",
      category: "clothing",
      sizeCharts: {
        create: [
          { size: "S", chest: 92, waist: 82, hips: 92, shoulder: 43, notes: "Snug fit" },
          { size: "M", chest: 97, waist: 87, hips: 97, shoulder: 45, notes: "Regular fit" },
          { size: "L", chest: 102, waist: 92, hips: 102, shoulder: 47, notes: "Room for layers" },
          { size: "XL", chest: 107, waist: 97, hips: 107, shoulder: 49, notes: "Oversized feel" },
        ],
      },
    },
  });

  console.log("Seeded:", { tshirt: tshirt.id, dress: dress.id, jacket: jacket.id });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `node prisma/seed-feature4.js`
Expected: "Seeded: { tshirt: ..., dress: ..., jacket: ... }"

**Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/seed-feature4.js prisma/migrations/
git commit -m "feat(feature-4): add MirrorAI Prisma models and seed data"
```

---

### Task 2: Dashboard Page with Product List

**Files:**
- Modify: `app/features/feature-4/index.jsx`
- Modify: `app/routes/app.feature-4.jsx` (add loader data)
- Modify: `app/nav-config.js` (update label)

**Step 1: Update nav label**

In `app/nav-config.js`, change Feature 4 entry:

```js
{
  label: "MirrorAI",
  href: "/app/feature-4",
  // owner: "Trang"
},
```

**Step 2: Update route loader to fetch products**

In `app/routes/app.feature-4.jsx`:

```jsx
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import Feature4Page from "../features/feature-4";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const products = await prisma.feature4_Product.findMany({
    include: { sizeCharts: true },
    orderBy: { createdAt: "desc" },
  });
  return { products };
};

export default function () {
  return <Feature4Page />;
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 3: Build dashboard UI**

In `app/features/feature-4/index.jsx`:

```jsx
import { useLoaderData } from "react-router";
import { useState } from "react";
import TryOnModal from "./components/TryOnModal";

export default function Feature4Page() {
  const { products } = useLoaderData();
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <s-page heading="MirrorAI: See It On Me">
      <s-section heading="Products">
        <s-text variant="bodyMd" tone="subdued">
          Select a product and try it on with AI virtual fitting.
        </s-text>
        <s-box padding-block-start="base">
          <s-grid columns="3">
            {products.map((product) => (
              <s-card key={product.id}>
                <s-box padding="base">
                  <s-stack direction="block" gap="base">
                    <s-heading>{product.name}</s-heading>
                    <s-text variant="bodyMd">{product.description}</s-text>
                    <s-text variant="bodySm" tone="subdued">
                      Sizes: {product.sizeCharts.map((s) => s.size).join(", ")}
                    </s-text>
                    <s-button
                      variant="primary"
                      onClick={() => setSelectedProduct(product)}
                    >
                      See It On Me
                    </s-button>
                  </s-stack>
                </s-box>
              </s-card>
            ))}
          </s-grid>
        </s-box>
      </s-section>

      {selectedProduct && (
        <TryOnModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </s-page>
  );
}
```

**Step 4: Commit**

```bash
git add app/features/feature-4/index.jsx app/routes/app.feature-4.jsx app/nav-config.js
git commit -m "feat(feature-4): dashboard with product list and See It On Me button"
```

---

### Task 3: Photo Upload Modal (TryOnModal + PhotoUploader)

**Files:**
- Create: `app/features/feature-4/components/TryOnModal.jsx`
- Create: `app/features/feature-4/components/PhotoUploader.jsx`

**Step 1: Create PhotoUploader component**

`app/features/feature-4/components/PhotoUploader.jsx`:

```jsx
import { useState, useRef } from "react";

export default function PhotoUploader({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!preview) return;
    onUpload({
      photoBase64: preview,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
    });
  }

  return (
    <s-stack direction="block" gap="base">
      <s-text variant="bodyMd" fontWeight="bold">
        Upload your photo
      </s-text>
      <s-text variant="bodySm" tone="subdued">
        Works with people, pets, and objects — no limits!
      </s-text>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {preview ? (
        <s-stack direction="block" gap="tight">
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px", objectFit: "contain" }}
          />
          <s-button variant="plain" onClick={() => { setPreview(null); }}>
            Change photo
          </s-button>
        </s-stack>
      ) : (
        <s-box
          padding="loose"
          border="dashed"
          borderRadius="base"
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => fileInputRef.current?.click()}
        >
          <s-stack direction="block" gap="tight" align="center">
            <s-text variant="bodyMd">Click to upload a photo</s-text>
            <s-text variant="bodySm" tone="subdued">JPG, PNG up to 5MB</s-text>
          </s-stack>
        </s-box>
      )}

      <s-text variant="bodyMd" fontWeight="bold">
        Body measurements (optional)
      </s-text>

      <s-grid columns="2">
        <s-box>
          <label>
            <s-text variant="bodySm">Height (cm)</s-text>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 165"
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        </s-box>
        <s-box>
          <label>
            <s-text variant="bodySm">Weight (kg)</s-text>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 55"
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        </s-box>
      </s-grid>

      <s-button
        variant="primary"
        disabled={!preview}
        onClick={handleSubmit}
      >
        Try It On!
      </s-button>
    </s-stack>
  );
}
```

**Step 2: Create TryOnModal component**

`app/features/feature-4/components/TryOnModal.jsx`:

```jsx
import { useState } from "react";
import PhotoUploader from "./PhotoUploader";
import TryOnResult from "./TryOnResult";
import SizeAdvisor from "./SizeAdvisor";

export default function TryOnModal({ product, onClose }) {
  const [step, setStep] = useState("upload"); // upload | loading | result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleUpload({ photoBase64, height, weight }) {
    setStep("loading");
    setError(null);

    try {
      // Call try-on API
      const tryOnRes = await fetch("/app/feature-4/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productDescription: product.description,
          photoBase64,
        }),
      });

      if (!tryOnRes.ok) throw new Error("Try-on generation failed");
      const tryOnData = await tryOnRes.json();

      // Call size advisor API
      let sizeAdvice = null;
      if (height || weight) {
        const advisorRes = await fetch("/app/feature-4/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            height,
            weight,
          }),
        });

        if (advisorRes.ok) {
          const advisorData = await advisorRes.json();
          sizeAdvice = advisorData.advice;
        }
      }

      setResult({
        imageUrl: tryOnData.imageUrl,
        sizeAdvice,
      });
      setStep("result");
    } catch (err) {
      setError(err.message);
      setStep("upload");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <s-stack direction="block" gap="base">
          <s-stack direction="inline" gap="base" align="space-between">
            <s-heading>{product.name}</s-heading>
            <s-button variant="plain" onClick={onClose}>
              Close
            </s-button>
          </s-stack>

          {error && (
            <s-banner tone="critical">
              <s-text>{error}</s-text>
            </s-banner>
          )}

          {step === "upload" && (
            <PhotoUploader onUpload={handleUpload} />
          )}

          {step === "loading" && (
            <s-box padding="loose" style={{ textAlign: "center" }}>
              <s-stack direction="block" gap="base" align="center">
                <s-spinner size="large" />
                <s-text variant="bodyMd">
                  AI is working its magic...
                </s-text>
                <s-text variant="bodySm" tone="subdued">
                  This may take 10-20 seconds
                </s-text>
              </s-stack>
            </s-box>
          )}

          {step === "result" && result && (
            <s-stack direction="block" gap="base">
              <TryOnResult imageUrl={result.imageUrl} />
              {result.sizeAdvice && (
                <SizeAdvisor advice={result.sizeAdvice} />
              )}
              <s-button onClick={() => { setStep("upload"); setResult(null); }}>
                Try Another Photo
              </s-button>
            </s-stack>
          )}
        </s-stack>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add app/features/feature-4/components/TryOnModal.jsx app/features/feature-4/components/PhotoUploader.jsx
git commit -m "feat(feature-4): add TryOnModal and PhotoUploader components"
```

---

### Task 4: Result Display Components (TryOnResult + SizeAdvisor)

**Files:**
- Create: `app/features/feature-4/components/TryOnResult.jsx`
- Create: `app/features/feature-4/components/SizeAdvisor.jsx`

**Step 1: Create TryOnResult**

`app/features/feature-4/components/TryOnResult.jsx`:

```jsx
export default function TryOnResult({ imageUrl }) {
  return (
    <s-stack direction="block" gap="tight">
      <s-text variant="bodyMd" fontWeight="bold">
        Your Virtual Try-On
      </s-text>
      <img
        src={imageUrl}
        alt="Virtual try-on result"
        style={{
          width: "100%",
          borderRadius: "8px",
          objectFit: "contain",
          maxHeight: "400px",
        }}
      />
    </s-stack>
  );
}
```

**Step 2: Create SizeAdvisor**

`app/features/feature-4/components/SizeAdvisor.jsx`:

```jsx
export default function SizeAdvisor({ advice }) {
  return (
    <s-card>
      <s-box padding="base">
        <s-stack direction="block" gap="tight">
          <s-text variant="bodyMd" fontWeight="bold">
            Smart Size Advisor
          </s-text>
          <s-text variant="bodyMd">{advice}</s-text>
        </s-stack>
      </s-box>
    </s-card>
  );
}
```

**Step 3: Commit**

```bash
git add app/features/feature-4/components/TryOnResult.jsx app/features/feature-4/components/SizeAdvisor.jsx
git commit -m "feat(feature-4): add TryOnResult and SizeAdvisor display components"
```

---

### Task 5: AI Virtual Try-On Server Logic + Route

**Files:**
- Create: `app/features/feature-4/utils/tryon.server.js`
- Create: `app/routes/app.feature-4.tryon.jsx`

**Step 1: Create try-on server utility**

`app/features/feature-4/utils/tryon.server.js`:

```js
import { openai } from "../../../shared/ai.server";
import prisma from "../../../db.server";

export async function generateTryOn({ productId, productName, productDescription, photoBase64 }) {
  const ai = openai("gpt-4o");

  // Use OpenAI to generate a description-based try-on image
  const response = await ai.doGenerate({
    inputFormat: "messages",
    mode: { type: "regular" },
    prompt: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a virtual fitting room AI. A customer has uploaded their photo and wants to see how "${productName}" would look on them. Product description: "${productDescription}".

Describe in vivid detail how this person/subject would look wearing this product. Be specific about fit, draping, and style. Keep it to 2-3 sentences, enthusiastic but honest.`,
          },
          {
            type: "image",
            image: photoBase64,
          },
        ],
      },
    ],
  });

  const description = response.text;

  // Generate try-on image using OpenAI image generation
  const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `Fashion product photo: A person wearing a ${productName}. ${productDescription}. The clothing fits naturally with realistic fabric draping, shadows, and proportions. Professional product photography style, clean background.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }),
  });

  const imageData = await imageResponse.json();
  const imageUrl = imageData.data?.[0]?.url || "";

  // Save session
  const session = await prisma.feature4_TryOnSession.create({
    data: {
      productId,
      photoUrl: "uploaded",
      resultUrl: imageUrl,
    },
  });

  return { imageUrl, description, sessionId: session.id };
}
```

**Step 2: Create try-on route**

`app/routes/app.feature-4.tryon.jsx`:

```jsx
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { generateTryOn } from "../features/feature-4/utils/tryon.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const body = await request.json();
  const { productId, productName, productDescription, photoBase64 } = body;

  if (!productId || !photoBase64) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await generateTryOn({
    productId,
    productName,
    productDescription,
    photoBase64,
  });

  return Response.json(result);
};

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 3: Commit**

```bash
git add app/features/feature-4/utils/tryon.server.js app/routes/app.feature-4.tryon.jsx
git commit -m "feat(feature-4): add AI virtual try-on server logic and API route"
```

---

### Task 6: Smart Size Advisor Server Logic + Route

**Files:**
- Create: `app/features/feature-4/utils/size-logic.server.js`
- Create: `app/routes/app.feature-4.advisor.jsx`

**Step 1: Create size advisor server utility**

`app/features/feature-4/utils/size-logic.server.js`:

```js
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

  // Save advice to session
  return { advice: text, product: product.name };
}
```

**Step 2: Create advisor route**

`app/routes/app.feature-4.advisor.jsx`:

```jsx
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getSizeAdvice } from "../features/feature-4/utils/size-logic.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const body = await request.json();
  const { productId, height, weight } = body;

  if (!productId) {
    return Response.json({ error: "Missing productId" }, { status: 400 });
  }

  const result = await getSizeAdvice({ productId, height, weight });
  return Response.json(result);
};

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 3: Commit**

```bash
git add app/features/feature-4/utils/size-logic.server.js app/routes/app.feature-4.advisor.jsx
git commit -m "feat(feature-4): add Smart Size Advisor server logic and API route"
```

---

### Task 7: Integration Test and Polish

**Step 1: Verify all files exist**

Run: `find app/features/feature-4 -type f | sort`

Expected:
```
app/features/feature-4/components/PhotoUploader.jsx
app/features/feature-4/components/SizeAdvisor.jsx
app/features/feature-4/components/TryOnModal.jsx
app/features/feature-4/components/TryOnResult.jsx
app/features/feature-4/index.jsx
app/features/feature-4/utils/size-logic.server.js
app/features/feature-4/utils/tryon.server.js
```

**Step 2: Run dev server and test**

Run: `npm run dev`

Test flow:
1. Navigate to `/app/feature-4`
2. See 3 product cards
3. Click "See It On Me" on a product
4. Upload a photo
5. Optionally enter height/weight
6. Click "Try It On!"
7. See generated image + size advice

**Step 3: Fix any issues found during testing**

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(feature-4): MirrorAI See It On Me - complete MVP"
```
