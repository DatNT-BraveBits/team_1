import { useRef, useState } from "react";

const FABRIC_TAGS = [
  "Linen", "Silk Satin", "Denim Twill", "Cotton Poplin", "Wool Crepe",
  "Cashmere", "Organza", "Velvet", "Chiffon", "Leather",
];

export function FabricUploader({
  imagePreview,
  onImageSelect,
  fabricDescription,
  onDescriptionChange,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readFile(file);
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => onImageSelect(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) readFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTagClick = (tag) => {
    const current = fabricDescription;
    if (current.includes(tag)) {
      // Remove tag and clean up separators
      const cleaned = current
        .replace(tag, "")
        .replace(/, ,/g, ",")
        .replace(/^,\s*/, "")
        .replace(/,\s*$/, "")
        .trim();
      onDescriptionChange(cleaned);
    } else {
      const sep = current && !current.endsWith(" ") ? ", " : "";
      onDescriptionChange(current + sep + tag);
    }
  };

  return (
    <div>
      {imagePreview ? (
        <div className="f2-swatch-container">
          <img src={imagePreview} alt="Fabric" className="f2-swatch" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid var(--f2-border)",
                background: "#fff",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "500",
                color: "#888",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: "var(--f2-sans)",
                transition: "all 250ms var(--f2-ease)",
                marginBottom: "12px",
              }}
            >
              Replace
            </button>
            <textarea
              className="f2-textarea"
              value={fabricDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe the fabric — weight, texture, drape, pattern..."
              rows={3}
            />
            <div className="f2-tags">
              {FABRIC_TAGS.map((tag) => (
                <span
                  key={tag}
                  className={`f2-tag ${fabricDescription.includes(tag) ? "active" : ""}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`f2-dropzone ${!imagePreview ? "empty" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          style={{
            borderColor: isDragging ? "var(--f2-forest)" : undefined,
            background: isDragging ? "var(--f2-forest-light)" : undefined,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px" }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div style={{ fontSize: "13px", color: "#999", fontWeight: "400" }}>
            Drop fabric texture or <span style={{ color: "var(--f2-forest)", fontWeight: "500" }}>browse</span>
          </div>
          <div style={{ fontSize: "11px", color: "#ccc", marginTop: "6px" }}>
            JPG, PNG, WEBP
          </div>
        </div>
      )}

      {!imagePreview && (
        <div style={{ marginTop: "16px" }}>
          <textarea
            className="f2-textarea"
            value={fabricDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Or describe the fabric — e.g. soft Italian silk with subtle sheen, heavy wool tweed..."
            rows={2}
          />
          <div className="f2-tags">
            {FABRIC_TAGS.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className={`f2-tag ${fabricDescription.includes(tag) ? "active" : ""}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
