export default function SizeAdvisor({ advice, recommendedSize, confidence, fitWarnings, comparedToPrevious }) {
  const severityColors = {
    info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", icon: "i" },
    warning: { bg: "#fffbeb", border: "#fde68a", text: "#92400e", icon: "!" },
    critical: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", icon: "!!" },
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #f0f0ff 0%, #faf5ff 100%)",
      borderRadius: "12px",
      padding: "16px",
      border: "1px solid #e0e0ff",
    }}>
      {/* Header with recommended size */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5C6AC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a1a" }}>Smart Size Advisor</span>
        </div>
        {recommendedSize && (
          <div style={{
            background: "#5C6AC4", color: "white",
            padding: "4px 12px", borderRadius: "16px",
            fontSize: "13px", fontWeight: "700",
          }}>
            Size {recommendedSize}
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5", marginBottom: "12px" }}>
        {advice}
      </div>

      {/* Confidence bar */}
      {confidence && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>Fit confidence</span>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#5C6AC4" }}>{confidence}/10</span>
          </div>
          <div style={{ height: "4px", background: "#e5e7eb", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${confidence * 10}%`,
              background: confidence >= 7 ? "#22c55e" : confidence >= 5 ? "#f59e0b" : "#ef4444",
              borderRadius: "2px",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      )}

      {/* Fit warnings */}
      {fitWarnings && fitWarnings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
          {fitWarnings.map((w, i) => {
            const colors = severityColors[w.severity] || severityColors.info;
            return (
              <div key={i} style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                padding: "8px 10px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: colors.border, color: colors.text,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: "800", flexShrink: 0,
                }}>
                  {colors.icon}
                </span>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: colors.text }}>
                    {w.bodyPart}:
                  </span>{" "}
                  <span style={{ fontSize: "12px", color: "#374151" }}>{w.issue}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Previous purchase comparison */}
      {comparedToPrevious && (
        <div style={{
          background: "rgba(255,255,255,0.7)",
          borderRadius: "8px",
          padding: "10px 12px",
          border: "1px solid rgba(92,106,196,0.2)",
        }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#5C6AC4", marginBottom: "4px" }}>
            Based on your past orders
          </div>
          <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.4" }}>
            {comparedToPrevious}
          </div>
        </div>
      )}
    </div>
  );
}
