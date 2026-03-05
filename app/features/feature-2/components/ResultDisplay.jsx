import { useRef, useCallback } from "react";

export function ResultDisplay({ imageUrls, isLoading, onRegenerate }) {
  const imgRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    imgRef.current.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (imgRef.current) {
      imgRef.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)";
    }
  }, []);

  const handleDownload = (url, index) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `fashion-studio-${Date.now()}${imageUrls.length > 1 ? `-${index + 1}` : ""}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="f2-shimmer-wrap">
        <div className="f2-shimmer" />
        <span className="f2-shimmer-text">Creating your design</span>
      </div>
    );
  }

  if (imageUrls && imageUrls.length > 0) {
    const isSingle = imageUrls.length === 1;

    if (isSingle) {
      return (
        <div className="f2-result-wrap">
          <div
            ref={imgRef}
            className="f2-result-img-wrap"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={imageUrls[0]}
              alt="Generated fashion design"
              className="f2-result-img"
            />
          </div>

          <div className="f2-toolbar">
            {onRegenerate && (
              <>
                <button className="f2-toolbar-btn" onClick={onRegenerate}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Regenerate
                </button>
                <div className="f2-toolbar-divider" />
              </>
            )}
            <button className="f2-toolbar-btn" onClick={() => handleDownload(imageUrls[0], 0)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>
          </div>
        </div>
      );
    }

    // Multiple images grid
    return (
      <div className="f2-result-wrap">
        <div className="f2-result-grid" style={{
          display: "grid",
          gridTemplateColumns: imageUrls.length === 2 ? "1fr 1fr" : "1fr 1fr",
          gap: "16px",
          width: "100%",
          maxWidth: "900px",
          padding: "20px",
        }}>
          {imageUrls.map((url, i) => (
            <div key={i} className="f2-result-grid-item" style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              animation: `fade-scale-in 500ms ${i * 100}ms cubic-bezier(0.22,1,0.36,1) both`,
            }}>
              <img
                src={url}
                alt={`Generated fashion design ${i + 1}`}
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: "12px",
                }}
              />
              <button
                className="f2-toolbar-btn"
                onClick={() => handleDownload(url, i)}
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "11px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>

        {onRegenerate && (
          <div className="f2-toolbar" style={{ marginTop: "16px" }}>
            <button className="f2-toolbar-btn" onClick={onRegenerate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Regenerate
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="f2-canvas-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d1d1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "24px" }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <div className="f2-canvas-empty-title">
        Upload your fabric and craft the perfect design
      </div>
      <div className="f2-canvas-empty-sub">
        Select materials, style, and options from the panel
      </div>
    </div>
  );
}
