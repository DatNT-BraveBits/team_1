import { useSearchParams } from "react-router";
import { useState, useRef, useCallback, useEffect } from "react";

export default function StreamingStudio() {
  const [searchParams] = useSearchParams();
  const streamKey = searchParams.get("key");
  const title = searchParams.get("title") || "Live Stream";

  const videoRef = useRef(null);
  const recorderRef = useRef(null);
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
        setError("Camera permission denied. Please allow camera access.");
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
      // Start server-side ffmpeg process
      const startRes = await fetch(`/api/stream-relay?action=start&key=${encodeURIComponent(streamKey)}`, {
        method: "POST",
      });
      const startData = await startRes.json();
      if (!startData.ok) {
        throw new Error(startData.message || "Failed to start relay");
      }

      // Start MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

      const recorder = new MediaRecorder(streamRef.current, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });
      recorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          try {
            await fetch(`/api/stream-relay?action=chunk&key=${encodeURIComponent(streamKey)}`, {
              method: "POST",
              body: e.data,
            });
          } catch (err) {
            console.error("Failed to send chunk:", err);
          }
        }
      };

      recorder.start(250); // send chunk every 250ms for lower latency
      setStatus("live");
    } catch (e) {
      setStatus("previewing");
      setError("Failed to start: " + e.message);
    }
  }, [streamKey]);

  const stop = useCallback(async () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Stop server-side ffmpeg
    try {
      await fetch(`/api/stream-relay?action=stop&key=${encodeURIComponent(streamKey)}`, {
        method: "POST",
      });
    } catch (e) { /* ignore */ }

    setStatus("idle");
    setError(null);
  }, [streamKey]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (!streamKey) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={{ fontSize: "20px" }}>Missing stream key</h1>
          <p style={{ color: "#a0aec0" }}>Open this page from the Live Shopping manage page.</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    idle: { label: "Not connected", color: "#718096", bg: "#2d3748" },
    previewing: { label: "Camera ready", color: "#63b3ed", bg: "#2a4365" },
    connecting: { label: "Connecting...", color: "#ecc94b", bg: "#744210" },
    live: { label: "LIVE", color: "#fff", bg: "#e53e3e" },
  };

  const s = statusConfig[status];

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>Streaming Studio</h1>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#a0aec0" }}>{title}</p>
          </div>
          <span style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, background: s.bg, color: s.color, letterSpacing: status === "live" ? "1px" : "0" }}>
            {s.label}
          </span>
        </div>

        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: status === "idle" ? "none" : "block" }}
          />
          {status === "idle" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "#555", fontSize: "16px" }}>
              Camera off
            </div>
          )}
          {status === "live" && (
            <div style={{ position: "absolute", top: "14px", left: "14px", background: "#e53e3e", color: "#fff", padding: "5px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(229,62,62,0.4)" }}>
              <span style={{ width: "8px", height: "8px", background: "#fff", borderRadius: "50%", animation: "blink 1.5s infinite" }} />
              LIVE
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "rgba(229,62,62,0.15)", border: "1px solid rgba(229,62,62,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", fontSize: "14px", color: "#fc8181" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          {status === "idle" && (
            <button type="button" onClick={startWebcam} style={btnGreen}>Start Webcam</button>
          )}
          {status === "previewing" && (
            <>
              <button type="button" onClick={goLive} style={btnRed}>Go Live</button>
              <button type="button" onClick={stop} style={btnGray}>Cancel</button>
            </>
          )}
          {status === "connecting" && (
            <button type="button" disabled style={btnGray}>Connecting...</button>
          )}
          {status === "live" && (
            <button type="button" onClick={stop} style={btnRed}>Stop Streaming</button>
          )}
        </div>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

const pageStyle = { margin: 0, padding: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: "#1a1a2e", color: "#fff", minHeight: "100vh" };
const containerStyle = { maxWidth: "860px", margin: "0 auto", padding: "20px" };
const btnBase = { padding: "10px 24px", borderRadius: "8px", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "15px" };
const btnGreen = { ...btnBase, background: "#008060" };
const btnRed = { ...btnBase, background: "#e53e3e" };
const btnGray = { ...btnBase, background: "#4a5568" };
