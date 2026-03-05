# Browser Webcam Streaming via WHIP — Design

**Goal:** Allow merchants to livestream directly from their browser webcam without needing OBS or any external software.

**Approach:** WHIP (WebRTC-HTTP Ingestion Protocol) — client-side only, no server changes needed.

## Architecture

Add "Go Live from Browser" section to the manage session page (`app.feature-5.$sessionId.jsx`). Uses `getUserMedia()` for webcam access and `RTCPeerConnection` to stream to Mux's WHIP endpoint.

## UI

New section above "Stream Configuration":
- Webcam preview (16:9 video element)
- Start Webcam / Go Live / Stop buttons
- Status indicator: idle / previewing / connecting / live / stopped

## Data Flow

```
getUserMedia() → <video> preview → RTCPeerConnection → addTrack(video+audio)
→ POST SDP offer to https://global-live.mux.com/app/{streamKey}/whip
→ Mux returns SDP answer → WebRTC established → HLS → Storefront
```

## Component: BrowserStream

- States: idle → previewing → connecting → live → stopped
- Props: streamKey (from session)
- Client-side only, no backend changes
- Cleanup: stop tracks + close peer connection on unmount or stop

## Error Handling

- Camera permission denied → message asking to allow
- WHIP connection fail → error message + retry
- No stream key → disable button + warning
