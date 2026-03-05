import { useState } from "react";

export default function TryOnResult({ imageUrl, productId, productName }) {
  const [ugcState, setUgcState] = useState("prompt"); // prompt | saving | saved | dismissed
  const [customerName, setCustomerName] = useState("");
  const [consent, setConsent] = useState(false);

  async function handleSaveUgc() {
    setUgcState("saving");
    try {
      const res = await fetch("/app/feature-4/save-ugc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          imageUrl,
          customerName: customerName || "Anonymous",
          consentGiven: true,
        }),
      });
      if (res.ok) {
        setUgcState("saved");
      } else {
        setUgcState("prompt");
      }
    } catch {
      setUgcState("prompt");
    }
  }

  return (
    <div>
      {/* Result header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        marginBottom: "10px",
      }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#22c55e",
        }} />
        <s-text variant="bodySm" fontWeight="semibold" tone="success">
          Try-on complete
        </s-text>
      </div>

      {/* Result image */}
      <div style={{
        borderRadius: "12px",
        overflow: "hidden",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
      }}>
        <img
          src={imageUrl}
          alt="Virtual try-on result"
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* UGC Save Prompt — shows after successful try-on */}
      {ugcState === "prompt" && (
        <div style={{
          marginTop: "12px",
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #fde68a",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <span style={{ fontSize: "20px", lineHeight: "1" }}>&#9733;</span>
            <div style={{ flex: 1 }}>
              <s-text variant="bodySm" fontWeight="bold">
                Love this look?
              </s-text>
              <s-text variant="bodySm" tone="subdued">
                Share your try-on photo with {productName}'s community. It helps other shoppers see real fits!
              </s-text>
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name (optional)"
                  style={{
                    width: "100%", padding: "8px 12px", borderRadius: "8px",
                    border: "1px solid #e5e7eb", fontSize: "13px",
                    marginBottom: "8px", boxSizing: "border-box",
                  }}
                />
                <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    style={{ marginTop: "2px" }}
                  />
                  <span style={{ fontSize: "11px", color: "#6b7280", lineHeight: "1.4" }}>
                    I agree to share this photo on the shop's product gallery. My photo may be visible to other shoppers.
                  </span>
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleSaveUgc}
                    disabled={!consent}
                    style={{
                      background: consent ? "#1a1a1a" : "#9ca3af", color: "white", border: "none",
                      opacity: consent ? 1 : 0.6,
                      borderRadius: "8px", padding: "8px 16px",
                      fontSize: "13px", fontWeight: "600", cursor: "pointer",
                    }}
                  >
                    Save to Shop Gallery
                  </button>
                  <button
                    onClick={() => setUgcState("dismissed")}
                    style={{
                      background: "transparent", color: "#6b7280", border: "none",
                      padding: "8px 12px", fontSize: "13px", cursor: "pointer",
                    }}
                  >
                    No thanks
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {ugcState === "saving" && (
        <div style={{
          marginTop: "12px", textAlign: "center", padding: "16px",
          background: "#f9fafb", borderRadius: "12px",
        }}>
          <s-spinner size="small" />
          <s-text variant="bodySm" tone="subdued"> Saving...</s-text>
        </div>
      )}

      {ugcState === "saved" && (
        <div style={{
          marginTop: "12px",
          background: "#f0fdf4",
          borderRadius: "12px",
          padding: "14px 16px",
          border: "1px solid #bbf7d0",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <s-text variant="bodySm" fontWeight="semibold" tone="success">
            Photo saved! The merchant will review it for the shop gallery. Thank you!
          </s-text>
        </div>
      )}
    </div>
  );
}
