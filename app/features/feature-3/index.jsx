/**
 * Feature 3 - GIF Creator
 * Owner: Gavin
 *
 * Upload 1-6 images, create an animated GIF,
 * download it or save it to a product.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import MultiImageUpload from "./components/MultiImageUpload";
import GifPreview from "./components/GifPreview";

export default function Feature3Page() {
  const saveFetcher = useFetcher();
  const altFetcher = useFetcher();
  const [images, setImages] = useState([]);
  const [gifBlob, setGifBlob] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saveCleared, setSaveCleared] = useState(true);
  const [altText, setAltText] = useState("");
  const [effect, setEffect] = useState("none");
  const prevAltRef = useRef(null);

  const isSaving = saveFetcher.state !== "idle";
  const saveResult = saveCleared ? null : saveFetcher.data;
  const isGeneratingAlt = altFetcher.state !== "idle";

  // Update alt text when AI returns result
  useEffect(() => {
    if (altFetcher.data?.altText && altFetcher.data.altText !== prevAltRef.current) {
      prevAltRef.current = altFetcher.data.altText;
      setAltText(altFetcher.data.altText);
    }
  }, [altFetcher.data]);

  const previewUrls = images.map((img) => img.previewUrl);

  const handlePickProduct = useCallback(async () => {
    try {
      const selected = await window.shopify.resourcePicker({
        type: "product",
        action: "select",
        multiple: false,
      });
      if (selected?.[0]) {
        setSelectedProduct({
          id: selected[0].id,
          title: selected[0].title,
        });
        setSaveCleared(true);
      }
    } catch {
      // User cancelled
    }
  }, []);

  const handleGenerateAlt = useCallback(() => {
    const formData = new FormData();
    formData.append("_action", "generateAlt");
    formData.append("productTitle", selectedProduct?.title || "");
    formData.append("imageCount", String(images.length));
    formData.append("effect", effect);
    altFetcher.submit(formData, { method: "POST" });
  }, [selectedProduct, images.length, effect, altFetcher]);

  const handleSaveToProduct = useCallback(() => {
    if (!gifBlob || !selectedProduct) return;

    setSaveCleared(false);
    const formData = new FormData();
    formData.append("_action", "save");
    formData.append("productId", selectedProduct.id);
    formData.append("altText", altText || "Animated GIF");
    formData.append("gifFile", new File([gifBlob], "animated.gif", { type: "image/gif" }));

    saveFetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    });
  }, [gifBlob, selectedProduct, altText, saveFetcher]);

  return (
    <s-page heading="GIF Creator">
      {/* Success/Error banners */}
      {saveResult?.error && (
        <div style={bannerStyle("#fff4f4", "#e0b3b2", "#c4272c")}>
          {saveResult.error}
        </div>
      )}
      {saveResult?.success && (
        <div style={bannerStyle("#f1f8f5", "#95c9b4", "#1a7346")}>
          GIF saved to {selectedProduct?.title}!
        </div>
      )}

      {/* Step 1: Upload */}
      <s-section heading="1. Upload Images">
        <s-card>
          <s-box padding="base">
            <div style={{ marginBottom: "12px" }}>
              <s-text variant="bodyMd">
                Upload 1–6 images. They will play in order as frames of the GIF.
              </s-text>
            </div>
            <MultiImageUpload images={images} onChange={setImages} />
          </s-box>
        </s-card>
      </s-section>

      {/* Step 2: Create & Preview GIF */}
      {previewUrls.length > 0 && (
        <s-section heading="2. Create GIF">
          <s-card>
            <s-box padding="base">
              <GifPreview
                imageSources={previewUrls}
                onGifReady={setGifBlob}
                onEffectChange={setEffect}
              />
            </s-box>
          </s-card>
        </s-section>
      )}

      {/* Step 3: Save to Product */}
      {gifBlob && (
        <s-section heading="3. Save to Product">
          <s-card>
            <s-box padding="base">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <s-text variant="bodyMd">
                  Add this GIF as media to one of your products.
                </s-text>

                <button onClick={handlePickProduct} style={btnSecondary}>
                  {selectedProduct
                    ? `Product: ${selectedProduct.title}`
                    : "Select a Product"}
                </button>

                {selectedProduct && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#6d7175" }}>Alt Text</span>
                      <button
                        onClick={handleGenerateAlt}
                        disabled={isGeneratingAlt}
                        style={{
                          padding: "4px 10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          border: "1px solid #c9cccf",
                          borderRadius: "6px",
                          backgroundColor: "#fff",
                          color: isGeneratingAlt ? "#8c9196" : "#2c6ecb",
                          cursor: isGeneratingAlt ? "not-allowed" : "pointer",
                        }}
                      >
                        {isGeneratingAlt ? "Generating..." : "Generate with AI"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Describe the GIF for accessibility"
                      maxLength={125}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #c9cccf",
                        borderRadius: "8px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                    {altFetcher.data?.altError && (
                      <span style={{ fontSize: "12px", color: "#c4272c" }}>
                        {altFetcher.data.altError}
                      </span>
                    )}
                    <span style={{ fontSize: "11px", color: "#8c9196" }}>
                      {altText.length}/125 characters
                    </span>
                  </div>
                )}

                {selectedProduct && (
                  <button
                    onClick={handleSaveToProduct}
                    disabled={isSaving}
                    style={{
                      ...btnPrimary,
                      opacity: isSaving ? 0.6 : 1,
                      cursor: isSaving ? "not-allowed" : "pointer",
                    }}
                  >
                    {isSaving
                      ? "Uploading..."
                      : `Save GIF to ${selectedProduct.title}`}
                  </button>
                )}
              </div>
            </s-box>
          </s-card>
        </s-section>
      )}
    </s-page>
  );
}

const btnPrimary = {
  padding: "10px 20px",
  fontSize: "14px",
  fontWeight: 600,
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#2c6ecb",
  color: "#fff",
  width: "100%",
  transition: "all 0.15s",
};

const btnSecondary = {
  ...btnPrimary,
  backgroundColor: "#fff",
  color: "#202223",
  border: "1px solid #c9cccf",
  cursor: "pointer",
};

const bannerStyle = (bg, border, color) => ({
  padding: "12px 16px",
  backgroundColor: bg,
  border: `1px solid ${border}`,
  borderRadius: "8px",
  color,
  marginBottom: "16px",
  fontSize: "14px",
});
