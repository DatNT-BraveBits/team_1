import { useState, useRef, useCallback, useEffect } from "react";

export default function BrowserStream({ streamKey }) {
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
        throw new Error(`WHIP request failed: ${res.status}`);
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

  if (!streamKey) {
    return (
      <s-card>
        <s-box padding="base">
          <s-text tone="caution">
            No stream key available. Create a new session to get one.
          </s-text>
        </s-box>
      </s-card>
    );
  }

  const statusLabel = {
    idle: "Not connected",
    previewing: "Camera ready — click Go Live",
    connecting: "Connecting...",
    live: "LIVE",
    stopped: "Stopped",
  };

  const statusTone = {
    idle: "default",
    previewing: "info",
    connecting: "info",
    live: "success",
    stopped: "default",
  };

  return (
    <s-card>
      <s-box padding="base">
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            background: "#111",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "12px",
            display: status === "idle" ? "none" : "block",
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
            }}
          />
          {status === "live" && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                background: "#e53e3e",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1px",
              }}
            >
              LIVE
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <s-badge tone={statusTone[status]}>{statusLabel[status]}</s-badge>
        </div>

        {error && (
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #feb2b2",
              borderRadius: "6px",
              padding: "8px 12px",
              marginBottom: "8px",
              fontSize: "13px",
              color: "#c53030",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          {status === "idle" && (
            <button
              type="button"
              onClick={startWebcam}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#008060",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Start Webcam
            </button>
          )}
          {status === "previewing" && (
            <>
              <button
                type="button"
                onClick={goLive}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#e53e3e",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Go Live
              </button>
              <button
                type="button"
                onClick={stop}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
            </>
          )}
          {status === "connecting" && (
            <button
              type="button"
              disabled
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#ccc",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Connecting...
            </button>
          )}
          {status === "live" && (
            <button
              type="button"
              onClick={stop}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#e53e3e",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Stop Streaming
            </button>
          )}
          {status === "stopped" && (
            <button
              type="button"
              onClick={startWebcam}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#008060",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Restart Webcam
            </button>
          )}
        </div>
      </s-box>
    </s-card>
  );
}
