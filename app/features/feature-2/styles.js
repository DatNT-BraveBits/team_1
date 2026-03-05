export const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --f2-bg: #FAF9F6;
    --f2-bg-warm: #F8F5F2;
    --f2-forest: #2D5A3D;
    --f2-forest-light: rgba(45,90,61,0.08);
    --f2-forest-glow: rgba(45,90,61,0.15);
    --f2-charcoal: #1F2526;
    --f2-charcoal-soft: #3A3F40;
    --f2-ivory: #FFFFF0;
    --f2-border: rgba(0,0,0,0.06);
    --f2-border-hover: rgba(0,0,0,0.12);
    --f2-shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
    --f2-shadow-md: 0 4px 16px rgba(0,0,0,0.06);
    --f2-shadow-lg: 0 8px 32px rgba(0,0,0,0.08);
    --f2-shadow-float: 0 12px 40px rgba(0,0,0,0.10);
    --f2-ease: cubic-bezier(0.22, 1, 0.36, 1);
    --f2-serif: 'Cormorant Garamond', Georgia, serif;
    --f2-sans: 'Inter', -apple-system, sans-serif;
  }

  @media (prefers-reduced-motion: reduce) {
    .f2-studio * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  .f2-studio {
    background: var(--f2-bg);
    min-height: 100vh;
    font-family: var(--f2-sans);
    color: var(--f2-charcoal);
  }

  /* Layout */
  .f2-layout {
    display: flex;
    height: calc(100vh - 60px);
    overflow: hidden;
  }

  .f2-panel {
    width: 40%;
    min-width: 40%;
    background: #fff;
    border-right: 1px solid var(--f2-border);
    box-shadow: 4px 0 24px rgba(0,0,0,0.03);
    overflow-y: auto;
    overflow-x: hidden;
    transition: width 400ms var(--f2-ease), min-width 400ms var(--f2-ease), opacity 400ms var(--f2-ease);
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.1) transparent;
  }

  .f2-panel.collapsed {
    width: 0%;
    min-width: 0%;
    opacity: 0;
    overflow: hidden;
  }

  .f2-panel::-webkit-scrollbar { width: 4px; }
  .f2-panel::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

  .f2-panel-header {
    padding: 28px 28px 20px;
    border-bottom: 1px solid var(--f2-border);
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 10;
  }

  .f2-panel-title {
    font-family: var(--f2-serif);
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: var(--f2-charcoal);
    margin: 0;
  }

  .f2-panel-subtitle {
    font-size: 15px;
    color: #999;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-top: 6px;
    font-weight: 500;
  }

  .f2-canvas {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;
    overflow: hidden;
    background: var(--f2-bg);
  }

  /* Accordion */
  .f2-accordion {
    border-bottom: 1px solid var(--f2-border);
  }

  .f2-accordion-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--f2-sans);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--f2-charcoal-soft);
    transition: color 300ms var(--f2-ease), background 300ms var(--f2-ease);
  }

  .f2-accordion-trigger:hover {
    background: var(--f2-forest-light);
    color: var(--f2-forest);
  }

  .f2-accordion-chevron {
    transition: transform 350ms var(--f2-ease);
    opacity: 0.4;
  }

  .f2-accordion-chevron.open {
    transform: rotate(180deg);
  }

  .f2-accordion-content {
    overflow: hidden;
    transition: max-height 400ms var(--f2-ease), opacity 350ms var(--f2-ease);
  }

  .f2-accordion-inner {
    padding: 0 28px 28px;
  }

  /* Section label */
  .f2-label {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 12px;
    display: block;
  }

  /* Upload zone */
  .f2-dropzone {
    border: 1.5px dashed rgba(0,0,0,0.15);
    border-radius: 12px;
    padding: 36px 20px;
    text-align: center;
    cursor: pointer;
    background: var(--f2-bg);
    transition: all 400ms var(--f2-ease);
    position: relative;
    overflow: hidden;
  }

  .f2-dropzone:hover {
    border-color: var(--f2-forest);
    background: var(--f2-forest-light);
  }

  .f2-dropzone.empty {
    animation: f2-pulse-border 2s ease-in-out infinite;
  }

  @keyframes f2-pulse-border {
    0%, 100% { border-color: rgba(0,0,0,0.12); }
    50% { border-color: rgba(45,90,61,0.3); }
  }

  .f2-swatch-container {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    animation: f2-fade-scale-in 400ms var(--f2-ease) forwards;
  }

  @keyframes f2-fade-scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .f2-swatch {
    width: 120px;
    height: 160px;
    border-radius: 10px;
    object-fit: cover;
    box-shadow: var(--f2-shadow-md);
    flex-shrink: 0;
  }

  /* Textarea */
  .f2-textarea {
    width: 100%;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid var(--f2-border);
    font-family: var(--f2-sans);
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
    background: var(--f2-bg);
    color: var(--f2-charcoal);
    transition: border-color 300ms var(--f2-ease), box-shadow 300ms var(--f2-ease);
    outline: none;
    box-sizing: border-box;
  }

  .f2-textarea:focus {
    border-color: var(--f2-forest);
    box-shadow: 0 0 0 3px var(--f2-forest-light);
  }

  .f2-textarea::placeholder {
    color: #bbb;
    font-style: italic;
  }

  /* Fabric tags */
  .f2-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .f2-tag {
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid var(--f2-border);
    background: #fff;
    font-size: 15px;
    color: #888;
    cursor: pointer;
    transition: all 250ms var(--f2-ease);
    font-family: var(--f2-sans);
  }

  .f2-tag:hover, .f2-tag.active {
    background: var(--f2-forest);
    color: #fff;
    border-color: var(--f2-forest);
  }

  /* Horizontal scroll cards (garment type) */
  .f2-hscroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .f2-hscroll::-webkit-scrollbar { display: none; }

  .f2-garment-card {
    flex-shrink: 0;
    width: 80px;
    padding: 16px 8px 12px;
    border-radius: 12px;
    border: 1.5px solid var(--f2-border);
    background: #fff;
    cursor: pointer;
    text-align: center;
    transition: all 300ms var(--f2-ease);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .f2-garment-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--f2-shadow-md);
    border-color: var(--f2-border-hover);
  }

  .f2-garment-card.selected {
    transform: translateY(-4px) scale(1.08);
    border-color: var(--f2-forest);
    box-shadow: var(--f2-shadow-lg), 0 0 0 3px var(--f2-forest-light);
    background: var(--f2-forest-light);
  }

  .f2-garment-icon {
    font-size: 26px;
    line-height: 1;
    transition: transform 300ms var(--f2-ease);
  }

  .f2-garment-card.selected .f2-garment-icon {
    transform: scale(1.1);
  }

  .f2-garment-name {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.3px;
    color: #888;
    transition: color 300ms var(--f2-ease);
  }

  .f2-garment-card.selected .f2-garment-name {
    color: var(--f2-forest);
    font-weight: 600;
  }

  /* Chips */
  .f2-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .f2-chip {
    padding: 8px 18px;
    border-radius: 24px;
    border: 1px solid var(--f2-border);
    background: #fff;
    cursor: pointer;
    font-family: var(--f2-sans);
    font-size: 14px;
    font-weight: 400;
    color: #666;
    transition: all 300ms var(--f2-ease);
    outline: none;
  }

  .f2-chip:hover {
    border-color: var(--f2-border-hover);
    transform: scale(1.03);
  }

  .f2-chip.selected {
    background: var(--f2-forest);
    color: #fff;
    border-color: var(--f2-forest);
    font-weight: 500;
    box-shadow: 0 0 12px var(--f2-forest-glow);
    animation: f2-chip-glow 800ms var(--f2-ease);
  }

  @keyframes f2-chip-glow {
    0% { box-shadow: 0 0 0px var(--f2-forest-glow); }
    50% { box-shadow: 0 0 16px var(--f2-forest-glow); }
    100% { box-shadow: 0 0 12px var(--f2-forest-glow); }
  }

  /* Color palette */
  .f2-colors {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .f2-colors > div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .f2-color-swatch {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 300ms var(--f2-ease);
    position: relative;
  }

  .f2-color-swatch:hover {
    transform: scale(1.15);
  }

  .f2-color-swatch.selected {
    transform: scale(1.2);
    box-shadow: 0 0 0 3px var(--f2-bg), 0 0 0 5px var(--f2-forest);
  }

  .f2-color-name {
    font-size: 11px;
    text-align: center;
    color: #aaa;
    margin-top: 4px;
    letter-spacing: 0.2px;
    width: 32px;
    line-height: 1.2;
  }

  /* Hex input */
  .f2-hex-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
  }

  .f2-hex-input-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--f2-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--f2-bg);
    transition: border-color 300ms var(--f2-ease);
  }

  .f2-hex-input-wrap:focus-within {
    border-color: var(--f2-forest);
    box-shadow: 0 0 0 3px var(--f2-forest-light);
  }

  .f2-hex-prefix {
    padding: 8px 0 8px 10px;
    font-size: 14px;
    color: #bbb;
    font-family: 'SF Mono', 'Fira Code', monospace;
    user-select: none;
  }

  .f2-hex-input {
    padding: 8px 10px 8px 2px;
    border: none;
    font-size: 14px;
    width: 72px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    outline: none;
    background: transparent;
    color: var(--f2-charcoal);
  }

  .f2-hex-preview {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid var(--f2-border);
    transition: background-color 200ms var(--f2-ease);
  }

  .f2-hex-apply {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background: var(--f2-charcoal);
    color: #fff;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    font-family: var(--f2-sans);
    transition: all 250ms var(--f2-ease);
  }

  .f2-hex-apply:hover {
    background: var(--f2-forest);
  }

  /* Pose grid */
  .f2-pose-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .f2-pose-item {
    aspect-ratio: 3/4;
    border-radius: 10px;
    border: 1.5px solid var(--f2-border);
    background: var(--f2-bg);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 300ms var(--f2-ease);
    overflow: hidden;
    position: relative;
  }

  .f2-pose-item:hover {
    transform: scale(1.04);
    border-color: var(--f2-border-hover);
    box-shadow: var(--f2-shadow-sm);
  }

  .f2-pose-item.selected {
    border-color: var(--f2-forest);
    background: var(--f2-forest-light);
    box-shadow: 0 0 0 3px var(--f2-forest-light);
  }

  .f2-pose-icon {
    font-size: 26px;
    transition: transform 300ms var(--f2-ease);
  }

  .f2-pose-item.selected .f2-pose-icon {
    transform: scale(1.15);
  }

  .f2-pose-name {
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.3px;
    color: #aaa;
  }

  .f2-pose-item.selected .f2-pose-name {
    color: var(--f2-forest);
  }

  /* Background cards */
  .f2-bg-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .f2-bg-card {
    padding: 14px 8px;
    border-radius: 10px;
    border: 1.5px solid var(--f2-border);
    background: #fff;
    cursor: pointer;
    text-align: center;
    transition: all 300ms var(--f2-ease);
  }

  .f2-bg-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--f2-shadow-sm);
  }

  .f2-bg-card.selected {
    border-color: var(--f2-forest);
    background: var(--f2-forest-light);
    box-shadow: var(--f2-shadow-md);
  }

  .f2-bg-card-icon {
    font-size: 26px;
    margin-bottom: 4px;
  }

  .f2-bg-card-name {
    font-size: 14px;
    font-weight: 500;
    color: #888;
    letter-spacing: 0.2px;
  }

  .f2-bg-card.selected .f2-bg-card-name {
    color: var(--f2-forest);
    font-weight: 600;
  }

  /* Canvas states */
  .f2-canvas-empty {
    text-align: center;
    animation: f2-breathe 8s ease-in-out infinite;
  }

  @keyframes f2-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  .f2-canvas-empty-title {
    font-family: var(--f2-serif);
    font-size: 32px;
    font-weight: 300;
    color: var(--f2-charcoal);
    letter-spacing: -0.5px;
    line-height: 1.4;
    max-width: 360px;
    margin: 0 auto;
  }

  .f2-canvas-empty-sub {
    font-size: 15px;
    color: #aaa;
    margin-top: 12px;
    letter-spacing: 0.3px;
  }

  /* Loading shimmer */
  .f2-shimmer-wrap {
    width: 100%;
    max-width: 560px;
    aspect-ratio: 1;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    background: var(--f2-bg-warm);
  }

  .f2-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      transparent 25%,
      rgba(45,90,61,0.06) 37%,
      transparent 63%
    );
    background-size: 200% 100%;
    animation: f2-shimmer-move 1.8s ease-in-out infinite;
  }

  @keyframes f2-shimmer-move {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .f2-shimmer-text {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #999;
  }

  /* Result image */
  .f2-result-wrap {
    max-width: 560px;
    width: 100%;
    animation: f2-fade-scale-in 500ms var(--f2-ease) forwards;
    perspective: 800px;
  }

  .f2-result-img-wrap {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--f2-shadow-lg);
    transition: box-shadow 400ms var(--f2-ease), transform 400ms var(--f2-ease);
    will-change: transform;
  }

  .f2-result-img-wrap:hover {
    box-shadow: var(--f2-shadow-float);
  }

  .f2-result-img {
    width: 100%;
    display: block;
  }

  /* Toolbar */
  .f2-toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 24px;
    animation: f2-slide-up 300ms var(--f2-ease) forwards;
    padding: 8px 12px;
    background: #fff;
    border-radius: 14px;
    box-shadow: var(--f2-shadow-md);
  }

  @keyframes f2-slide-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .f2-toolbar-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border: none;
    border-radius: 10px;
    background: transparent;
    cursor: pointer;
    font-family: var(--f2-sans);
    font-size: 14px;
    font-weight: 500;
    color: #666;
    letter-spacing: 0.3px;
    transition: all 250ms var(--f2-ease);
    position: relative;
  }

  .f2-toolbar-btn:hover {
    background: var(--f2-forest-light);
    color: var(--f2-forest);
    transform: scale(1.03);
  }

  .f2-toolbar-btn:hover svg {
    animation: f2-icon-bounce 400ms var(--f2-ease);
  }

  @keyframes f2-icon-bounce {
    0%, 100% { transform: translateY(0); }
    40% { transform: translateY(-3px); }
  }

  .f2-toolbar-btn.primary {
    background: var(--f2-charcoal);
    color: #fff;
  }

  .f2-toolbar-btn.primary:hover {
    background: var(--f2-forest);
    color: #fff;
  }

  .f2-toolbar-divider {
    width: 1px;
    height: 24px;
    background: var(--f2-border);
    margin: 0 4px;
  }

  /* Generate button */
  .f2-generate-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 10px;
    background: var(--f2-charcoal);
    color: #fff;
    font-family: var(--f2-sans);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 300ms var(--f2-ease);
    margin-top: 8px;
  }

  .f2-generate-btn:hover {
    background: var(--f2-forest);
    transform: scale(1.01);
    box-shadow: 0 4px 16px var(--f2-forest-glow);
  }

  .f2-generate-btn:active {
    transform: scale(0.96);
  }

  /* Panel toggle */
  .f2-panel-toggle {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid var(--f2-border);
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--f2-shadow-sm);
    transition: all 250ms var(--f2-ease);
    z-index: 20;
    color: var(--f2-charcoal);
  }

  .f2-panel-toggle:hover {
    box-shadow: var(--f2-shadow-md);
    border-color: var(--f2-border-hover);
  }

  /* Advanced slider */
  .f2-slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .f2-slider-label {
    font-size: 15px;
    color: #888;
    min-width: 90px;
    font-weight: 500;
  }

  .f2-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 3px;
    border-radius: 2px;
    background: var(--f2-border);
    outline: none;
  }

  .f2-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--f2-forest);
    cursor: pointer;
    box-shadow: var(--f2-shadow-sm);
    transition: transform 200ms var(--f2-ease);
  }

  .f2-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .f2-slider-value {
    font-size: 15px;
    color: var(--f2-charcoal);
    font-weight: 600;
    min-width: 28px;
    text-align: right;
    font-family: 'SF Mono', monospace;
  }

  /* Error shake */
  @keyframes f2-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .f2-shake {
    animation: f2-shake 200ms ease-in-out;
  }

  /* Confetti */
  @keyframes f2-confetti-fall {
    0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
  }

  .f2-confetti {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: f2-confetti-fall 2s var(--f2-ease) forwards;
    pointer-events: none;
  }

  /* Body type */
  .f2-body-types {
    display: flex;
    gap: 10px;
  }

  .f2-body-type {
    flex: 1;
    padding: 10px 4px;
    border-radius: 10px;
    border: 1.5px solid var(--f2-border);
    background: #fff;
    cursor: pointer;
    text-align: center;
    transition: all 300ms var(--f2-ease);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .f2-body-type:hover {
    transform: scale(1.03);
  }

  .f2-body-type.selected {
    border-color: var(--f2-forest);
    background: var(--f2-forest-light);
    animation: f2-bounce-in 400ms var(--f2-ease);
  }

  @keyframes f2-bounce-in {
    0% { transform: scale(1); }
    40% { transform: scale(1.12); }
    100% { transform: scale(1.1); }
  }

  .f2-body-type-icon {
    font-size: 26px;
    transition: transform 300ms var(--f2-ease);
  }

  .f2-body-type.selected .f2-body-type-icon {
    transform: scale(1.1);
  }

  .f2-body-type-name {
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.3px;
    color: #aaa;
  }

  .f2-body-type.selected .f2-body-type-name {
    color: var(--f2-forest);
    font-weight: 600;
  }

  /* Body measurements */
  .f2-measurements-row {
    display: flex;
    gap: 12px;
  }

  .f2-measurements-row.three {
    align-items: flex-start;
  }

  .f2-measurement-field {
    flex: 1;
    min-width: 0;
  }

  .f2-measurement-label {
    font-size: 12px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.3px;
    margin-bottom: 6px;
    display: block;
  }

  .f2-measurement-input-wrap {
    display: flex;
    align-items: center;
    border: 1.5px solid var(--f2-border);
    border-radius: 8px;
    background: var(--f2-bg);
    transition: border-color 300ms var(--f2-ease), box-shadow 300ms var(--f2-ease);
    overflow: hidden;
  }

  .f2-measurement-input-wrap:focus-within {
    border-color: var(--f2-forest);
    box-shadow: 0 0 0 3px var(--f2-forest-light);
  }

  .f2-measurement-input {
    flex: 1;
    min-width: 0;
    padding: 9px 8px 9px 12px;
    border: none;
    outline: none;
    font-family: var(--f2-sans);
    font-size: 14px;
    color: var(--f2-charcoal);
    background: transparent;
    -moz-appearance: textfield;
  }

  .f2-measurement-input::-webkit-outer-spin-button,
  .f2-measurement-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .f2-measurement-input::placeholder {
    color: #ccc;
  }

  .f2-measurement-unit {
    padding: 9px 10px 9px 4px;
    font-size: 12px;
    font-weight: 500;
    color: #aaa;
    letter-spacing: 0.3px;
    user-select: none;
    flex-shrink: 0;
  }

  .f2-measurement-separator {
    display: flex;
    align-items: center;
    padding-top: 2px;
    font-size: 16px;
    color: #ccc;
    font-weight: 300;
    flex-shrink: 0;
  }

  .f2-measurement-hint {
    display: block;
    font-size: 10px;
    color: #bbb;
    text-align: center;
    margin-top: 4px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  /* Nationality dropdown */
  .f2-dropdown-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 16px;
    border-radius: 10px;
    border: 1.5px solid var(--f2-border);
    background: #fff;
    cursor: pointer;
    font-family: var(--f2-sans);
    font-size: 14px;
    color: var(--f2-charcoal);
    transition: all 300ms var(--f2-ease);
    outline: none;
    text-align: left;
  }

  .f2-dropdown-trigger:hover {
    border-color: var(--f2-border-hover);
    box-shadow: var(--f2-shadow-sm);
  }

  .f2-dropdown-trigger.open {
    border-color: var(--f2-forest);
    box-shadow: 0 0 0 3px var(--f2-forest-light);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .f2-dropdown-trigger.has-value {
    border-color: var(--f2-forest);
    background: var(--f2-forest-light);
  }

  .f2-dropdown-trigger.has-value.open {
    background: #fff;
  }

  .f2-dropdown-selected {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .f2-dropdown-selected-flag {
    font-size: 26px;
    line-height: 1;
  }

  .f2-dropdown-selected-name {
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  .f2-dropdown-placeholder {
    color: #bbb;
    font-weight: 400;
    font-style: italic;
  }

  .f2-dropdown-arrow {
    transition: transform 350ms var(--f2-ease);
    opacity: 0.4;
    flex-shrink: 0;
  }

  .f2-dropdown-arrow.open {
    transform: rotate(180deg);
    opacity: 0.7;
  }

  .f2-dropdown-clear {
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #bbb;
    font-size: 14px;
    padding: 4px;
    line-height: 1;
    transition: color 200ms var(--f2-ease);
    z-index: 2;
  }

  .f2-dropdown-clear:hover {
    color: var(--f2-charcoal);
  }

  .f2-dropdown-wrap {
    position: relative;
    z-index: 999;
  }

  .f2-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1.5px solid var(--f2-forest);
    border-top: none;
    border-radius: 0 0 10px 10px;
    box-shadow: var(--f2-shadow-lg);
    z-index: 9999;
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    transition: opacity 300ms var(--f2-ease), transform 300ms var(--f2-ease);
    overflow: hidden;
  }

  .f2-dropdown-menu.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }

  .f2-dropdown-search-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--f2-border);
    background: var(--f2-bg);
  }

  .f2-dropdown-search {
    flex: 1;
    border: none;
    outline: none;
    font-family: var(--f2-sans);
    font-size: 14px;
    color: var(--f2-charcoal);
    background: transparent;
  }

  .f2-dropdown-search::placeholder {
    color: #ccc;
  }

  .f2-dropdown-list {
    max-height: 240px;
    overflow-y: auto;
    padding: 6px 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.08) transparent;
  }

  .f2-dropdown-list::-webkit-scrollbar { width: 4px; }
  .f2-dropdown-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 4px; }

  .f2-dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    cursor: pointer;
    transition: all 200ms var(--f2-ease);
    position: relative;
  }

  .f2-dropdown-item:hover,
  .f2-dropdown-item.highlighted {
    background: var(--f2-forest-light);
  }

  .f2-dropdown-item.selected {
    background: var(--f2-forest-light);
  }

  .f2-dropdown-item.selected .f2-dropdown-item-name {
    color: var(--f2-forest);
    font-weight: 600;
  }

  .f2-dropdown-item-flag {
    font-size: 26px;
    line-height: 1;
    transition: transform 250ms var(--f2-ease);
  }

  .f2-dropdown-item:hover .f2-dropdown-item-flag,
  .f2-dropdown-item.highlighted .f2-dropdown-item-flag {
    transform: scale(1.15);
  }

  .f2-dropdown-item-name {
    font-size: 14px;
    color: var(--f2-charcoal);
    font-weight: 400;
    letter-spacing: 0.2px;
    flex: 1;
  }

  .f2-dropdown-item-check {
    color: var(--f2-forest);
    flex-shrink: 0;
    animation: f2-fade-scale-in 250ms var(--f2-ease) forwards;
  }

  .f2-dropdown-empty {
    padding: 20px 16px;
    text-align: center;
    font-size: 14px;
    color: #bbb;
    font-style: italic;
  }
`;
