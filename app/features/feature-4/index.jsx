import { useLoaderData } from "react-router";
import { useState } from "react";
import TryOnModal from "./components/TryOnModal";
import UgcGallery from "./components/UgcGallery";

export default function Feature4Page() {
  const { products, ugcPhotos } = useLoaderData();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");

  return (
    <s-page heading="MirrorAI">
      <s-box padding-block-end="base">
        <s-stack direction="block" gap="tight">
          <s-text variant="headingLg">See It On Me</s-text>
          <s-text variant="bodyMd" tone="subdued">
            AI-powered virtual fitting room. Pick a product, upload a photo, and see how it looks — instantly.
          </s-text>
        </s-stack>
      </s-box>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "0", borderBottom: "2px solid #e5e7eb",
        marginBottom: "20px",
      }}>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            padding: "10px 20px", border: "none", background: "none",
            borderBottom: activeTab === "products" ? "2px solid #1a1a1a" : "2px solid transparent",
            marginBottom: "-2px", cursor: "pointer",
            fontWeight: activeTab === "products" ? "600" : "400",
            color: activeTab === "products" ? "#1a1a1a" : "#6b7280",
            fontSize: "14px",
          }}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("ugc")}
          style={{
            padding: "10px 20px", border: "none", background: "none",
            borderBottom: activeTab === "ugc" ? "2px solid #1a1a1a" : "2px solid transparent",
            marginBottom: "-2px", cursor: "pointer",
            fontWeight: activeTab === "ugc" ? "600" : "400",
            color: activeTab === "ugc" ? "#1a1a1a" : "#6b7280",
            fontSize: "14px",
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          UGC Gallery
          {ugcPhotos.filter((p) => !p.approved).length > 0 && (
            <span style={{
              background: "#f59e0b", color: "white",
              borderRadius: "10px", padding: "1px 7px",
              fontSize: "11px", fontWeight: "700",
            }}>
              {ugcPhotos.filter((p) => !p.approved).length}
            </span>
          )}
        </button>
      </div>

      {/* Products tab */}
      {activeTab === "products" && (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  transition: "box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedProduct(product)}
              >
                {/* Square image container */}
                <div style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "100%", /* 1:1 aspect ratio */
                  overflow: "hidden",
                  background: "#f9fafb",
                }}>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      padding: "12px",
                    }}
                  />
                  {/* Size badge */}
                  <div style={{
                    position: "absolute", bottom: "8px", left: "8px",
                    display: "flex", gap: "4px", flexWrap: "wrap",
                  }}>
                    {product.sizeCharts.map((s) => (
                      <span
                        key={s.size}
                        style={{
                          background: "rgba(255,255,255,0.9)",
                          backdropFilter: "blur(4px)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#374151",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      >
                        {s.size}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Product info */}
                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a", marginBottom: "4px" }}>
                    {product.name}
                  </div>
                  <div style={{
                    fontSize: "12px", color: "#6b7280", lineHeight: "1.4",
                    marginBottom: "10px",
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {product.description}
                  </div>
                  <button
                    style={{
                      width: "100%",
                      padding: "8px 0",
                      background: "#1a1a1a",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                  >
                    See It On Me
                  </button>
                </div>
              </div>
            ))}
          </div>

          <s-box padding-block-start="loose">
            <s-card>
              <s-box padding="base">
                <s-stack direction="block" gap="tight">
                  <s-text variant="headingSm">How it works</s-text>
                  <s-text variant="bodySm" tone="subdued">
                    1. Pick a product &nbsp; 2. Upload your photo &nbsp; 3. Get AI try-on + size advice &nbsp; 4. Save to shop gallery
                  </s-text>
                </s-stack>
              </s-box>
            </s-card>
          </s-box>
        </>
      )}

      {/* UGC Gallery tab */}
      {activeTab === "ugc" && (
        <UgcGallery photos={ugcPhotos} />
      )}

      {selectedProduct && (
        <TryOnModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </s-page>
  );
}
