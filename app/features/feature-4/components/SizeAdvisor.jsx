export default function SizeAdvisor({ advice }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #f0f0ff 0%, #faf5ff 100%)",
      borderRadius: "12px",
      padding: "16px",
      border: "1px solid #e0e0ff",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "8px",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5C6AC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        <s-text variant="bodySm" fontWeight="bold">Smart Size Advisor</s-text>
      </div>
      <s-text variant="bodyMd">{advice}</s-text>
    </div>
  );
}
