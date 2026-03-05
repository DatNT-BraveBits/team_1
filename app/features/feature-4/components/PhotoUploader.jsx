import { useState, useRef } from "react";

export default function PhotoUploader({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!preview) return;
    onUpload({
      photoBase64: preview,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div style={{
          width: "24px", height: "24px", borderRadius: "50%",
          background: preview ? "#22c55e" : "#5C6AC4", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "700",
        }}>
          {preview ? "\u2713" : "1"}
        </div>
        <s-text variant="bodySm" fontWeight="semibold">Upload photo</s-text>
        <div style={{ width: "24px", height: "1px", background: "#ddd" }} />
        <div style={{
          width: "24px", height: "24px", borderRadius: "50%",
          background: "#e5e7eb", color: "#6b7280",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "700",
        }}>
          2
        </div>
        <s-text variant="bodySm" tone="subdued">Measurements</s-text>
        <div style={{ width: "24px", height: "1px", background: "#ddd" }} />
        <div style={{
          width: "24px", height: "24px", borderRadius: "50%",
          background: "#e5e7eb", color: "#6b7280",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "700",
        }}>
          3
        </div>
        <s-text variant="bodySm" tone="subdued">Try on</s-text>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Upload area */}
      {preview ? (
        <div style={{ position: "relative" }}>
          <img
            src={preview}
            alt="Your photo"
            style={{
              width: "100%",
              maxHeight: "280px",
              objectFit: "contain",
              borderRadius: "12px",
              background: "#f9fafb",
            }}
          />
          <button
            onClick={() => setPreview(null)}
            style={{
              position: "absolute", top: "8px", right: "8px",
              background: "rgba(0,0,0,0.6)", color: "white",
              border: "none", borderRadius: "20px",
              padding: "4px 12px", cursor: "pointer",
              fontSize: "12px", fontWeight: "500",
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "40px 20px",
            border: `2px dashed ${dragActive ? "#5C6AC4" : "#d1d5db"}`,
            borderRadius: "12px",
            textAlign: "center",
            cursor: "pointer",
            background: dragActive ? "#f0f0ff" : "#fafafa",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto", display: "block" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <s-text variant="bodyMd" fontWeight="semibold">
            Drop your photo here or click to browse
          </s-text>
          <s-text variant="bodySm" tone="subdued">
            People, pets, anything — we fit them all!
          </s-text>
        </div>
      )}

      {/* Body measurements */}
      <div style={{
        background: "#f9fafb",
        borderRadius: "10px",
        padding: "16px",
      }}>
        <s-text variant="bodySm" fontWeight="semibold">
          Body measurements
        </s-text>
        <s-text variant="bodySm" tone="subdued">
          Optional — helps our AI recommend the perfect size
        </s-text>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="165"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "1px solid #e5e7eb", marginTop: "4px",
                fontSize: "14px", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="55"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "1px solid #e5e7eb", marginTop: "4px",
                fontSize: "14px", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <s-button
        variant="primary"
        size="large"
        disabled={!preview}
        onClick={handleSubmit}
      >
        Try It On!
      </s-button>
    </div>
  );
}
