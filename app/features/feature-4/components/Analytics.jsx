export default function Analytics({ stats }) {
  const cards = [
    {
      label: "Total Try-Ons",
      value: stats.totalTryOns,
      subtext: `${stats.tryOnsToday} today`,
      color: "#5C6AC4",
    },
    {
      label: "UGC Photos",
      value: stats.totalUgc,
      subtext: `${stats.pendingUgc} pending review`,
      color: "#f59e0b",
    },
    {
      label: "Avg. Confidence",
      value: stats.avgConfidence ? `${stats.avgConfidence}/10` : "N/A",
      subtext: "Size advisor accuracy",
      color: "#22c55e",
    },
    {
      label: "Return Risk",
      value: stats.returnRate + "%",
      subtext: stats.returnRate > 20 ? "Above average" : "Below average",
      color: stats.returnRate > 20 ? "#ef4444" : "#22c55e",
    },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "20px",
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: "white",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid #e5e7eb",
          }}>
            <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500", marginBottom: "4px" }}>
              {card.label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: card.color, marginBottom: "2px" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
              {card.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Top products by try-on */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "16px",
        border: "1px solid #e5e7eb",
        marginBottom: "16px",
      }}>
        <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>
          Top Products by Try-On
        </div>
        {stats.productStats.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>No data yet</div>
        ) : (
          stats.productStats.map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "8px 0",
              borderBottom: i < stats.productStats.length - 1 ? "1px solid #f3f4f6" : "none",
            }}>
              <span style={{
                width: "24px", height: "24px", borderRadius: "6px",
                background: "#f3f4f6", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280",
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "500" }}>{p.name}</div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#5C6AC4" }}>
                {p.tryOnCount} try-ons
              </div>
              {/* Bar */}
              <div style={{ width: "80px", height: "6px", background: "#e5e7eb", borderRadius: "3px" }}>
                <div style={{
                  height: "100%",
                  width: `${(p.tryOnCount / Math.max(...stats.productStats.map(x => x.tryOnCount))) * 100}%`,
                  background: "#5C6AC4",
                  borderRadius: "3px",
                }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Return prediction */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "16px",
        border: "1px solid #e5e7eb",
      }}>
        <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>
          Return Risk Prediction
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{
            flex: 1, background: "#f0fdf4", borderRadius: "8px", padding: "12px",
            border: "1px solid #bbf7d0",
          }}>
            <div style={{ fontSize: "11px", color: "#166534", fontWeight: "500" }}>With MirrorAI</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#16a34a" }}>{stats.returnRate}%</div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Predicted return rate</div>
          </div>
          <div style={{
            flex: 1, background: "#fef2f2", borderRadius: "8px", padding: "12px",
            border: "1px solid #fecaca",
          }}>
            <div style={{ fontSize: "11px", color: "#991b1b", fontWeight: "500" }}>Industry Average</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#dc2626" }}>35%</div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Without virtual try-on</div>
          </div>
          <div style={{
            flex: 1, background: "#eff6ff", borderRadius: "8px", padding: "12px",
            border: "1px solid #bfdbfe",
          }}>
            <div style={{ fontSize: "11px", color: "#1e40af", fontWeight: "500" }}>Savings</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#2563eb" }}>{35 - stats.returnRate}%</div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Reduction in returns</div>
          </div>
        </div>
      </div>
    </div>
  );
}
