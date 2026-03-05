import { spawn } from "child_process";

const activeStreams = new Map();

export function startStream(streamKey) {
  if (activeStreams.has(streamKey)) {
    return { ok: true, message: "already running" };
  }

  const rtmpUrl = `rtmp://global-live.mux.com:5222/app/${streamKey}`;

  const ffmpeg = spawn("ffmpeg", [
    "-i", "pipe:0",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-tune", "zerolatency",
    "-c:a", "aac",
    "-ar", "44100",
    "-f", "flv",
    rtmpUrl,
  ], { stdio: ["pipe", "pipe", "pipe"] });

  ffmpeg.stderr.on("data", (data) => {
    const msg = data.toString();
    if (msg.includes("error") || msg.includes("Error")) {
      console.error("ffmpeg:", msg);
    }
  });

  ffmpeg.on("close", (code) => {
    console.log(`ffmpeg exited with code ${code}`);
    activeStreams.delete(streamKey);
  });

  activeStreams.set(streamKey, ffmpeg);
  return { ok: true };
}

export function pushChunk(streamKey, chunk) {
  const ffmpeg = activeStreams.get(streamKey);
  if (!ffmpeg || ffmpeg.stdin.destroyed) {
    return { ok: false, message: "no active stream" };
  }
  try {
    ffmpeg.stdin.write(Buffer.from(chunk));
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

export function stopStream(streamKey) {
  const ffmpeg = activeStreams.get(streamKey);
  if (ffmpeg) {
    try {
      ffmpeg.stdin.end();
    } catch (e) { /* ignore */ }
    setTimeout(() => {
      try { ffmpeg.kill(); } catch (e) { /* ignore */ }
    }, 2000);
    activeStreams.delete(streamKey);
  }
  return { ok: true };
}

export function isStreamActive(streamKey) {
  return activeStreams.has(streamKey);
}
