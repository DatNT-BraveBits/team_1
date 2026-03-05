import { useState, useRef, useEffect } from "react";

const GARMENTS = [
  { name: "Shirt", icon: "👔" },
  { name: "Dress", icon: "👗" },
  { name: "Pants", icon: "👖" },
  { name: "Jacket", icon: "🧥" },
  { name: "Skirt", icon: "🩱" },
  { name: "Coat", icon: "🧣" },
  { name: "Blazer", icon: "🤵" },
  { name: "Jumpsuit", icon: "🩳" },
];

const STYLES = [
  "Casual", "Formal", "Streetwear", "Vintage", "Minimalist",
  "Avant-Garde", "Bohemian", "Athleisure", "Couture",
];

const COLORS = [
  { name: "Noir", hex: "#1a1a1a" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Crimson", hex: "#DC143C" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Forest", hex: "#2D5A3D" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Burgundy", hex: "#722F37" },
  { name: "Slate", hex: "#708090" },
  { name: "Blush", hex: "#DE98AB" },
  { name: "Cobalt", hex: "#0047AB" },
  { name: "Olive", hex: "#556B2F" },
  { name: "Terracotta", hex: "#CC5C3B" },
];

const BODY_TYPES = [
  { name: "Slim", icon: "🧍" },
  { name: "Curvy", icon: "💃" },
  { name: "Petite", icon: "🙋‍♀️" },
  { name: "Tall", icon: "🧍‍♂️" },
];

const POSES = [
  { name: "Standing", icon: "🧍" },
  { name: "Walking", icon: "🚶" },
  { name: "Sitting", icon: "🪑" },
  { name: "Dynamic", icon: "💫" },
  { name: "Leaning", icon: "🫂" },
  { name: "Profile", icon: "👤" },
  { name: "Back", icon: "🔙" },
  { name: "Editorial", icon: "📸" },
];

const BACKGROUNDS = [
  { name: "Studio", icon: "📷" },
  { name: "Outdoor", icon: "🌿" },
  { name: "Runway", icon: "✨" },
  { name: "Urban", icon: "🏙️" },
  { name: "Nature", icon: "🏔️" },
  { name: "Interior", icon: "🛋️" },
];

const NATIONALITIES = [
  { name: "Korean", icon: "🇰🇷" },
  { name: "Japanese", icon: "🇯🇵" },
  { name: "Chinese", icon: "🇨🇳" },
  { name: "Vietnamese", icon: "🇻🇳" },
  { name: "Thai", icon: "🇹🇭" },
  { name: "Indian", icon: "🇮🇳" },
  { name: "American", icon: "🇺🇸" },
  { name: "British", icon: "🇬🇧" },
  { name: "French", icon: "🇫🇷" },
  { name: "Italian", icon: "🇮🇹" },
  { name: "Brazilian", icon: "🇧🇷" },
  { name: "Nigerian", icon: "🇳🇬" },
  { name: "Swedish", icon: "🇸🇪" },
  { name: "Australian", icon: "🇦🇺" },
  { name: "Russian", icon: "🇷🇺" },
  { name: "Mexican", icon: "🇲🇽" },
];

function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="f2-accordion">
      <button className="f2-accordion-trigger" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <svg
          className={`f2-accordion-chevron ${open ? "open" : ""}`}
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="f2-accordion-content"
        style={{
          maxHeight: open ? "1200px" : "0px",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="f2-accordion-inner">{children}</div>
      </div>
    </div>
  );
}

function NationalityDropdown({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const filtered = NATIONALITIES.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
        setHighlightIdx(-1);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightIdx(-1);
  }, [search]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0 && filtered[highlightIdx]) {
      handleSelect(filtered[highlightIdx].name);
    } else if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightIdx]) {
        items[highlightIdx].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightIdx]);

  const handleSelect = (name) => {
    onSelect(selected === name ? null : name);
    setOpen(false);
    setSearch("");
    setHighlightIdx(-1);
  };

  const selectedItem = NATIONALITIES.find((n) => n.name === selected);

  return (
    <div className="f2-dropdown-wrap" ref={dropdownRef}>
      <button
        className={`f2-dropdown-trigger ${open ? "open" : ""} ${selected ? "has-value" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {selectedItem ? (
          <span className="f2-dropdown-selected">
            <span className="f2-dropdown-selected-flag">{selectedItem.icon}</span>
            <span className="f2-dropdown-selected-name">{selectedItem.name}</span>
          </span>
        ) : (
          <span className="f2-dropdown-placeholder">Select nationality...</span>
        )}
        <svg
          className={`f2-dropdown-arrow ${open ? "open" : ""}`}
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {selected && !open && (
        <button
          className="f2-dropdown-clear"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(null);
          }}
        >
          ✕
        </button>
      )}

      <div className={`f2-dropdown-menu ${open ? "open" : ""}`}>
        <div className="f2-dropdown-search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchRef}
            className="f2-dropdown-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search country..."
          />
        </div>

        <div className="f2-dropdown-list" ref={listRef}>
          {filtered.length > 0 ? (
            filtered.map(({ name, icon }, idx) => (
              <div
                key={name}
                className={`f2-dropdown-item ${selected === name ? "selected" : ""} ${highlightIdx === idx ? "highlighted" : ""}`}
                onClick={() => handleSelect(name)}
                onMouseEnter={() => setHighlightIdx(idx)}
              >
                <span className="f2-dropdown-item-flag">{icon}</span>
                <span className="f2-dropdown-item-name">{name}</span>
                {selected === name && (
                  <svg className="f2-dropdown-item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            ))
          ) : (
            <div className="f2-dropdown-empty">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function HexInput({ onColorSelect }) {
  const [hexInput, setHexInput] = useState("");
  const [isValid, setIsValid] = useState(true);

  const validate = (val) => /^#?[0-9A-Fa-f]{6}$/.test(val);

  const handleApply = () => {
    if (validate(hexInput)) {
      const hex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
      onColorSelect(hex);
      setHexInput("");
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <span className="f2-label" style={{ marginBottom: "8px" }}>Custom Color</span>
      <div className="f2-hex-row">
        <div className="f2-hex-input-wrap" style={{ borderColor: isValid ? undefined : "#e53935" }}>
          <span className="f2-hex-prefix">#</span>
          <input
            className="f2-hex-input"
            value={hexInput.replace(/^#/, "")}
            onChange={(e) => { setHexInput(e.target.value); setIsValid(true); }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="FF5733"
            maxLength={6}
          />
        </div>
        {hexInput && validate(hexInput) && (
          <div
            className="f2-hex-preview"
            style={{ backgroundColor: hexInput.startsWith("#") ? hexInput : `#${hexInput}` }}
          />
        )}
        <button className="f2-hex-apply" onClick={handleApply}>Apply</button>
      </div>
      {!isValid && (
        <span className="f2-shake" style={{ fontSize: "11px", color: "#e53935", marginTop: "6px", display: "block" }}>
          Enter a valid 6-digit hex code
        </span>
      )}
    </div>
  );
}

export function OptionSelector({ selections, onSelectionChange }) {
  // Multi-select toggle (for style, color palette tags, etc.)
  const toggleMulti = (category, choice) => {
    const current = selections[category] || [];
    const updated = current.includes(choice)
      ? current.filter((c) => c !== choice)
      : [...current, choice];
    onSelectionChange({ ...selections, [category]: updated });
  };

  // Single-select toggle (click again to deselect)
  const toggleSingle = (category, choice) => {
    const current = selections[category];
    if (current === choice) {
      onSelectionChange({ ...selections, [category]: null });
    } else {
      onSelectionChange({ ...selections, [category]: choice });
    }
  };

  const setSingle = (category, value) => {
    onSelectionChange({ ...selections, [category]: value });
  };

  return (
    <div>
      <Accordion title="Garment & Style" defaultOpen={true}>
        <span className="f2-label" style={{ marginBottom: 0 }}>Garment Type</span>
        <div className="f2-hscroll" style={{ paddingTop: "12px" }}>
          {GARMENTS.map(({ name, icon }) => (
            <div
              key={name}
              className={`f2-garment-card ${selections.garment === name ? "selected" : ""}`}
              onClick={() => toggleSingle("garment", name)}
            >
              <span className="f2-garment-icon">{icon}</span>
              <span className="f2-garment-name">{name}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20px" }}>
          <span className="f2-label">Fashion Style</span>
          <div className="f2-chips">
            {STYLES.map((s) => (
              <button
                key={s}
                className={`f2-chip ${(selections.style || []).includes(s) ? "selected" : ""}`}
                onClick={() => toggleMulti("style", s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Accordion>

      <Accordion title="Model" defaultOpen={true}>
        <span className="f2-label">Nationality</span>
        <NationalityDropdown
          selected={selections.nationality}
          onSelect={(val) => setSingle("nationality", val)}
        />

        <div style={{ marginTop: "20px" }}>
          <span className="f2-label">Body Type</span>
          <div className="f2-body-types">
            {BODY_TYPES.map(({ name, icon }) => (
              <div
                key={name}
                className={`f2-body-type ${selections.bodyType === name ? "selected" : ""}`}
                onClick={() => toggleSingle("bodyType", name)}
              >
                <span className="f2-body-type-icon">{icon}</span>
                <span className="f2-body-type-name">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <span className="f2-label">Body Measurements</span>
          <div className="f2-measurements-row">
            <div className="f2-measurement-field">
              <label className="f2-measurement-label">Height</label>
              <div className="f2-measurement-input-wrap">
                <input
                  type="number"
                  className="f2-measurement-input"
                  value={selections.height || ""}
                  onChange={(e) => setSingle("height", e.target.value)}
                  placeholder="165"
                  min="100"
                  max="220"
                />
                <span className="f2-measurement-unit">cm</span>
              </div>
            </div>
            <div className="f2-measurement-field">
              <label className="f2-measurement-label">Weight</label>
              <div className="f2-measurement-input-wrap">
                <input
                  type="number"
                  className="f2-measurement-input"
                  value={selections.weight || ""}
                  onChange={(e) => setSingle("weight", e.target.value)}
                  placeholder="55"
                  min="30"
                  max="200"
                />
                <span className="f2-measurement-unit">kg</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "12px" }}>
            <label className="f2-measurement-label" style={{ marginBottom: "8px", display: "block" }}>
              Three Measurements (Bust - Waist - Hips)
            </label>
            <div className="f2-measurements-row three">
              <div className="f2-measurement-field">
                <div className="f2-measurement-input-wrap">
                  <input
                    type="number"
                    className="f2-measurement-input"
                    value={selections.bust || ""}
                    onChange={(e) => setSingle("bust", e.target.value)}
                    placeholder="88"
                    min="50"
                    max="150"
                  />
                  <span className="f2-measurement-unit">cm</span>
                </div>
                <span className="f2-measurement-hint">Bust</span>
              </div>
              <span className="f2-measurement-separator">-</span>
              <div className="f2-measurement-field">
                <div className="f2-measurement-input-wrap">
                  <input
                    type="number"
                    className="f2-measurement-input"
                    value={selections.waist || ""}
                    onChange={(e) => setSingle("waist", e.target.value)}
                    placeholder="64"
                    min="40"
                    max="130"
                  />
                  <span className="f2-measurement-unit">cm</span>
                </div>
                <span className="f2-measurement-hint">Waist</span>
              </div>
              <span className="f2-measurement-separator">-</span>
              <div className="f2-measurement-field">
                <div className="f2-measurement-input-wrap">
                  <input
                    type="number"
                    className="f2-measurement-input"
                    value={selections.hips || ""}
                    onChange={(e) => setSingle("hips", e.target.value)}
                    placeholder="92"
                    min="50"
                    max="160"
                  />
                  <span className="f2-measurement-unit">cm</span>
                </div>
                <span className="f2-measurement-hint">Hips</span>
              </div>
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Color & Appearance" defaultOpen={true}>
        <span className="f2-label">Color Palette</span>
        <div className="f2-colors">
          {COLORS.map(({ name, hex }) => (
            <div key={hex} style={{ textAlign: "center" }}>
              <div
                className={`f2-color-swatch ${selections.color === hex ? "selected" : ""}`}
                style={{
                  backgroundColor: hex,
                  border: hex === "#FFFFF0" ? "1px solid #ddd" : undefined,
                }}
                onClick={() => setSingle("color", selections.color === hex ? null : hex)}
                title={name}
              />
              <div className="f2-color-name">{name}</div>
            </div>
          ))}
        </div>
        <HexInput onColorSelect={(hex) => setSingle("color", hex)} />
      </Accordion>

      <Accordion title="Pose & Background" defaultOpen={false}>
        <span className="f2-label">Pose</span>
        <div className="f2-pose-grid">
          {POSES.map(({ name, icon }) => (
            <div
              key={name}
              className={`f2-pose-item ${selections.pose === name ? "selected" : ""}`}
              onClick={() => toggleSingle("pose", name)}
            >
              <span className="f2-pose-icon">{icon}</span>
              <span className="f2-pose-name">{name}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20px" }}>
          <span className="f2-label">Background</span>
          <div className="f2-bg-cards">
            {BACKGROUNDS.map(({ name, icon }) => (
              <div
                key={name}
                className={`f2-bg-card ${selections.background === name ? "selected" : ""}`}
                onClick={() => toggleSingle("background", name)}
              >
                <div className="f2-bg-card-icon">{icon}</div>
                <div className="f2-bg-card-name">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      <Accordion title="Custom Details" defaultOpen={false}>
        <span className="f2-label">Design Description</span>
        <span style={{ display: "block", fontSize: "11px", color: "#aaa", marginBottom: "8px", lineHeight: "1.4" }}>
          Describe specific details you want — e.g. round neck, short sleeves, knee-length, pleated...
        </span>
        <textarea
          className="f2-textarea"
          value={selections.customPrompt || ""}
          onChange={(e) => setSingle("customPrompt", e.target.value)}
          placeholder="e.g. Round neck, short sleeves, body-hugging fit, knee-length, two side pockets..."
          rows={3}
        />

        <div style={{ marginTop: "20px" }}>
          <span className="f2-label">Avoid (Negative Prompt)</span>
          <span style={{ display: "block", fontSize: "11px", color: "#aaa", marginBottom: "8px", lineHeight: "1.4" }}>
            Elements you do NOT want in the image
          </span>
          <textarea
            className="f2-textarea"
            value={selections.negativePrompt || ""}
            onChange={(e) => setSingle("negativePrompt", e.target.value)}
            placeholder="e.g. blurry, low quality, distorted, extra fingers..."
            rows={2}
          />
        </div>
      </Accordion>

      <Accordion title="Advanced" defaultOpen={false}>
        <div className="f2-slider-row">
          <span className="f2-slider-label">Prompt Strength</span>
          <input
            type="range"
            className="f2-slider"
            min="1" max="10"
            value={selections.promptStrength || 7}
            onChange={(e) => setSingle("promptStrength", Number(e.target.value))}
          />
          <span className="f2-slider-value">{selections.promptStrength || 7}</span>
        </div>

        <div className="f2-slider-row">
          <span className="f2-slider-label">Variations</span>
          <input
            type="range"
            className="f2-slider"
            min="1" max="4"
            value={selections.variations || 1}
            onChange={(e) => setSingle("variations", Number(e.target.value))}
          />
          <span className="f2-slider-value">{selections.variations || 1}</span>
        </div>
      </Accordion>
    </div>
  );
}
