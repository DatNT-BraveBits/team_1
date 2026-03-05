import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function createLiveStream() {
  const stream = await mux.video.liveStreams.create({
    playback_policy: ["public"],
    new_asset_settings: { playback_policy: ["public"] },
  });
  return {
    streamId: stream.id,
    streamKey: stream.stream_key,
    playbackId: stream.playback_ids?.[0]?.id,
  };
}

export async function getLiveStream(streamId) {
  return mux.video.liveStreams.retrieve(streamId);
}

export async function endLiveStream(streamId) {
  await mux.video.liveStreams.complete(streamId);
}
