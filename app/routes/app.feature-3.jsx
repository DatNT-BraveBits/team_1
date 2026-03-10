import { useEffect, useState, useCallback, useRef } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

// ─── Constants ──────────────────────────────────────────────────────────────────

const SETTINGS_NAMESPACE = "app_ai";
const SETTINGS_KEY = "feature_3_settings";

const TABS = [
  { id: "themes", label: "Sound Themes" },
  { id: "events", label: "Event Mapping" },
  { id: "settings", label: "Settings" },
  { id: "overview", label: "Overview" },
];

const SOUND_THEMES = [
  {
    key: "minimal",
    name: "Minimal",
    desc: "Clean, subtle — soft clicks and gentle chimes",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
  },
  {
    key: "luxury",
    name: "Luxury",
    desc: "Premium, elegant — crystal tings and piano notes",
    color: "#92400E",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  {
    key: "playful",
    name: "Playful",
    desc: "Fun, energetic — pop bubbles and cheerful dings",
    color: "#DB2777",
    bg: "#FDF2F8",
    border: "#FBCFE8",
  },
  {
    key: "nature",
    name: "Nature",
    desc: "Organic, earthy — water drops and wooden knocks",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  {
    key: "tech",
    name: "Tech",
    desc: "Modern, digital — synth pulses and electronic blips",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    key: "retro",
    name: "Retro",
    desc: "Vintage, warm — typewriter clicks and bell rings",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
];

const SOUND_EVENTS = [
  { key: "addToCart", label: "Add to cart", icon: "🛒", desc: "When customer clicks add to cart button", category: "cart" },
  { key: "removeFromCart", label: "Remove from cart", icon: "❌", desc: "When item is removed from cart", category: "cart" },
  { key: "cartOpen", label: "Open cart", icon: "🧺", desc: "When cart drawer/page opens", category: "cart" },
  { key: "checkout", label: "Checkout success", icon: "✅", desc: "When order is confirmed — celebration moment", category: "checkout" },
  { key: "hover", label: "Product hover", icon: "👆", desc: "Subtle feedback on product card hover", category: "browse" },
  { key: "pageTransition", label: "Page transition", icon: "📄", desc: "When navigating between pages", category: "browse" },
  { key: "wishlistAdd", label: "Add to wishlist", icon: "❤️", desc: "When product is added to wishlist", category: "action" },
  { key: "notification", label: "Notification", icon: "🔔", desc: "When a toast or popup appears", category: "action" },
  { key: "quantityChange", label: "Quantity change", icon: "🔢", desc: "When +/- quantity is clicked", category: "cart" },
  { key: "scrollMilestone", label: "Scroll milestone", icon: "📜", desc: "When user scrolls 50% or 100% of page", category: "browse" },
];

const EVENT_CATEGORIES = [
  { key: "cart", label: "Cart Events", color: "#059669", bg: "#ECFDF5" },
  { key: "checkout", label: "Checkout", color: "#7C3AED", bg: "#F5F3FF" },
  { key: "browse", label: "Browsing", color: "#2563EB", bg: "#EFF6FF" },
  { key: "action", label: "Actions", color: "#DB2777", bg: "#FDF2F8" },
];

const TOGGLE_POSITIONS = [
  { value: "bottom-right", label: "Bottom Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "top-right", label: "Top Right" },
  { value: "top-left", label: "Top Left" },
];

const TOGGLE_STYLES = [
  { value: "minimal", label: "Minimal" },
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
];

// ─── Sound Synthesis Engine (Web Audio API) ─────────────────────────────────────

const SOUND_LIBRARY = {
  minimal: {
    addToCart:       { freq: 880, type: "sine", duration: 0.12, gain: 0.3 },
    removeFromCart:  { freq: 440, type: "sine", duration: 0.1, gain: 0.2, bend: -100 },
    cartOpen:        { freq: 660, type: "sine", duration: 0.15, gain: 0.2 },
    checkout:        { freq: [523, 659, 784], type: "sine", duration: 0.6, gain: 0.3, stagger: 0.12 },
    hover:           { freq: 1200, type: "sine", duration: 0.05, gain: 0.08 },
    pageTransition:  { freq: 600, type: "sine", duration: 0.15, gain: 0.15, bend: 200 },
    wishlistAdd:     { freq: [700, 900], type: "sine", duration: 0.25, gain: 0.25, stagger: 0.1 },
    notification:    { freq: [800, 1000], type: "sine", duration: 0.3, gain: 0.2, stagger: 0.08 },
    quantityChange:  { freq: 1000, type: "sine", duration: 0.06, gain: 0.15 },
    scrollMilestone: { freq: [500, 650, 800], type: "sine", duration: 0.4, gain: 0.15, stagger: 0.1 },
  },
  luxury: {
    addToCart:       { freq: 523, type: "sine", duration: 0.25, gain: 0.3, reverb: true },
    removeFromCart:  { freq: 350, type: "sine", duration: 0.2, gain: 0.2, reverb: true },
    cartOpen:        { freq: 440, type: "sine", duration: 0.3, gain: 0.2, reverb: true },
    checkout:        { freq: [523, 659, 784, 1047], type: "sine", duration: 0.8, gain: 0.3, stagger: 0.15, reverb: true },
    hover:           { freq: 1047, type: "sine", duration: 0.08, gain: 0.06, reverb: true },
    pageTransition:  { freq: 440, type: "sine", duration: 0.3, gain: 0.15, bend: 110, reverb: true },
    wishlistAdd:     { freq: [659, 880], type: "sine", duration: 0.35, gain: 0.25, stagger: 0.12, reverb: true },
    notification:    { freq: [784, 1047], type: "sine", duration: 0.35, gain: 0.2, stagger: 0.1, reverb: true },
    quantityChange:  { freq: 880, type: "sine", duration: 0.1, gain: 0.12, reverb: true },
    scrollMilestone: { freq: [440, 554, 659], type: "sine", duration: 0.5, gain: 0.15, stagger: 0.15, reverb: true },
  },
  playful: {
    addToCart:       { freq: 880, type: "square", duration: 0.1, gain: 0.15, bend: 200 },
    removeFromCart:  { freq: 600, type: "square", duration: 0.1, gain: 0.1, bend: -300 },
    cartOpen:        { freq: 700, type: "square", duration: 0.12, gain: 0.12, bend: 150 },
    checkout:        { freq: [523, 659, 784, 1047, 1319], type: "square", duration: 0.6, gain: 0.15, stagger: 0.08 },
    hover:           { freq: 1400, type: "square", duration: 0.04, gain: 0.06 },
    pageTransition:  { freq: 800, type: "square", duration: 0.1, gain: 0.1, bend: 400 },
    wishlistAdd:     { freq: [800, 1200], type: "square", duration: 0.2, gain: 0.12, stagger: 0.06 },
    notification:    { freq: [1000, 1400], type: "square", duration: 0.2, gain: 0.12, stagger: 0.06 },
    quantityChange:  { freq: 1100, type: "square", duration: 0.05, gain: 0.1, bend: 300 },
    scrollMilestone: { freq: [600, 800, 1000, 1200], type: "square", duration: 0.4, gain: 0.1, stagger: 0.06 },
  },
  nature: {
    addToCart:       { freq: 600, type: "triangle", duration: 0.2, gain: 0.3 },
    removeFromCart:  { freq: 400, type: "triangle", duration: 0.15, gain: 0.2 },
    cartOpen:        { freq: 500, type: "triangle", duration: 0.2, gain: 0.2 },
    checkout:        { freq: [400, 500, 600, 800], type: "triangle", duration: 0.7, gain: 0.3, stagger: 0.15 },
    hover:           { freq: 900, type: "triangle", duration: 0.06, gain: 0.08 },
    pageTransition:  { freq: 500, type: "triangle", duration: 0.2, gain: 0.15, bend: 100 },
    wishlistAdd:     { freq: [550, 700], type: "triangle", duration: 0.3, gain: 0.25, stagger: 0.12 },
    notification:    { freq: [600, 800], type: "triangle", duration: 0.3, gain: 0.2, stagger: 0.1 },
    quantityChange:  { freq: 800, type: "triangle", duration: 0.08, gain: 0.15 },
    scrollMilestone: { freq: [400, 500, 600], type: "triangle", duration: 0.5, gain: 0.15, stagger: 0.15 },
  },
  tech: {
    addToCart:       { freq: 1200, type: "sawtooth", duration: 0.08, gain: 0.1, bend: -400 },
    removeFromCart:  { freq: 800, type: "sawtooth", duration: 0.08, gain: 0.08, bend: -600 },
    cartOpen:        { freq: 1000, type: "sawtooth", duration: 0.1, gain: 0.08, bend: -200 },
    checkout:        { freq: [400, 600, 800, 1200], type: "sawtooth", duration: 0.5, gain: 0.1, stagger: 0.08 },
    hover:           { freq: 2000, type: "sawtooth", duration: 0.03, gain: 0.04 },
    pageTransition:  { freq: 1000, type: "sawtooth", duration: 0.1, gain: 0.08, bend: 500 },
    wishlistAdd:     { freq: [1000, 1400], type: "sawtooth", duration: 0.15, gain: 0.08, stagger: 0.05 },
    notification:    { freq: [1200, 1600], type: "sawtooth", duration: 0.15, gain: 0.08, stagger: 0.05 },
    quantityChange:  { freq: 1500, type: "sawtooth", duration: 0.04, gain: 0.06 },
    scrollMilestone: { freq: [600, 900, 1200], type: "sawtooth", duration: 0.3, gain: 0.08, stagger: 0.06 },
  },
  retro: {
    addToCart:       { freq: 660, type: "square", duration: 0.15, gain: 0.12 },
    removeFromCart:  { freq: 330, type: "square", duration: 0.12, gain: 0.1 },
    cartOpen:        { freq: 550, type: "square", duration: 0.15, gain: 0.1 },
    checkout:        { freq: [262, 330, 392, 523], type: "square", duration: 0.7, gain: 0.12, stagger: 0.12 },
    hover:           { freq: 880, type: "square", duration: 0.04, gain: 0.06 },
    pageTransition:  { freq: 440, type: "square", duration: 0.12, gain: 0.1, bend: 220 },
    wishlistAdd:     { freq: [440, 660], type: "square", duration: 0.25, gain: 0.1, stagger: 0.1 },
    notification:    { freq: [660, 880], type: "square", duration: 0.25, gain: 0.1, stagger: 0.08 },
    quantityChange:  { freq: 770, type: "square", duration: 0.06, gain: 0.08 },
    scrollMilestone: { freq: [330, 440, 550], type: "square", duration: 0.4, gain: 0.1, stagger: 0.12 },
  },
};

const DEFAULT_SETTINGS = {
  sonic: {
    enabled: true,
    theme: "minimal",
    volume: 70,
    events: {
      addToCart: true,
      removeFromCart: true,
      cartOpen: true,
      checkout: true,
      hover: false,
      pageTransition: false,
      wishlistAdd: true,
      notification: true,
      quantityChange: false,
      scrollMilestone: false,
    },
    toggle: {
      show: true,
      position: "bottom-right",
      style: "rounded",
    },
    defaultState: "off",
  },
};

// ─── Style System ───────────────────────────────────────────────────────────────

const S = {
  page: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "0 16px 40px",
  },
  tabBar: {
    display: "flex",
    gap: 6,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  tab: {
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: "#6B7280",
    cursor: "pointer",
    border: "1px solid #2563EB",
    background: "#FFFFFF",
    borderRadius: 8,
    boxShadow: "0 0 0 2px rgba(37,99,235,0.15)",
    transition: "all 0.15s",
  },
  tabActive: {
    color: "#FFFFFF",
    background: "#2563EB",
    border: "1px solid #2563EB",
    boxShadow: "0 0 0 2px rgba(37,99,235,0.15)",
  },
  saveBar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: "12px 20px",
    marginBottom: 20,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  saveTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" },
  saveHint: { margin: "2px 0 0", fontSize: 12, color: "#6B7280" },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid #F3F4F6",
    background: "#F9FAFB",
  },
  cardBody: { padding: 20 },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" },
  cardDesc: { margin: "4px 0 0", fontSize: 13, color: "#6B7280", lineHeight: 1.5 },
  fieldGrid: { display: "grid", gap: 16 },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },
  label: { display: "grid", gap: 6, fontSize: 14, fontWeight: 600, color: "#374151" },
  input: {
    width: "100%",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    background: "#FFFFFF",
    color: "#111827",
    minHeight: 38,
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    background: "#FFFFFF",
    color: "#111827",
    minHeight: 38,
    boxSizing: "border-box",
  },
  toggle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#F9FAFB",
    borderRadius: 8,
    border: "1px solid #E5E7EB",
  },
  toggleLabel: { fontSize: 14, fontWeight: 600, color: "#111827" },
  toggleDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  btnPrimary: {
    padding: "10px 24px",
    fontSize: 13,
    fontWeight: 600,
    color: "#FFFFFF",
    background: "#2563EB",
    border: "1px solid #2563EB",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  btnPrimaryDisabled: {
    background: "#93C5FD",
    borderColor: "#93C5FD",
    cursor: "not-allowed",
  },
  banner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 20px",
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 14,
  },
  bannerSuccess: {
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    color: "#166534",
  },
  bannerError: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#991B1B",
  },
  bannerDismiss: {
    background: "none",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "inherit",
    opacity: 0.6,
    padding: 0,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: "20px 16px",
    textAlign: "center",
  },
  statValue: { fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 },
  statLabel: { fontSize: 13, color: "#6B7280", margin: "6px 0 0" },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #F3F4F6",
    fontSize: 14,
  },
  summaryLabel: { color: "#6B7280", fontWeight: 500 },
  summaryValue: { color: "#111827", fontWeight: 600 },
  dot: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    marginRight: 6,
  },
};

// ─── Sound Player Hook ──────────────────────────────────────────────────────────

function useSoundPlayer() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback((soundDef, volumePercent = 70) => {
    if (!soundDef) return;
    try {
      const ctx = getCtx();
      const masterGain = (volumePercent / 100) * (soundDef.gain || 0.3);
      const freqs = Array.isArray(soundDef.freq) ? soundDef.freq : [soundDef.freq];
      const stagger = soundDef.stagger || 0;

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + i * stagger;
        const endTime = startTime + (soundDef.duration || 0.15);

        osc.type = soundDef.type || "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        if (soundDef.bend) {
          osc.frequency.linearRampToValueAtTime(freq + soundDef.bend, endTime);
        }

        gain.gain.setValueAtTime(masterGain, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(endTime + 0.05);
      });
    } catch {
      // silently fail if audio context is not available
    }
  }, [getCtx]);

  return { play };
}

// ─── Helper Functions ───────────────────────────────────────────────────────────

function mergeSettings(rawValue) {
  try {
    const parsed = JSON.parse(rawValue ?? "{}");
    const sonicRaw = parsed?.sonic ?? {};
    const eventsRaw = sonicRaw?.events ?? {};
    const toggleRaw = sonicRaw?.toggle ?? {};

    return {
      sonic: {
        enabled: sonicRaw.enabled ?? DEFAULT_SETTINGS.sonic.enabled,
        theme: sonicRaw.theme ?? DEFAULT_SETTINGS.sonic.theme,
        volume: Number(sonicRaw.volume ?? DEFAULT_SETTINGS.sonic.volume),
        events: {
          ...DEFAULT_SETTINGS.sonic.events,
          ...eventsRaw,
        },
        toggle: {
          show: toggleRaw.show ?? DEFAULT_SETTINGS.sonic.toggle.show,
          position: toggleRaw.position ?? DEFAULT_SETTINGS.sonic.toggle.position,
          style: toggleRaw.style ?? DEFAULT_SETTINGS.sonic.toggle.style,
        },
        defaultState: sonicRaw.defaultState ?? DEFAULT_SETTINGS.sonic.defaultState,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ─── Server: Read / Write ───────────────────────────────────────────────────────

async function readSettings(admin) {
  const response = await admin.graphql(
    `#graphql
      query Feature3Settings {
        currentAppInstallation {
          id
          metafield(namespace: "${SETTINGS_NAMESPACE}", key: "${SETTINGS_KEY}") { value }
        }
        shop {
          metafield(namespace: "${SETTINGS_NAMESPACE}", key: "${SETTINGS_KEY}") { value }
        }
      }
    `,
  );
  const json = await response.json();
  const appInstallation = json?.data?.currentAppInstallation;
  const shop = json?.data?.shop;
  const rawValue = appInstallation?.metafield?.value || shop?.metafield?.value;
  return {
    appInstallationId: appInstallation?.id,
    settings: rawValue ? mergeSettings(rawValue) : DEFAULT_SETTINGS,
  };
}

async function writeSettings(admin, appInstallationId, settings) {
  const response = await admin.graphql(
    `#graphql
      mutation SaveFeature3Settings($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors { field message }
        }
      }
    `,
    {
      variables: {
        metafields: [{
          namespace: SETTINGS_NAMESPACE,
          key: SETTINGS_KEY,
          ownerId: appInstallationId,
          type: "json",
          value: JSON.stringify(settings),
        }],
      },
    },
  );
  const json = await response.json();
  const errors = json?.data?.metafieldsSet?.userErrors ?? [];
  if (errors.length > 0) throw new Error(errors.map((e) => e.message).join(", "));
}

// ─── Loader ─────────────────────────────────────────────────────────────────────

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const { settings } = await readSettings(admin);
  return Response.json({ settings });
};

// ─── Client-side cache ──────────────────────────────────────────────────────────

let _cachedData = null;

export async function clientLoader({ serverLoader }) {
  if (_cachedData) return _cachedData;
  const data = await serverLoader();
  _cachedData = data;
  return data;
}
clientLoader.hydrate = true;

export function shouldRevalidate({ formAction }) {
  if (formAction) {
    _cachedData = null;
    return true;
  }
  return false;
}

// ─── Action ─────────────────────────────────────────────────────────────────────

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const { appInstallationId, settings } = await readSettings(admin);

  if (!appInstallationId) {
    return Response.json({ ok: false, error: "Could not resolve app installation id." }, { status: 500 });
  }

  try {
    if (intent === "save_sonic") {
      const enabledEvents = {};
      for (const evt of SOUND_EVENTS) {
        enabledEvents[evt.key] = formData.get(`event_${evt.key}`) === "on";
      }

      const nextSettings = {
        ...settings,
        sonic: {
          enabled: formData.get("sonic_enabled") === "on",
          theme: String(formData.get("sonic_theme") || settings.sonic.theme || "minimal"),
          volume: Math.min(100, Math.max(0, Number(formData.get("sonic_volume") ?? 70))),
          events: enabledEvents,
          toggle: {
            show: formData.get("toggle_show") === "on",
            position: String(formData.get("toggle_position") || "bottom-right"),
            style: String(formData.get("toggle_style") || "rounded"),
          },
          defaultState: String(formData.get("default_state") || "off"),
        },
      };

      await writeSettings(admin, appInstallationId, nextSettings);
      return Response.json({ ok: true, message: "Sonic branding settings saved.", settings: nextSettings });
    }

    return Response.json({ ok: false, error: "Unknown intent." }, { status: 400 });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Unexpected error." }, { status: 500 });
  }
};

// ─── UI Components ──────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return <label style={S.label}>{label}{children}</label>;
}

function WaveformVisualizer({ theme, isPlaying }) {
  const bars = 12;
  return (
    <div style={{ display: "flex", alignItems: "end", gap: 2, height: 32, padding: "4px 0" }}>
      {Array.from({ length: bars }).map((_, i) => {
        const themeObj = SOUND_THEMES.find((t) => t.key === theme);
        const color = themeObj?.color || "#6B7280";
        const h = isPlaying
          ? 8 + Math.sin((i * 1.2) + Date.now() / 200) * 12 + 12
          : 4 + Math.sin(i * 0.8) * 3;
        return (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: color,
              opacity: isPlaying ? 0.9 : 0.3,
              transition: "height 0.15s, opacity 0.3s",
            }}
          />
        );
      })}
    </div>
  );
}

function SoundThemeCard({ theme, isSelected, onSelect, onPreview }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: 16,
        borderRadius: 12,
        border: `2px solid ${isSelected ? theme.color : theme.border}`,
        background: isSelected ? theme.bg : "#FFFFFF",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: isSelected ? `0 0 0 3px ${theme.color}22` : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: isSelected ? theme.color : "#374151" }}>
          {theme.name}
        </span>
        {isSelected && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#FFFFFF",
            background: theme.color,
            padding: "2px 8px",
            borderRadius: 999,
          }}>
            Active
          </span>
        )}
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6B7280", lineHeight: 1.4 }}>
        {theme.desc}
      </p>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onPreview(); }}
        style={{
          padding: "6px 14px",
          fontSize: 12,
          fontWeight: 600,
          color: theme.color,
          background: "transparent",
          border: `1px solid ${theme.color}`,
          borderRadius: 6,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        Preview all sounds
      </button>
    </div>
  );
}

function EventRow({ event, enabled, volume, themeKey, onToggle, onPreview }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      background: enabled ? "#F9FAFB" : "#FFFFFF",
      borderRadius: 8,
      border: "1px solid #E5E7EB",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <span style={{ fontSize: 20 }}>{event.icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{event.label}</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>{event.desc}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          onClick={onPreview}
          style={{
            padding: "5px 10px",
            fontSize: 12,
            fontWeight: 600,
            color: "#2563EB",
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Test
        </button>
        <input
          type="checkbox"
          name={`event_${event.key}`}
          checked={enabled}
          onChange={onToggle}
          style={{ width: 18, height: 18, cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

// ─── Tab: Sound Themes ──────────────────────────────────────────────────────────

function ThemesTab({ selectedTheme, onThemeSelect, volume, onPreviewAll }) {
  return (
    <div style={S.fieldGrid}>
      <div style={{ padding: "16px 20px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1E40AF" }}>
          Choose your sonic identity
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#3B82F6", lineHeight: 1.5 }}>
          Each theme includes 10 harmonized sounds designed to create a cohesive audio experience.
          Click "Preview all sounds" to hear the complete sound set.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {SOUND_THEMES.map((theme) => (
          <SoundThemeCard
            key={theme.key}
            theme={theme}
            isSelected={selectedTheme === theme.key}
            onSelect={() => onThemeSelect(theme.key)}
            onPreview={() => onPreviewAll(theme.key)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Event Mapping ─────────────────────────────────────────────────────────

function EventsTab({ settings, eventStates, onToggleEvent, volume, themeKey, onPreviewEvent }) {
  return (
    <div style={S.fieldGrid}>
      <div style={{ padding: "16px 20px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#9A3412" }}>
          Map sounds to store events
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#EA580C", lineHeight: 1.5 }}>
          Enable or disable sounds for specific interactions. Click "Test" to preview each sound.
          Keep it strategic — use sounds at high-value moments only for the best experience.
        </p>
      </div>

      {EVENT_CATEGORIES.map((cat) => {
        const events = SOUND_EVENTS.filter((e) => e.category === cat.key);
        return (
          <div key={cat.key} style={S.card}>
            <div style={{ ...S.cardHeader, background: cat.bg, borderBottom: `1px solid ${cat.color}33` }}>
              <p style={{ ...S.cardTitle, color: cat.color }}>{cat.label}</p>
            </div>
            <div style={{ ...S.cardBody, display: "grid", gap: 8 }}>
              {events.map((evt) => (
                <EventRow
                  key={evt.key}
                  event={evt}
                  enabled={eventStates[evt.key] ?? false}
                  volume={volume}
                  themeKey={themeKey}
                  onToggle={() => onToggleEvent(evt.key)}
                  onPreview={() => onPreviewEvent(evt.key)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Settings ──────────────────────────────────────────────────────────────

function SettingsTab({ settings, volume, setVolume }) {
  return (
    <div style={S.fieldGrid}>
      {/* Master toggle */}
      <div style={S.toggle}>
        <div>
          <div style={S.toggleLabel}>Enable Sonic Branding</div>
          <div style={S.toggleDesc}>Master switch for all store sounds</div>
        </div>
        <input name="sonic_enabled" type="checkbox" defaultChecked={settings.sonic.enabled} style={{ width: 18, height: 18 }} />
      </div>

      {/* Volume */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>Volume Control</p>
          <p style={S.cardDesc}>Set the default volume level for all sounds</p>
        </div>
        <div style={S.cardBody}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 20 }}>🔈</span>
            <input
              type="range"
              name="sonic_volume"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ flex: 1, height: 6, cursor: "pointer" }}
            />
            <span style={{ fontSize: 20 }}>🔊</span>
            <span style={{
              minWidth: 44,
              textAlign: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              background: "#F3F4F6",
              padding: "4px 8px",
              borderRadius: 6,
            }}>
              {volume}%
            </span>
          </div>
        </div>
      </div>

      {/* Floating toggle settings */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>Storefront Sound Toggle</p>
          <p style={S.cardDesc}>A small floating button that lets visitors control sounds</p>
        </div>
        <div style={{ ...S.cardBody, ...S.fieldGrid }}>
          <div style={S.toggle}>
            <div>
              <div style={S.toggleLabel}>Show sound toggle</div>
              <div style={S.toggleDesc}>Display the floating mute/unmute button on your storefront</div>
            </div>
            <input name="toggle_show" type="checkbox" defaultChecked={settings.sonic.toggle.show} style={{ width: 18, height: 18 }} />
          </div>

          <div style={S.fieldRow}>
            <Field label="Toggle position">
              <select name="toggle_position" style={S.select} defaultValue={settings.sonic.toggle.position}>
                {TOGGLE_POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Toggle style">
              <select name="toggle_style" style={S.select} defaultValue={settings.sonic.toggle.style}>
                {TOGGLE_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Toggle preview */}
          <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
            <TogglePreview
              position={settings.sonic.toggle.position}
              toggleStyle={settings.sonic.toggle.style}
            />
          </div>
        </div>
      </div>

      {/* Default state */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>Default Sound State</p>
          <p style={S.cardDesc}>For new visitors who haven't set a preference yet</p>
        </div>
        <div style={{ ...S.cardBody, display: "flex", gap: 16 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, cursor: "pointer" }}>
            <input type="radio" name="default_state" value="off" defaultChecked={settings.sonic.defaultState !== "on"} />
            <span>
              <span style={{ fontWeight: 600, color: "#111827" }}>Sound OFF</span>
              <span style={{ display: "block", fontSize: 12, color: "#6B7280" }}>Visitors opt-in (recommended)</span>
            </span>
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, cursor: "pointer" }}>
            <input type="radio" name="default_state" value="on" defaultChecked={settings.sonic.defaultState === "on"} />
            <span>
              <span style={{ fontWeight: 600, color: "#111827" }}>Sound ON</span>
              <span style={{ display: "block", fontSize: 12, color: "#6B7280" }}>Visitors opt-out</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

function TogglePreview({ position, toggleStyle }) {
  const posMap = {
    "bottom-right": { bottom: 12, right: 12 },
    "bottom-left": { bottom: 12, left: 12 },
    "top-right": { top: 12, right: 12 },
    "top-left": { top: 12, left: 12 },
  };
  const styleMap = {
    minimal: { borderRadius: 4, width: 36, height: 36 },
    rounded: { borderRadius: 10, width: 40, height: 40 },
    pill: { borderRadius: 999, width: 48, height: 36, fontSize: 11 },
  };
  const pos = posMap[position] || posMap["bottom-right"];
  const stl = styleMap[toggleStyle] || styleMap["rounded"];

  return (
    <div style={{
      position: "relative",
      width: 240,
      height: 160,
      background: "linear-gradient(135deg, #F1F5F9, #E2E8F0)",
      borderRadius: 12,
      border: "1px solid #CBD5E1",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, height: 8, background: "#CBD5E1", borderRadius: 4 }} />
      <div style={{ position: "absolute", top: 24, left: 8, width: "60%", height: 6, background: "#CBD5E1", borderRadius: 3 }} />
      <div style={{ position: "absolute", top: 36, left: 8, width: "40%", height: 6, background: "#E2E8F0", borderRadius: 3 }} />
      <div style={{
        position: "absolute",
        ...pos,
        ...stl,
        background: "#111827",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        fontSize: stl.fontSize || 16,
        fontWeight: 700,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        cursor: "default",
      }}>
        🔊
      </div>
    </div>
  );
}

// ─── Tab: Overview ──────────────────────────────────────────────────────────────

function OverviewTab({ settings }) {
  const sonic = settings.sonic;
  const enabledCount = Object.values(sonic.events).filter(Boolean).length;
  const totalCount = SOUND_EVENTS.length;
  const themeObj = SOUND_THEMES.find((t) => t.key === sonic.theme);

  return (
    <div style={S.fieldGrid}>
      {/* Status grid */}
      <div style={S.statGrid}>
        <div style={S.statCard}>
          <p style={{ ...S.statValue, color: sonic.enabled ? "#059669" : "#DC2626" }}>
            {sonic.enabled ? "ON" : "OFF"}
          </p>
          <p style={S.statLabel}>Sonic System</p>
        </div>
        <div style={S.statCard}>
          <p style={{ ...S.statValue, color: themeObj?.color || "#6B7280" }}>
            {themeObj?.name || "—"}
          </p>
          <p style={S.statLabel}>Active Theme</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statValue}>{enabledCount}/{totalCount}</p>
          <p style={S.statLabel}>Active Events</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statValue}>{sonic.volume}%</p>
          <p style={S.statLabel}>Volume</p>
        </div>
      </div>

      {/* Active events breakdown */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>Active Sound Events</p>
          <p style={S.cardDesc}>Events that will trigger sounds on your storefront</p>
        </div>
        <div style={S.cardBody}>
          {enabledCount === 0 ? (
            <p style={{ margin: 0, color: "#6B7280", fontSize: 14, textAlign: "center", padding: 20 }}>
              No events enabled. Go to "Event Mapping" tab to activate sounds.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 4 }}>
              {SOUND_EVENTS.filter((e) => sonic.events[e.key]).map((evt) => {
                const cat = EVENT_CATEGORIES.find((c) => c.key === evt.category);
                return (
                  <div key={evt.key} style={S.summaryRow}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{evt.icon}</span>
                      <span style={S.summaryLabel}>{evt.label}</span>
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: cat?.color || "#6B7280",
                      background: cat?.bg || "#F3F4F6",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}>
                      {cat?.label || evt.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Storefront toggle config */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>Configuration Summary</p>
        </div>
        <div style={S.cardBody}>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Sound theme</span>
            <span style={{ ...S.summaryValue, color: themeObj?.color || "#111827" }}>{themeObj?.name || "Unknown"}</span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Volume</span>
            <span style={S.summaryValue}>{sonic.volume}%</span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Floating toggle</span>
            <span style={S.summaryValue}>
              <span style={{ ...S.dot, backgroundColor: sonic.toggle.show ? "#22C55E" : "#9CA3AF" }} />
              {sonic.toggle.show ? `Visible (${sonic.toggle.position})` : "Hidden"}
            </span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Toggle style</span>
            <span style={S.summaryValue}>{sonic.toggle.style}</span>
          </div>
          <div style={{ ...S.summaryRow, borderBottom: "none" }}>
            <span style={S.summaryLabel}>Default state for new visitors</span>
            <span style={S.summaryValue}>{sonic.defaultState === "on" ? "Sound ON" : "Sound OFF (opt-in)"}</span>
          </div>
        </div>
      </div>

      {/* Psychology tips */}
      <div style={{ padding: "20px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#92400E" }}>Best Practices</p>
        <ul style={{ margin: "10px 0 0", paddingLeft: 20, fontSize: 13, color: "#B45309", lineHeight: 1.8 }}>
          <li><strong>Less is more</strong> — Enable only 3-5 key events for the best experience</li>
          <li><strong>High-value moments</strong> — Add-to-cart and checkout sounds have the highest impact</li>
          <li><strong>Respect users</strong> — Always default to sound OFF and let visitors opt-in</li>
          <li><strong>Keep it short</strong> — Sounds under 0.3s feel like natural feedback, not interruptions</li>
          <li><strong>Be consistent</strong> — Using one theme creates brand recognition over time</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Feature3Route() {
  const { settings: loaderSettings } = useLoaderData();
  const fetcher = useFetcher();
  const [settings, setSettings] = useState(loaderSettings);
  const [activeTab, setActiveTab] = useState("themes");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Theme & volume state
  const [selectedTheme, setSelectedTheme] = useState(loaderSettings.sonic.theme || "minimal");
  const [volume, setVolume] = useState(loaderSettings.sonic.volume ?? 70);
  const [eventStates, setEventStates] = useState(loaderSettings.sonic.events || DEFAULT_SETTINGS.sonic.events);

  const { play } = useSoundPlayer();

  const handleToggleEvent = useCallback((key) => {
    setEventStates((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handlePreviewEvent = useCallback((eventKey) => {
    const soundDef = SOUND_LIBRARY[selectedTheme]?.[eventKey];
    if (soundDef) play(soundDef, volume);
  }, [selectedTheme, volume, play]);

  const handlePreviewAll = useCallback((themeKey) => {
    const theme = SOUND_LIBRARY[themeKey];
    if (!theme) return;
    const keys = ["addToCart", "wishlistAdd", "checkout"];
    keys.forEach((key, i) => {
      setTimeout(() => {
        play(theme[key], volume);
      }, i * 800);
    });
  }, [volume, play]);

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.ok && fetcher.data.settings) {
      setSettings(fetcher.data.settings);
      setSelectedTheme(fetcher.data.settings.sonic.theme);
      setVolume(fetcher.data.settings.sonic.volume);
      setEventStates(fetcher.data.settings.sonic.events);
      setNotice(fetcher.data.message || "Saved.");
      setError("");
    } else if (!fetcher.data.ok) {
      setError(fetcher.data.error || "Failed to save.");
      setNotice("");
    }
  }, [fetcher.data]);

  const isSaving = fetcher.state !== "idle";

  return (
    <div style={S.page}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Sonic Branding</h1>
      <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 20px" }}>
        Add sound effects to your storefront to create a unique audio identity and boost engagement.
      </p>

      {notice && (
        <div style={{ ...S.banner, ...S.bannerSuccess }}>
          <span>{notice}</span>
          <button style={S.bannerDismiss} onClick={() => setNotice("")}>×</button>
        </div>
      )}
      {error && (
        <div style={{ ...S.banner, ...S.bannerError }}>
          <span>{error}</span>
          <button style={S.bannerDismiss} onClick={() => setError("")}>×</button>
        </div>
      )}

      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="save_sonic" />
        <input type="hidden" name="sonic_theme" value={selectedTheme} />
        <input type="hidden" name="sonic_volume" value={volume} />

        {/* Hidden inputs for event states */}
        {SOUND_EVENTS.map((evt) => (
          eventStates[evt.key] ? (
            <input key={evt.key} type="hidden" name={`event_${evt.key}`} value="on" />
          ) : null
        ))}

        {/* Save bar */}
        <div style={S.saveBar}>
          <div>
            <p style={S.saveTitle}>Sonic Branding Settings</p>
            <p style={S.saveHint}>Configure sound theme, events, and controls</p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            style={{ ...S.btnPrimary, ...(isSaving ? S.btnPrimaryDisabled : {}) }}
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </div>

        {/* Tab navigation */}
        <div style={S.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{ ...S.tab, ...(activeTab === tab.id ? S.tabActive : {}) }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div style={{ display: activeTab === "themes" ? "block" : "none" }}>
          <ThemesTab
            selectedTheme={selectedTheme}
            onThemeSelect={setSelectedTheme}
            volume={volume}
            onPreviewAll={handlePreviewAll}
          />
        </div>

        <div style={{ display: activeTab === "events" ? "block" : "none" }}>
          <EventsTab
            settings={settings}
            eventStates={eventStates}
            onToggleEvent={handleToggleEvent}
            volume={volume}
            themeKey={selectedTheme}
            onPreviewEvent={handlePreviewEvent}
          />
        </div>

        <div style={{ display: activeTab === "settings" ? "block" : "none" }}>
          <SettingsTab settings={settings} volume={volume} setVolume={setVolume} />
        </div>

        <div style={{ display: activeTab === "overview" ? "block" : "none" }}>
          <OverviewTab settings={settings} />
        </div>
      </fetcher.Form>
    </div>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
