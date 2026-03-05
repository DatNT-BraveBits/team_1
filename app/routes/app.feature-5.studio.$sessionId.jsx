import { useLoaderData } from "react-router";
import { useState, useRef, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
  const session = await prisma.feature5_LiveSession.findUnique({
    where: { id: params.sessionId },
  });
  if (!session) throw new Response("Not found", { status: 404 });
  return { streamKey: session.muxStreamKey, title: session.title };
};

export default function StreamingStudio() {
  const { streamKey, title } = useLoaderData();
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const startWebcam = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus("previewing");
    } catch (e) {
      if (e.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access in your browser settings.");
      } else {
        setError("Failed to access camera: " + e.message);
      }
    }
  }, []);

  const goLive = useCallback(async () => {
    if (!streamRef.current || !streamKey) return;
    setError(null);
    setStatus("connecting");

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const whipUrl = `https://global-live.mux.com/app/${streamKey}/whip`;
      const res = await fetch(whipUrl, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`WHIP failed (${res.status}): ${text}`);
      }

      const answerSdp = await res.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setStatus("live");
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          setStatus("stopped");
          setError("Connection lost. Try again.");
        }
      };

      setStatus("live");
    } catch (e) {
      setStatus("previewing");
      setError("Failed to connect: " + e.message);
    }
  }, [streamKey]);

  const stop = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (pcRef.current) pcRef.current.close();
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const statusConfig = {
    idle: { label: "Not connected", color: "#718096", bg: "#f7fafc" },
    previewing: { label: "Camera ready", color: "#2b6cb0", bg: "#ebf8ff" },
    connecting: { label: "Connecting...", color: "#b7791f", bg: "#fefcbf" },
    live: { label: "LIVE", color: "#fff", bg: "#e53e3e" },
    stopped: { label: "Stopped", color: "#718096", bg: "#f7fafc" },
  };

  const s = statusConfig[status];

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: "#1a1a2e", color: "#fff", minHeight: "100vh" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
              Streaming Studio
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#a0aec0" }}>
              {title}
            </p>
          </div>
          <span
            style={{
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 700,
              background: s.bg,
              color: s.color,
              letterSpacing: status === "live" ? "1px" : "0",
            }}
          >
            {s.label}
          </span>
        </div>

        {/* Video Preview */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            background: "#111",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              display: status === "idle" || status === "stopped" ? "none" : "block",
            }}
          />
          {(status === "idle" || status === "stopped") && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                color: "#555",
                fontSize: "16px",
              }}
            >
              Camera off
            </div>
          )}
          {status === "live" && (
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                background: "#e53e3e",
                color: "#fff",
                padding: "5px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(229,62,62,0.4)",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#fff",
                  borderRadius: "50%",
                  animation: "blink 1.5s infinite",
                }}
              />
              LIVE
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(229,62,62,0.15)",
              border: "1px solid rgba(229,62,62,0.3)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "12px",
              fontSize: "14px",
              color: "#fc8181",
            }}
          >
            {error}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", gap: "10px" }}>
          {status === "idle" && (
            <button type="button" onClick={startWebcam} style={btnStyle("#008060")}>
              Start Webcam
            </button>
          )}
          {status === "previewing" && (
            <>
              <button type="button" onClick={goLive} style={btnStyle("#e53e3e")}>
                Go Live
              </button>
              <button type="button" onClick={stop} style={btnStyle("#4a5568")}>
                Cancel
              </button>
            </>
          )}
          {status === "connecting" && (
            <button type="button" disabled style={btnStyle("#718096")}>
              Connecting...
            </button>
          )}
          {status === "live" && (
            <button type="button" onClick={stop} style={btnStyle("#e53e3e")}>
              Stop Streaming
            </button>
          )}
          {status === "stopped" && (
            <button type="button" onClick={startWebcam} style={btnStyle("#008060")}>
              Restart Webcam
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function btnStyle(bg) {
  return {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    background: bg,
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "15px",
  };
}
