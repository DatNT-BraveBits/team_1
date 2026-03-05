import { startStream, pushChunk, stopStream } from "../features/feature-5/utils/stream-manager.server";

export const action = async ({ request }) => {
  const url = new URL(request.url);
  const streamKey = url.searchParams.get("key");
  const act = url.searchParams.get("action");

  if (!streamKey) {
    return Response.json({ ok: false, message: "Missing stream key" }, { status: 400 });
  }

  if (act === "start") {
    const result = startStream(streamKey);
    return Response.json(result);
  }

  if (act === "chunk") {
    const arrayBuffer = await request.arrayBuffer();
    const result = pushChunk(streamKey, arrayBuffer);
    return Response.json(result);
  }

  if (act === "stop") {
    const result = stopStream(streamKey);
    return Response.json(result);
  }

  return Response.json({ ok: false, message: "Unknown action" }, { status: 400 });
};
