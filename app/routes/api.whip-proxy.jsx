export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const streamKey = url.searchParams.get("key");
  if (!streamKey) {
    return new Response("Missing stream key", { status: 400 });
  }

  const sdpOffer = await request.text();
  const whipUrl = `https://global-live.mux.com/app/${encodeURIComponent(streamKey)}/whip`;

  const muxRes = await fetch(whipUrl, {
    method: "POST",
    headers: { "Content-Type": "application/sdp" },
    body: sdpOffer,
  });

  const body = await muxRes.text();
  return new Response(body, {
    status: muxRes.status,
    headers: { "Content-Type": muxRes.headers.get("Content-Type") || "application/sdp" },
  });
};
