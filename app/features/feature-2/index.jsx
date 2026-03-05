import { useState, useCallback, useRef } from "react";
import { STYLES } from "./styles";
import { FabricUploader } from "./components/FabricUploader";
import { OptionSelector } from "./components/OptionSelector";
import { ResultDisplay } from "./components/ResultDisplay";

function getOptionsDiff(prev, next) {
  const changes = [];
  const skipKeys = ["promptStrength", "variations"];

  for (const key of Object.keys(next)) {
    if (skipKeys.includes(key)) continue;
    const oldVal = prev[key];
    const newVal = next[key];

    if (Array.isArray(newVal)) {
      const oldArr = oldVal || [];
      const added = newVal.filter((v) => !oldArr.includes(v));
      const removed = oldArr.filter((v) => !newVal.includes(v));
      if (added.length > 0) changes.push({ key, type: "added", values: added });
      if (removed.length > 0) changes.push({ key, type: "removed", values: removed });
    } else if (oldVal !== newVal) {
      changes.push({ key, type: "changed", from: oldVal, to: newVal });
    }
  }
  return changes;
}

function buildDiffDescription(changes, prevFabricDesc, newFabricDesc) {
  const parts = [];

  if (prevFabricDesc !== newFabricDesc && newFabricDesc) {
    parts.push(`Change the fabric to: ${newFabricDesc}`);
  }

  for (const change of changes) {
    const label = {
      garment: "garment type",
      style: "fashion style",
      nationality: "model nationality",
      bodyType: "body type",
      pose: "pose",
      background: "background",
      color: "outfit color",
      customPrompt: "design details",
      negativePrompt: "elements to avoid",
      height: "model height",
      weight: "model weight",
      bust: "bust measurement",
      waist: "waist measurement",
      hips: "hips measurement",
    }[change.key] || change.key;

    if (change.type === "changed") {
      if (change.to === null) {
        parts.push(`Remove the ${label}`);
      } else if (change.key === "customPrompt") {
        parts.push(`Change design details to: ${change.to}`);
      } else if (change.key === "negativePrompt") {
        parts.push(`Now avoid: ${change.to}`);
      } else {
        parts.push(`Change the ${label} to ${change.to}`);
      }
    } else if (change.type === "added") {
      parts.push(`Add ${label}: ${change.values.join(", ")}`);
    } else if (change.type === "removed") {
      parts.push(`Remove ${label}: ${change.values.join(", ")}`);
    }
  }

  return parts;
}

export default function Feature2Page() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [fabricImage, setFabricImage] = useState(null);
  const [fabricDescription, setFabricDescription] = useState("");
  const [selections, setSelections] = useState({
    garment: null,
    style: [],
    nationality: "American",
    bodyType: null,
    height: "",
    weight: "",
    bust: "",
    waist: "",
    hips: "",
    pose: null,
    background: null,
    color: null,
    customPrompt: "",
    negativePrompt: "",
    promptStrength: 7,
    variations: 1,
  });
  const [generatedImages, setGeneratedImages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);

  // Track what was used for the last generation
  const lastGenRef = useRef(null);

  const generate = useCallback(async (image, options, description) => {
    const hasOptions = Object.entries(options).some(([key, val]) => {
      if (["promptStrength", "variations", "negativePrompt", "customPrompt"].includes(key)) return false;
      if (Array.isArray(val)) return val.length > 0;
      return val != null;
    });
    if ((!image && !description) || !hasOptions) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Check if this is an edit (has previous image + options changed)
    let mode = "generate";
    let diffDescriptions = [];

    if (lastGenRef.current && generatedImages) {
      const changes = getOptionsDiff(lastGenRef.current.options, options);
      const fabricChanged = lastGenRef.current.fabricDescription !== description;

      if (changes.length > 0 || fabricChanged) {
        diffDescriptions = buildDiffDescription(
          changes,
          lastGenRef.current.fabricDescription,
          description,
        );
        if (diffDescriptions.length > 0) {
          mode = "edit";
        }
      }
    }

    setIsLoading(true);
    try {
      const body = {
        image,
        options,
        fabricDescription: description,
        mode,
      };

      if (mode === "edit") {
        body.previousImage = generatedImages[0];
        body.editInstructions = diffDescriptions;
      }

      const response = await fetch("/app/feature-2/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      if (!controller.signal.aborted) {
        setGeneratedImages(data.imageUrls);
        // Save current state as last generation
        lastGenRef.current = {
          options: { ...options },
          fabricDescription: description,
        };
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Generation error:", err);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [generatedImages]);

  const handleImageSelect = useCallback((imageData) => {
    setFabricImage(imageData);
  }, []);

  const handleSelectionChange = useCallback((newSelections) => {
    setSelections(newSelections);
  }, []);

  const handleDescriptionChange = useCallback((desc) => {
    setFabricDescription(desc);
  }, []);

  const handleRegenerate = useCallback(() => {
    // Force full regenerate (ignore diff)
    lastGenRef.current = null;
    generate(fabricImage, selections, fabricDescription);
  }, [fabricImage, selections, fabricDescription, generate]);

  const handleGenerate = useCallback(() => {
    generate(fabricImage, selections, fabricDescription);
  }, [fabricImage, selections, fabricDescription, generate]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="f2-studio">
        <div className="f2-layout">
          {/* Left Panel */}
          <div className={`f2-panel ${panelOpen ? "" : "collapsed"}`}>
            <div className="f2-panel-header">
              <h1 className="f2-panel-title">Fashion Studio</h1>
              <div className="f2-panel-subtitle">AI-Powered Design Tool</div>
            </div>

            {/* Fabric Section — always visible */}
            <div className="f2-accordion">
              <div style={{ padding: "20px 28px 0" }}>
                <span className="f2-label">Fabric Material</span>
              </div>
              <div style={{ padding: "8px 28px 24px" }}>
                <FabricUploader
                  imagePreview={fabricImage}
                  onImageSelect={handleImageSelect}
                  fabricDescription={fabricDescription}
                  onDescriptionChange={handleDescriptionChange}
                />
              </div>
            </div>

            {/* Options */}
            <OptionSelector
              selections={selections}
              onSelectionChange={handleSelectionChange}
            />

            {/* Generate button */}
            <div style={{ padding: "16px 28px 32px" }}>
              <button
                className="f2-generate-btn"
                onClick={handleGenerate}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading
                  ? "Generating..."
                  : lastGenRef.current && generatedImages
                    ? "Update Design"
                    : "Generate Design"
                }
              </button>
            </div>
          </div>

          {/* Right Canvas */}
          <div className="f2-canvas">
            <button
              className="f2-panel-toggle"
              onClick={() => setPanelOpen(!panelOpen)}
              title={panelOpen ? "Hide panel" : "Show panel"}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                  transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)",
                  transform: panelOpen ? "rotate(0deg)" : "rotate(180deg)",
                }}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>

            <ResultDisplay
              imageUrls={generatedImages}
              isLoading={isLoading}
              onRegenerate={generatedImages ? handleRegenerate : null}
            />
          </div>
        </div>
      </div>
    </>
  );
}
