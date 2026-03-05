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
    const params = new URLSearchParams({
      key: streamKey,
      title: title || "Live Stream",
    });
    const url = `/streaming-studio?${params.toString()}`;
    window.open(url, "live-studio", "width=900,height=700");
  };

  return (
    <s-card>
      <s-box padding="base">
        <s-stack direction="block" gap="base">
          <s-text variant="bodySm">
            Opens a streaming studio in a new window with webcam access.
          </s-text>
          <s-button variant="primary" onClick={openStudio}>
            Open Streaming Studio
          </s-button>
        </s-stack>
      </s-box>
    </s-card>
  );
}
