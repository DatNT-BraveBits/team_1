import { useState } from "react";
import PhotoUploader from "./PhotoUploader";
import TryOnResult from "./TryOnResult";
import SizeAdvisor from "./SizeAdvisor";

const LOADING_TIPS = [
  "Analyzing your style...",
  "Matching fabric and fit...",
  "Almost there, looking great...",
];

export default function TryOnModal({ product, onClose }) {
  const [step, setStep] = useState("upload");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingTip, setLoadingTip] = useState(0);

  async function handleUpload({ photoBase64, height, weight }) {
    setStep("loading");
    setError(null);
    setLoadingTip(0);

    // Rotate loading tips
    const tipInterval = setInterval(() => {
      setLoadingTip((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 4000);

    try {
      const tryOnPromise = fetch("/app/feature-4/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productDescription: product.description,
          photoBase64,
        }),
      });

      const advisorPromise = (height || weight)
        ? fetch("/app/feature-4/advisor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, height, weight }),
          })
        : Promise.resolve(null);

      const [tryOnRes, advisorRes] = await Promise.all([tryOnPromise, advisorPromise]);

      if (!tryOnRes.ok) {
        const errData = await tryOnRes.json().catch(() => ({}));
        throw new Error(errData.error || "Try-on generation failed. Please try again.");
      }
      const tryOnData = await tryOnRes.json();

      let sizeData = null;
      if (advisorRes?.ok) {
        sizeData = await advisorRes.json();
      }

      setResult({
        imageUrl: tryOnData.imageUrl,
        sizeAdvice: sizeData?.advice || null,
        recommendedSize: sizeData?.recommendedSize || null,
        confidence: sizeData?.confidence || null,
        fitWarnings: sizeData?.fitWarnings || null,
        comparedToPrevious: sizeData?.comparedToPrevious || null,
      });
      setStep("result");
    } catch (err) {
      setError(err.message);
      setStep("upload");
    } finally {
      clearInterval(tipInterval);
    }
  }

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "0",
          maxWidth: "560px",
          width: "92%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <div>
            <s-text variant="headingSm">{product.name}</s-text>
            <s-text variant="bodySm" tone="subdued">Virtual Try-On</s-text>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6", border: "none", borderRadius: "8px",
              width: "32px", height: "32px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", color: "#6b7280",
            }}
          >
            x
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "8px", padding: "12px", marginBottom: "16px",
            }}>
              <s-text variant="bodySm" tone="critical">{error}</s-text>
            </div>
          )}

          {step === "upload" && <PhotoUploader onUpload={handleUpload} />}

          {step === "loading" && (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{
                width: "48px", height: "48px", margin: "0 auto 16px",
                border: "3px solid #e5e7eb",
                borderTopColor: "#5C6AC4",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <s-text variant="bodyMd" fontWeight="semibold">
                {LOADING_TIPS[loadingTip]}
              </s-text>
              <div style={{ marginTop: "8px" }}>
                <s-text variant="bodySm" tone="subdued">
                  This usually takes 15-30 seconds
                </s-text>
              </div>
              {/* Progress bar */}
              <div style={{
                marginTop: "20px", height: "4px", background: "#e5e7eb",
                borderRadius: "2px", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", background: "linear-gradient(90deg, #5C6AC4, #7C3AED)",
                  borderRadius: "2px",
                  animation: "pulse 2s ease-in-out infinite",
                  width: "60%",
                }} />
              </div>
            </div>
          )}

          {step === "result" && result && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <TryOnResult
                imageUrl={result.imageUrl}
                productId={product.id}
                productName={product.name}
              />
              {result.sizeAdvice && (
                <SizeAdvisor
                  advice={result.sizeAdvice}
                  recommendedSize={result.recommendedSize}
                  confidence={result.confidence}
                  fitWarnings={result.fitWarnings}
                  comparedToPrevious={result.comparedToPrevious}
                />
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                <s-button
                  variant="primary"
                  onClick={() => { setStep("upload"); setResult(null); }}
                >
                  Try Another Photo
                </s-button>
                <s-button onClick={onClose}>
                  Done
                </s-button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
