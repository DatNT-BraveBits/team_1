import { useLoaderData } from "react-router";
import { useState } from "react";
import TryOnModal from "./components/TryOnModal";
import UgcGallery from "./components/UgcGallery";

const PRODUCT_IMAGES = {
  "Classic Fit Cotton T-Shirt": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
  "Floral Summer Dress": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop",
  "Denim Trucker Jacket": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop",
};

export default function Feature4Page() {
  const { products, ugcPhotos } = useLoaderData();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products"); // products | ugc

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
          Products
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
          <s-grid columns="3">
            {products.map((product) => (
              <s-card key={product.id}>
                <div style={{
                  position: "relative", overflow: "hidden",
                  borderRadius: "8px 8px 0 0",
                }}>
                  <img
                    src={PRODUCT_IMAGES[product.name] || product.imageUrl}
                    alt={product.name}
                    style={{
                      width: "100%", height: "220px",
                      objectFit: "cover", display: "block",
                    }}
                  />
                  <div style={{
                    position: "absolute", top: "8px", right: "8px",
                    background: "#1a1a1a", color: "white",
                    padding: "2px 8px", borderRadius: "12px",
                    fontSize: "11px", fontWeight: "600",
                  }}>
                    {product.sizeCharts.map((s) => s.size).join(" / ")}
                  </div>
                </div>
                <s-box padding="base">
                  <s-stack direction="block" gap="tight">
                    <s-text variant="headingSm">{product.name}</s-text>
                    <s-text variant="bodySm" tone="subdued">
                      {product.description}
                    </s-text>
                    <s-box padding-block-start="tight">
                      <s-button
                        variant="primary"
                        size="large"
                        onClick={() => setSelectedProduct(product)}
                      >
                        See It On Me
                      </s-button>
                    </s-box>
                  </s-stack>
                </s-box>
              </s-card>
            ))}
          </s-grid>

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
