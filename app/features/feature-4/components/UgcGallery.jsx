import { useState } from "react";

export default function UgcGallery({ photos: initialPhotos }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [filter, setFilter] = useState("all"); // all | pending | approved

  const filtered = photos.filter((p) => {
    if (filter === "pending") return !p.approved;
    if (filter === "approved") return p.approved;
    return true;
  });

  const pendingCount = photos.filter((p) => !p.approved).length;
  const approvedCount = photos.filter((p) => p.approved).length;

  async function handleApprove(id) {
    const res = await fetch("/app/feature-4/ugc-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "approve" }),
    });
    if (res.ok) {
      setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, approved: true } : p));
    }
  }

  async function handleReject(id) {
    const res = await fetch("/app/feature-4/ugc-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "reject" }),
    });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div>
      {/* Stats bar */}
      <div style={{
        display: "flex", gap: "12px", marginBottom: "16px",
      }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "6px 14px", borderRadius: "20px", border: "none",
            background: filter === "all" ? "#1a1a1a" : "#f3f4f6",
            color: filter === "all" ? "white" : "#374151",
            fontSize: "13px", fontWeight: "500", cursor: "pointer",
          }}
        >
          All ({photos.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          style={{
            padding: "6px 14px", borderRadius: "20px", border: "none",
            background: filter === "pending" ? "#f59e0b" : "#f3f4f6",
            color: filter === "pending" ? "white" : "#374151",
            fontSize: "13px", fontWeight: "500", cursor: "pointer",
          }}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("approved")}
          style={{
            padding: "6px 14px", borderRadius: "20px", border: "none",
            background: filter === "approved" ? "#22c55e" : "#f3f4f6",
            color: filter === "approved" ? "white" : "#374151",
            fontSize: "13px", fontWeight: "500", cursor: "pointer",
          }}
        >
          Approved ({approvedCount})
        </button>
      </div>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 20px",
          background: "#f9fafb", borderRadius: "12px",
        }}>
          <s-text variant="bodyMd" tone="subdued">
            {filter === "pending"
              ? "No photos waiting for review"
              : filter === "approved"
              ? "No approved photos yet"
              : "No UGC photos yet. They'll appear here when customers save their try-on photos!"}
          </s-text>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
        }}>
          {filtered.map((photo) => (
            <div
              key={photo.id}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                background: "white",
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={photo.imageUrl}
                  alt={`Try-on by ${photo.customerName}`}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {/* Status badge */}
                <div style={{
                  position: "absolute", top: "8px", left: "8px",
                  padding: "2px 8px", borderRadius: "10px",
                  fontSize: "11px", fontWeight: "600",
                  background: photo.approved ? "#dcfce7" : "#fef9c3",
                  color: photo.approved ? "#166534" : "#854d0e",
                }}>
                  {photo.approved ? "Approved" : "Pending"}
                </div>
              </div>

              <div style={{ padding: "12px" }}>
                <s-text variant="bodySm" fontWeight="semibold">
                  {photo.customerName}
                </s-text>
                <s-text variant="bodySm" tone="subdued">
                  {photo.product?.name || "Product"}
                </s-text>
                <s-text variant="bodySm" tone="subdued">
                  {new Date(photo.createdAt).toLocaleDateString()}
                </s-text>

                {!photo.approved && (
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    <button
                      onClick={() => handleApprove(photo.id)}
                      style={{
                        flex: 1, padding: "6px", borderRadius: "6px",
                        border: "none", background: "#22c55e", color: "white",
                        fontSize: "12px", fontWeight: "600", cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(photo.id)}
                      style={{
                        flex: 1, padding: "6px", borderRadius: "6px",
                        border: "1px solid #e5e7eb", background: "white",
                        color: "#6b7280", fontSize: "12px", cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
