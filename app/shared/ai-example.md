# AI SDK Usage Examples

## 1. Text Generation (in route loader/action)

```jsx
import { generateText } from "ai";
import { defaultModel } from "../shared/ai.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const { text } = await generateText({
    model: defaultModel,
    prompt: "Write a product description for a red snowboard",
  });

  return { text };
};
```

## 2. Streaming Chat (route + component)

**Route file** (`app/routes/app.feature-N.chat.jsx`):

```jsx
import { streamText } from "ai";
import { defaultModel } from "../shared/ai.server";

export const action = async ({ request }) => {
  const { messages } = await request.json();

  const result = streamText({
    model: defaultModel,
    messages,
  });

  return result.toDataStreamResponse();
};
```

**Component** (`app/features/feature-N/components/Chat.jsx`):

```jsx
import { useChat } from "@ai-sdk/react";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/app/feature-N/chat",
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

## 3. Structured Output (JSON)

```jsx
import { generateObject } from "ai";
import { z } from "zod";
import { defaultModel } from "../shared/ai.server";

const { object } = await generateObject({
  model: defaultModel,
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
  prompt: "Generate SEO metadata for a winter sports store",
});
```

## 4. Switch providers per feature

```jsx
import { openai, anthropic } from "../shared/ai.server";

// Use GPT-4o
const model1 = openai("gpt-4o");

// Use Claude
const model2 = anthropic("claude-sonnet-4-20250514");
```
