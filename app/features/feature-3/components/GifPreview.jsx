import { useState, useCallback } from "react";
import { createGif, EFFECTS, BADGE_SHAPES, BADGE_POSITIONS, BADGE_EFFECTS, LOOP_MODES } from "../utils/create-gif";

const SIZES = [
  { label: "Small (320px)", value: 320 },
  { label: "Medium (480px)", value: 480 },
  { label: "Large (640px)", value: 640 },
  { label: "HD (800px)", value: 800 },
];

const SPEEDS = [
  { label: "Slow (1s)", value: 1000 },
  { label: "Normal (0.5s)", value: 500 },
  { label: "Fast (0.25s)", value: 250 },
  { label: "Very fast (0.1s)", value: 100 },
];

export default function GifPreview({ imageSources, onGifReady, onEffectChange }) {
  const [gifUrl, setGifUrl] = useState(null);
  const [gifBlob, setGifBlob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [size, setSize] = useState(480);
  const [speed, setSpeed] = useState(500);
  const [effect, setEffect] = useState("none");
  const [badgeEnabled, setBadgeEnabled] = useState(false);
  const [badgeText, setBadgeText] = useState("SALE");
  const [badgeShape, setBadgeShape] = useState("pill");
  const [badgeBgColor, setBadgeBgColor] = useState("#e53e3e");
  const [badgeTextColor, setBadgeTextColor] = useState("#ffffff");
  const [badgePosition, setBadgePosition] = useState("top-right");
  const [badgeEffect, setBadgeEffect] = useState("none");
  const [loopMode, setLoopMode] = useState("forward");
  const [error, setError] = useState(null);

  const generate = useCallback(async () => {
    if (imageSources.length === 0) return;
    setIsGenerating(true);
    setError(null);

    // Revoke old URL
    if (gifUrl) URL.revokeObjectURL(gifUrl);

    try {
      const badge = badgeEnabled && badgeText
        ? { text: badgeText, shape: badgeShape, bgColor: badgeBgColor, textColor: badgeTextColor, position: badgePosition, badgeEffect }
        : null;
      const blob = await createGif(imageSources, {
        width: size,
        delay: speed,
        effect,
        badge,
        loopMode,
      });
      const url = URL.createObjectURL(blob);
      setGifBlob(blob);
      setGifUrl(url);
      if (onGifReady) onGifReady(blob);
    } catch (err) {
      setError(err.message || "Failed to create GIF");
    } finally {
      setIsGenerating(false);
    }
  }, [imageSources, size, speed, effect, badgeEnabled, badgeText, badgeShape, badgeBgColor, badgeTextColor, badgePosition, badgeEffect, loopMode, gifUrl, onGifReady]);

  const handleDownload = useCallback(() => {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = "animated.gif";
    a.click();
  }, [gifUrl]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Settings */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <label style={labelStyle}>
          <span style={labelTextStyle}>Size</span>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            style={selectStyle}
          >
            {SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          <span style={labelTextStyle}>Speed</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={selectStyle}
          >
            {SPEEDS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Effect selector */}
      <div>
        <span style={labelTextStyle}>Effect</span>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "6px",
          }}
        >
          {EFFECTS.map((e) => (
            <button
              key={e.id}
              onClick={() => { setEffect(e.id); if (onEffectChange) onEffectChange(e.id); }}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: effect === e.id ? 600 : 400,
                border: effect === e.id ? "2px solid #2c6ecb" : "1px solid #c9cccf",
                borderRadius: "20px",
                backgroundColor: effect === e.id ? "#e9f0fb" : "#fff",
                color: effect === e.id ? "#2c6ecb" : "#202223",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {e.icon} {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loop mode */}
      <div>
        <span style={labelTextStyle}>Loop</span>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "6px",
          }}
        >
          {LOOP_MODES.map((l) => (
            <button
              key={l.id}
              onClick={() => setLoopMode(l.id)}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: loopMode === l.id ? 600 : 400,
                border: loopMode === l.id ? "2px solid #2c6ecb" : "1px solid #c9cccf",
                borderRadius: "20px",
                backgroundColor: loopMode === l.id ? "#e9f0fb" : "#fff",
                color: loopMode === l.id ? "#2c6ecb" : "#202223",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {l.icon} {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Badge options */}
      <div
        style={{
          border: "1px solid #e1e3e5",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setBadgeEnabled(!badgeEnabled)}
          style={{
            width: "100%",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "none",
            backgroundColor: badgeEnabled ? "#f0f5ff" : "#fafbfb",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            color: "#202223",
          }}
        >
          <span>Badge</span>
          <span
            style={{
              width: "36px",
              height: "20px",
              borderRadius: "10px",
              backgroundColor: badgeEnabled ? "#2c6ecb" : "#c9cccf",
              position: "relative",
              transition: "all 0.2s",
              display: "inline-block",
            }}
          >
            <span
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                position: "absolute",
                top: "2px",
                left: badgeEnabled ? "18px" : "2px",
                transition: "all 0.2s",
              }}
            />
          </span>
        </button>

        {badgeEnabled && (
          <div
            style={{
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              borderTop: "1px solid #e1e3e5",
            }}
          >
            {/* Badge text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={labelTextStyle}>Text</span>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                maxLength={20}
                placeholder="e.g. SALE, NEW, -20%"
                style={{
                  ...selectStyle,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Badge shape */}
            <div>
              <span style={labelTextStyle}>Shape</span>
              <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                {BADGE_SHAPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBadgeShape(s.id)}
                    style={{
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: badgeShape === s.id ? 600 : 400,
                      border: badgeShape === s.id ? "2px solid #2c6ecb" : "1px solid #c9cccf",
                      borderRadius: "16px",
                      backgroundColor: badgeShape === s.id ? "#e9f0fb" : "#fff",
                      color: badgeShape === s.id ? "#2c6ecb" : "#202223",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge position */}
            <div>
              <span style={labelTextStyle}>Position</span>
              <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                {BADGE_POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setBadgePosition(p.id)}
                    style={{
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: badgePosition === p.id ? 600 : 400,
                      border: badgePosition === p.id ? "2px solid #2c6ecb" : "1px solid #c9cccf",
                      borderRadius: "16px",
                      backgroundColor: badgePosition === p.id ? "#e9f0fb" : "#fff",
                      color: badgePosition === p.id ? "#2c6ecb" : "#202223",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge effect */}
            <div>
              <span style={labelTextStyle}>Animation</span>
              <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                {BADGE_EFFECTS.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setBadgeEffect(e.id)}
                    style={{
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: badgeEffect === e.id ? 600 : 400,
                      border: badgeEffect === e.id ? "2px solid #2c6ecb" : "1px solid #c9cccf",
                      borderRadius: "16px",
                      backgroundColor: badgeEffect === e.id ? "#e9f0fb" : "#fff",
                      color: badgeEffect === e.id ? "#2c6ecb" : "#202223",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {e.icon} {e.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={labelTextStyle}>Background Color</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={badgeBgColor}
                    onChange={(e) => setBadgeBgColor(e.target.value)}
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "1px solid #c9cccf",
                      borderRadius: "8px",
                      padding: "2px",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#6d7175" }}>{badgeBgColor}</span>
                </div>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={labelTextStyle}>Text Color</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={badgeTextColor}
                    onChange={(e) => setBadgeTextColor(e.target.value)}
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "1px solid #c9cccf",
                      borderRadius: "8px",
                      padding: "2px",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#6d7175" }}>{badgeTextColor}</span>
                </div>
              </label>
            </div>

            {/* Preview badge */}
            {badgeText && (
              <div>
                <span style={labelTextStyle}>Preview</span>
                <div
                  style={{
                    marginTop: "6px",
                    padding: "16px",
                    backgroundColor: "#f6f6f7",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {badgeShape === "ribbon" ? (
                    <svg width="140" height="40" viewBox="0 0 140 40">
                      <polygon
                        points="0,0 120,0 110,20 120,40 0,40"
                        fill={badgeBgColor}
                      />
                      <text
                        x="55"
                        y="22"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={badgeTextColor}
                        fontSize="14"
                        fontWeight="700"
                        fontFamily="sans-serif"
                      >
                        {badgeText}
                      </text>
                    </svg>
                  ) : badgeShape === "star" ? (
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <polygon
                        points="40,4 49,28 76,28 54,44 62,68 40,54 18,68 26,44 4,28 31,28"
                        fill={badgeBgColor}
                      />
                      <text
                        x="40"
                        y="42"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={badgeTextColor}
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="sans-serif"
                      >
                        {badgeText}
                      </text>
                    </svg>
                  ) : (
                    <span
                      style={{
                        padding: badgeShape === "circle" ? "8px" : "6px 16px",
                        fontSize: "14px",
                        fontWeight: 700,
                        backgroundColor: badgeBgColor,
                        color: badgeTextColor,
                        borderRadius:
                          badgeShape === "pill" ? "999px"
                          : badgeShape === "circle" ? "50%"
                          : "4px",
                        ...(badgeShape === "circle" ? {
                          width: "48px",
                          height: "48px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        } : {}),
                      }}
                    >
                      {badgeText}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={isGenerating || imageSources.length === 0}
        style={{
          padding: "10px 20px",
          fontSize: "14px",
          fontWeight: 600,
          border: "none",
          borderRadius: "8px",
          cursor: isGenerating ? "not-allowed" : "pointer",
          backgroundColor: "#2c6ecb",
          color: "#fff",
          opacity: isGenerating ? 0.6 : 1,
          transition: "all 0.15s",
        }}
      >
        {isGenerating ? "Generating GIF..." : gifUrl ? "Regenerate GIF" : "Create GIF"}
      </button>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#fff4f4",
            border: "1px solid #e0b3b2",
            borderRadius: "8px",
            color: "#c4272c",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {isGenerating && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            border: "1px solid #e1e3e5",
            borderRadius: "12px",
            backgroundColor: "#fafbfb",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid #e1e3e5",
                borderTop: "3px solid #2c6ecb",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <span style={{ color: "#6d7175", fontSize: "14px" }}>
              Encoding frames...
            </span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}

      {/* GIF Preview */}
      {gifUrl && !isGenerating && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e1e3e5",
              backgroundColor: "#f6f6f7",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={gifUrl}
              alt="Generated GIF"
              style={{ maxWidth: "100%", display: "block" }}
            />
          </div>

          {gifBlob && (
            <p style={{ margin: 0, fontSize: "12px", color: "#8c9196" }}>
              {(gifBlob.size / 1024).toFixed(0)} KB &middot; {size}px wide
            </p>
          )}

          <button
            onClick={handleDownload}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 600,
              border: "1px solid #c9cccf",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#202223",
              transition: "all 0.15s",
            }}
          >
            Download GIF
          </button>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  flex: "1 1 140px",
};

const labelTextStyle = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#6d7175",
};

const selectStyle = {
  padding: "8px 12px",
  border: "1px solid #c9cccf",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: "#fff",
  cursor: "pointer",
};
