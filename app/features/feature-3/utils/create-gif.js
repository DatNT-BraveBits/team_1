// Use direct path to the ESM build to avoid CJS interop issues
import {
  GIFEncoder,
  quantize,
  applyPalette,
} from "gifenc/dist/gifenc.esm.js";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

// Draw image covering the canvas, centered
function drawCover(ctx, img, w, h) {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = w / h;
  let dw, dh, dx, dy;
  if (imgAspect > canvasAspect) {
    dh = h;
    dw = h * imgAspect;
    dx = (w - dw) / 2;
    dy = 0;
  } else {
    dw = w;
    dh = w / imgAspect;
    dx = 0;
    dy = (h - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Draw image with zoom (scale from center)
function drawZoomed(ctx, img, w, h, scale) {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);
  drawCover(ctx, img, w, h);
  ctx.restore();
}

// --- Frame generators per effect ---

function framesNone(images, w, h, ctx, delay) {
  const frames = [];
  for (const img of images) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    drawCover(ctx, img, w, h);
    frames.push({ data: ctx.getImageData(0, 0, w, h), delay });
  }
  return frames;
}

function framesZoom(images, w, h, ctx, delay, direction) {
  const frames = [];
  const stepsPerImage = 12;
  const frameDelay = Math.round(delay / stepsPerImage);

  for (let i = 0; i < images.length; i++) {
    for (let s = 0; s < stepsPerImage; s++) {
      const t = s / (stepsPerImage - 1);
      const scale =
        direction === "in" ? 1 + t * 0.3 : 1.3 - t * 0.3;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      drawZoomed(ctx, images[i], w, h, scale);
      frames.push({ data: ctx.getImageData(0, 0, w, h), delay: frameDelay });
    }
  }
  return frames;
}

function framesFade(images, w, h, ctx, delay) {
  const frames = [];
  const transitionSteps = 10;
  const transitionDelay = 40;

  for (let i = 0; i < images.length; i++) {
    // Main frame
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    drawCover(ctx, images[i], w, h);
    frames.push({ data: ctx.getImageData(0, 0, w, h), delay });

    // Transition to next image
    if (i < images.length - 1) {
      for (let s = 1; s <= transitionSteps; s++) {
        const t = s / (transitionSteps + 1);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1 - t;
        drawCover(ctx, images[i], w, h);
        ctx.globalAlpha = t;
        drawCover(ctx, images[i + 1], w, h);
        frames.push({
          data: ctx.getImageData(0, 0, w, h),
          delay: transitionDelay,
        });
      }
    }
  }
  ctx.globalAlpha = 1;
  return frames;
}

function framesBlur(images, w, h, ctx, delay) {
  const frames = [];
  const blurSteps = 8;
  const blurDelay = 30;

  for (let i = 0; i < images.length; i++) {
    // Sharp main frame
    ctx.filter = "none";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    drawCover(ctx, images[i], w, h);
    frames.push({ data: ctx.getImageData(0, 0, w, h), delay });

    // Blur out → blur in transition
    if (i < images.length - 1) {
      // Blur out current
      for (let s = 1; s <= blurSteps; s++) {
        const blur = (s / blurSteps) * 10;
        ctx.filter = `blur(${blur}px)`;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        drawCover(ctx, images[i], w, h);
        frames.push({
          data: ctx.getImageData(0, 0, w, h),
          delay: blurDelay,
        });
      }
      // Blur in next
      for (let s = blurSteps; s >= 1; s--) {
        const blur = (s / blurSteps) * 10;
        ctx.filter = `blur(${blur}px)`;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        drawCover(ctx, images[i + 1], w, h);
        frames.push({
          data: ctx.getImageData(0, 0, w, h),
          delay: blurDelay,
        });
      }
    }
  }
  ctx.filter = "none";
  return frames;
}

function framesSpotlight(images, w, h, ctx, delay) {
  const frames = [];
  const stepsPerImage = 14;
  const frameDelay = Math.round(delay / stepsPerImage);

  for (let i = 0; i < images.length; i++) {
    for (let s = 0; s < stepsPerImage; s++) {
      const t = s / (stepsPerImage - 1);

      // Draw image
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      drawCover(ctx, images[i], w, h);

      // Darken overlay
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, w, h);

      // Spotlight circle (moves across image)
      const spotX = w * (0.2 + t * 0.6);
      const spotY = h * (0.3 + 0.2 * Math.sin(t * Math.PI));
      const radius = Math.min(w, h) * 0.35;

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      const g = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, radius);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.7, "rgba(0,0,0,0.6)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      frames.push({ data: ctx.getImageData(0, 0, w, h), delay: frameDelay });
    }
  }
  return frames;
}

function framesBounce(images, w, h, ctx, delay) {
  const frames = [];
  const stepsPerImage = 14;
  const frameDelay = Math.round(delay / stepsPerImage);

  for (let i = 0; i < images.length; i++) {
    for (let s = 0; s < stepsPerImage; s++) {
      const t = s / (stepsPerImage - 1);
      // Bounce: scale goes 1 → 1.08 → 1 using sine
      const scale = 1 + 0.08 * Math.sin(t * Math.PI);

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      drawZoomed(ctx, images[i], w, h, scale);
      frames.push({ data: ctx.getImageData(0, 0, w, h), delay: frameDelay });
    }
  }
  return frames;
}

function framesSlide(images, w, h, ctx, delay) {
  const frames = [];
  const transitionSteps = 12;
  const transitionDelay = 30;

  for (let i = 0; i < images.length; i++) {
    // Main frame
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    drawCover(ctx, images[i], w, h);
    frames.push({ data: ctx.getImageData(0, 0, w, h), delay });

    // Slide transition to next
    if (i < images.length - 1) {
      for (let s = 1; s <= transitionSteps; s++) {
        const t = s / (transitionSteps + 1);
        const offset = Math.round(t * w);

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);

        // Current slides left
        ctx.save();
        ctx.translate(-offset, 0);
        drawCover(ctx, images[i], w, h);
        ctx.restore();

        // Next slides in from right
        ctx.save();
        ctx.translate(w - offset, 0);
        drawCover(ctx, images[i + 1], w, h);
        ctx.restore();

        frames.push({
          data: ctx.getImageData(0, 0, w, h),
          delay: transitionDelay,
        });
      }
    }
  }
  return frames;
}

// --- Badge drawing ---

function getBadgeMetrics(ctx, w, h, badge) {
  const { text, position = "top-right" } = badge;

  const fontSize = Math.max(12, Math.round(w * 0.04));
  ctx.font = `bold ${fontSize}px sans-serif`;
  const textMetrics = ctx.measureText(text);
  const textW = textMetrics.width;
  const padX = fontSize * 0.6;
  const padY = fontSize * 0.35;
  const badgeW = textW + padX * 2;
  const badgeH = fontSize + padY * 2;
  const margin = Math.round(w * 0.03);

  let x, y;
  switch (position) {
    case "top-left": x = margin; y = margin; break;
    case "top-right": x = w - badgeW - margin; y = margin; break;
    case "bottom-left": x = margin; y = h - badgeH - margin; break;
    case "bottom-right": x = w - badgeW - margin; y = h - badgeH - margin; break;
    default: x = w - badgeW - margin; y = margin;
  }

  return { fontSize, badgeW, badgeH, x, y, margin };
}

function drawBadgeShape(ctx, x, y, badgeW, badgeH, shape, bgColor) {
  ctx.fillStyle = bgColor;
  if (shape === "pill") {
    const r = badgeH / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + badgeW - r, y);
    ctx.arc(x + badgeW - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + r, y + badgeH);
    ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fill();
  } else if (shape === "circle") {
    const radius = Math.max(badgeW, badgeH) / 2 + 4;
    ctx.beginPath();
    ctx.arc(x + badgeW / 2, y + badgeH / 2, radius, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "star") {
    const cx = x + badgeW / 2;
    const cy = y + badgeH / 2;
    const outerR = Math.max(badgeW, badgeH) / 2 + 6;
    const innerR = outerR * 0.5;
    const points = 5;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  } else if (shape === "ribbon") {
    const tail = badgeH * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + badgeW + tail, y);
    ctx.lineTo(x + badgeW, y + badgeH / 2);
    ctx.lineTo(x + badgeW + tail, y + badgeH);
    ctx.lineTo(x, y + badgeH);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(x, y, badgeW, badgeH);
  }
}

function drawBadge(ctx, w, h, badge, animT) {
  if (!badge || !badge.text) return;

  const { text, shape = "rectangle", bgColor = "#e53e3e", textColor = "#ffffff", badgeEffect = "none" } = badge;
  const m = getBadgeMetrics(ctx, w, h, badge);

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.filter = "none";

  const centerX = m.x + m.badgeW / 2;
  const centerY = m.y + m.badgeH / 2;

  if (badgeEffect === "bounce") {
    const offsetY = -Math.abs(Math.sin(animT * Math.PI)) * m.badgeH * 0.6;
    ctx.translate(0, offsetY);
    drawBadgeShape(ctx, m.x, m.y, m.badgeW, m.badgeH, shape, bgColor);
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `bold ${m.fontSize}px sans-serif`;
    ctx.fillText(text, centerX, centerY + 1);
  } else if (badgeEffect === "pulse") {
    const scale = 1 + 0.15 * Math.sin(animT * Math.PI * 2);
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    drawBadgeShape(ctx, m.x, m.y, m.badgeW, m.badgeH, shape, bgColor);
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `bold ${m.fontSize}px sans-serif`;
    ctx.fillText(text, centerX, centerY + 1);
  } else if (badgeEffect === "glow") {
    const glowAlpha = 0.3 + 0.4 * Math.sin(animT * Math.PI * 2);
    // Glow layer
    ctx.globalAlpha = glowAlpha;
    const glowPad = 6;
    drawBadgeShape(ctx, m.x - glowPad, m.y - glowPad, m.badgeW + glowPad * 2, m.badgeH + glowPad * 2, shape, bgColor);
    // Main badge
    ctx.globalAlpha = 1;
    drawBadgeShape(ctx, m.x, m.y, m.badgeW, m.badgeH, shape, bgColor);
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `bold ${m.fontSize}px sans-serif`;
    ctx.fillText(text, centerX, centerY + 1);
  } else if (badgeEffect === "spin") {
    const angle = animT * Math.PI * 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.translate(-centerX, -centerY);
    drawBadgeShape(ctx, m.x, m.y, m.badgeW, m.badgeH, shape, bgColor);
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `bold ${m.fontSize}px sans-serif`;
    ctx.fillText(text, centerX, centerY + 1);
  } else if (badgeEffect === "slideIn") {
    const position = badge.position || "top-right";
    let startX = m.x, startY = m.y;
    if (position.includes("right")) startX = w + m.badgeW;
    else startX = -m.badgeW * 2;
    const curX = startX + (m.x - startX) * Math.min(1, animT * 2);
    drawBadgeShape(ctx, curX, m.y, m.badgeW, m.badgeH, shape, bgColor);
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `bold ${m.fontSize}px sans-serif`;
    ctx.fillText(text, curX + m.badgeW / 2, m.y + m.badgeH / 2 + 1);
  } else {
    // none
    drawBadgeShape(ctx, m.x, m.y, m.badgeW, m.badgeH, shape, bgColor);
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `bold ${m.fontSize}px sans-serif`;
    ctx.fillText(text, centerX, centerY + 1);
  }

  ctx.restore();
}

// --- Effect registry ---
const EFFECT_GENERATORS = {
  none: framesNone,
  zoomIn: (imgs, w, h, ctx, d) => framesZoom(imgs, w, h, ctx, d, "in"),
  zoomOut: (imgs, w, h, ctx, d) => framesZoom(imgs, w, h, ctx, d, "out"),
  fade: framesFade,
  blur: framesBlur,
  spotlight: framesSpotlight,
  bounce: framesBounce,
  slide: framesSlide,
};

/**
 * Create a GIF from image sources with optional effects.
 * @param {string[]} imageSources
 * @param {object} options
 * @param {number} options.width - Output width (default 480)
 * @param {number} options.delay - Frame delay in ms (default 500)
 * @param {string} options.effect - Effect name (default "none")
 * @returns {Promise<Blob>}
 */
export async function createGif(imageSources, options = {}) {
  const { width = 480, delay = 500, effect = "none", badge = null, loopMode = "forward" } = options;

  const images = await Promise.all(imageSources.map(loadImage));

  const firstImg = images[0];
  const aspectRatio = firstImg.naturalHeight / firstImg.naturalWidth;
  const height = Math.round(width * aspectRatio);

  const gif = GIFEncoder();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const generator = EFFECT_GENERATORS[effect] || EFFECT_GENERATORS.none;
  const frames = generator(images, width, height, ctx, delay);

  // Draw badge on each frame if provided
  if (badge && badge.text) {
    const totalFrames = frames.length;
    for (let i = 0; i < totalFrames; i++) {
      const t = totalFrames > 1 ? (i % totalFrames) / totalFrames : 0;
      ctx.putImageData(frames[i].data, 0, 0);
      drawBadge(ctx, width, height, badge, t);
      frames[i].data = ctx.getImageData(0, 0, width, height);
    }
  }

  // Apply loop mode
  if (loopMode === "reverse") {
    frames.reverse();
  } else if (loopMode === "pingPong") {
    // Forward then reverse (skip duplicate at ends)
    const reversed = frames.slice(1, -1).reverse();
    frames.push(...reversed);
  } else if (loopMode === "boomerang") {
    // Forward then reverse with ease (hold first & last frame longer)
    const first = frames[0];
    const last = frames[frames.length - 1];
    const reversed = frames.slice(1, -1).reverse();
    frames.push({ ...last, delay: last.delay * 2 });
    frames.push(...reversed);
    frames.push({ ...first, delay: first.delay * 2 });
  }

  for (const frame of frames) {
    const palette = quantize(frame.data.data, 256);
    const index = applyPalette(frame.data.data, palette);
    // GIF delay is in centiseconds; browsers treat <2cs as ~100ms, so min 2cs (20ms)
    const delayCentis = Math.max(2, Math.round(frame.delay / 10));
    gif.writeFrame(index, width, height, {
      palette,
      delay: delayCentis,
    });
  }

  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}

export const LOOP_MODES = [
  { id: "forward", name: "Forward", icon: "→" },
  { id: "reverse", name: "Reverse", icon: "←" },
  { id: "pingPong", name: "Ping Pong", icon: "↔" },
  { id: "boomerang", name: "Boomerang", icon: "⟳" },
];

export const BADGE_EFFECTS = [
  { id: "none", name: "None", icon: "—" },
  { id: "bounce", name: "Bounce", icon: "⬆" },
  { id: "pulse", name: "Pulse", icon: "💗" },
  { id: "glow", name: "Glow", icon: "✨" },
  { id: "spin", name: "Spin", icon: "🔄" },
  { id: "slideIn", name: "Slide In", icon: "➡" },
];

export const BADGE_SHAPES = [
  { id: "rectangle", name: "Rectangle" },
  { id: "pill", name: "Pill" },
  { id: "circle", name: "Circle" },
  { id: "star", name: "Star" },
  { id: "ribbon", name: "Ribbon" },
];

export const BADGE_POSITIONS = [
  { id: "top-left", name: "Top Left" },
  { id: "top-right", name: "Top Right" },
  { id: "bottom-left", name: "Bottom Left" },
  { id: "bottom-right", name: "Bottom Right" },
];

export const EFFECTS = [
  { id: "none", name: "None", icon: "—" },
  { id: "zoomIn", name: "Zoom In", icon: "🔍" },
  { id: "zoomOut", name: "Zoom Out", icon: "🔎" },
  { id: "fade", name: "Fade", icon: "✦" },
  { id: "blur", name: "Blur", icon: "◐" },
  { id: "spotlight", name: "Spotlight", icon: "◉" },
  { id: "bounce", name: "Bounce", icon: "◈" },
  { id: "slide", name: "Slide", icon: "▸" },
];
