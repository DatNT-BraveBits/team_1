export default function BrowserStream({ streamKey, sessionId, title }) {
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

  const openStudio = () => {
    const params = new URLSearchParams({ key: streamKey, title: title || "Live Stream" });
    const url = `/streaming-studio?${params.toString()}`;
    window.open(url, "live-studio", "width=900,height=700");
  };

  return (
    <s-card>
      <s-box padding="base">
        <s-text variant="bodySm">
          Opens a streaming studio in a new window with webcam access.
        </s-text>
        <div style={{ marginTop: "10px" }}>
          <button
            type="button"
            onClick={openStudio}
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
            Open Streaming Studio
          </button>
        </div>
      </s-box>
    </s-card>
  );
}
