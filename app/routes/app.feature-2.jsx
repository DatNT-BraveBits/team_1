import { useEffect, useState, useCallback } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { LAYOUTS } from "../features/feature-2/layouts/index";

// ─── Constants ──────────────────────────────────────────────────────────────────

const THEME_NAME = "Blum";
const TEMPLATE_FILE = "templates/index.json";

// ─── Section wireframe config ────────────────────────────────────────────────

const SECTION_WIREFRAMES = {
  "slideshow": { h: 120, bg: "#DBEAFE", label: "Slideshow", render: "hero" },
  "hero-image-with-text": { h: 120, bg: "#E0E7FF", label: "Hero", render: "hero" },
  "image-banner": { h: 100, bg: "#DBEAFE", label: "Image Banner", render: "hero" },
  "video-banner": { h: 100, bg: "#1E293B", lc: "#FFF", label: "Video Banner", render: "video" },
  "collection-list": { h: 80, bg: "#FEF3C7", label: "Collection List", render: "grid3" },
  "featured-collections": { h: 80, bg: "#FEF9C3", label: "Featured Collections", render: "grid3" },
  "featured-product-carousel": { h: 90, bg: "#ECFDF5", label: "Product Carousel", render: "grid4" },
  "product-hotspots": { h: 90, bg: "#FFF1F2", label: "Product Hotspots", render: "hotspot" },
  "content-collage": { h: 80, bg: "#F3E8FF", label: "Content Collage", render: "collage" },
  "image-with-text": { h: 70, bg: "#F0F9FF", label: "Image With Text", render: "split" },
  "icon-with-text": { h: 60, bg: "#F0FDF4", label: "Icon Features", render: "grid3" },
  "countdown-banner": { h: 60, bg: "#FEF2F2", label: "Countdown", render: "countdown" },
  "testimonials": { h: 60, bg: "#FFFBEB", label: "Testimonials", render: "grid3" },
  "timeline": { h: 70, bg: "#F5F3FF", label: "Timeline", render: "timeline" },
  "text": { h: 50, bg: "#F9FAFB", label: "Text", render: "default" },
  "running-content": { h: 30, bg: "#111827", lc: "#FFF", label: "Marquee", render: "marquee" },
  "newsletter": { h: 60, bg: "#EFF6FF", label: "Newsletter", render: "newsletter" },
  "blog-post-list": { h: 80, bg: "#FFF7ED", label: "Blog Posts", render: "grid3" },
  "logo-list": { h: 50, bg: "#F9FAFB", label: "Logo List", render: "grid4" },
  "address-list": { h: 60, bg: "#F0FDF4", label: "Address List", render: "grid2" },
  "map": { h: 80, bg: "#ECFDF5", label: "Map", render: "default" },
};

function SectionWireframe({ type }) {
  const c = SECTION_WIREFRAMES[type] || { h: 60, bg: "#F3F4F6", label: type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "), render: "default" };
  const tc = c.lc || "#374151";
  const box = (w, h, bg) => ({ width: w, height: h, borderRadius: 4, background: bg || "rgba(0,0,0,0.08)" });

  const inner = () => {
    switch (c.render) {
      case "hero": return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: "100%" }}>
          <div style={box("40%", "60%", "rgba(0,0,0,0.06)")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "30%" }}>
            <div style={box("100%", 8, "rgba(0,0,0,0.1)")} />
            <div style={box("70%", 6, "rgba(0,0,0,0.06)")} />
            <div style={box("50%", 14, "rgba(0,0,0,0.08)")} />
          </div>
        </div>
      );
      case "video": return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginLeft: 3 }}>{"\u25B6"}</span>
          </div>
        </div>
      );
      case "grid2": return (<div style={{ display: "flex", gap: 6, padding: "8px 12px", height: "100%", alignItems: "center" }}>{[1,2].map(i => <div key={i} style={{ ...box("50%", "70%"), flex: 1 }} />)}</div>);
      case "grid3": return (<div style={{ display: "flex", gap: 6, padding: "8px 12px", height: "100%", alignItems: "center" }}>{[1,2,3].map(i => <div key={i} style={{ ...box("33%", "70%"), flex: 1 }} />)}</div>);
      case "grid4": return (<div style={{ display: "flex", gap: 6, padding: "8px 12px", height: "100%", alignItems: "center" }}>{[1,2,3,4].map(i => <div key={i} style={{ ...box("25%", "70%"), flex: 1 }} />)}</div>);
      case "split": return (
        <div style={{ display: "flex", gap: 8, padding: "8px 12px", height: "100%", alignItems: "center" }}>
          <div style={box("50%", "80%")} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={box("80%", 7, "rgba(0,0,0,0.1)")} /><div style={box("100%", 5, "rgba(0,0,0,0.06)")} /><div style={box("60%", 5, "rgba(0,0,0,0.06)")} />
          </div>
        </div>
      );
      case "collage": return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 4, padding: "8px 12px", height: "100%" }}>
          <div style={{ ...box("100%", "100%"), gridRow: "1/3" }} />
          <div style={box("100%", "100%")} /><div style={box("100%", "100%")} />
          <div style={{ ...box("100%", "100%"), gridColumn: "2/4" }} />
        </div>
      );
      case "hotspot": return (
        <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={box("70%", "80%")} />
          {[{top:"20%",left:"25%"},{top:"50%",left:"55%"},{top:"35%",left:"70%"}].map((p,i) => (
            <div key={i} style={{ position: "absolute", ...p, width: 10, height: 10, borderRadius: "50%", background: "rgba(239,68,68,0.6)", border: "2px solid rgba(239,68,68,0.3)" }} />
          ))}
        </div>
      );
      case "countdown": return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: "100%" }}>
          {["00","00","00","00"].map((n,i) => (<div key={i} style={{ width: 28, height: 32, borderRadius: 4, background: "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: tc }}>{n}</div>))}
        </div>
      );
      case "timeline": return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0", height: "100%", justifyContent: "center" }}>
          {[1,2,3].map(i => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 6, width: "80%" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(0,0,0,0.15)", flexShrink: 0 }} /><div style={box("100%", 6, "rgba(0,0,0,0.06)")} /></div>))}
        </div>
      );
      case "marquee": return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", overflow: "hidden" }}>
          <span style={{ fontSize: 10, color: c.lc || "#FFF", opacity: 0.5, whiteSpace: "nowrap" }}>{`\u2014\u2014 ${c.label} \u2014\u2014 ${c.label} \u2014\u2014 ${c.label} \u2014\u2014`}</span>
        </div>
      );
      case "newsletter": return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: "100%" }}>
          <div style={box("40%", 7, "rgba(0,0,0,0.1)")} />
          <div style={{ display: "flex", gap: 4, width: "60%", alignItems: "center" }}>
            <div style={{ ...box("70%", 20, "rgba(0,0,0,0.06)"), flex: 1 }} />
            <div style={box("30%", 20, "rgba(0,0,0,0.12)")} />
          </div>
        </div>
      );
      default: return (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}><span style={{ fontSize: 11, color: tc, opacity: 0.5 }}>{c.label}</span></div>);
    }
  };

  return (
    <div style={{ height: c.h, background: c.bg, borderRadius: 6, overflow: "hidden", position: "relative", marginBottom: 3 }}>
      {inner()}
      <span style={{ position: "absolute", bottom: 4, left: 8, fontSize: 10, fontWeight: 600, color: tc, opacity: 0.7 }}>{c.label}</span>
    </div>
  );
}

// ─── Style System ───────────────────────────────────────────────────────────────

const S = {
  page: { maxWidth: 960, margin: "0 auto", padding: "0 16px 40px" },
  banner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 14,
    color: "#1E40AF",
  },
  bannerError: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#991B1B",
  },
  bannerSuccess: {
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    color: "#166534",
  },
  themeInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    marginBottom: 20,
  },
  themeLabel: { fontSize: 14, color: "#6B7280" },
  themeName: { fontSize: 16, fontWeight: 700, color: "#111827" },
  themeRole: {
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 6,
    background: "#DBEAFE",
    color: "#1E40AF",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    position: "relative",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  cardSelected: {
    borderColor: "#2563EB",
    boxShadow: "0 0 0 2px rgba(37,99,235,0.15)",
  },
  cardActive: {
    borderColor: "#16A34A",
    boxShadow: "0 0 0 2px rgba(22,163,74,0.12)",
  },
  cardPreview: {
    height: 140,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
    borderBottom: "1px solid #F3F4F6",
    fontSize: 48,
  },
  cardBody: { padding: "14px 16px" },
  cardName: { margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" },
  cardDesc: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 1.4,
  },
  cardSections: {
    margin: "8px 0 0",
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#F3F4F6",
    color: "#6B7280",
  },
  activeBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 6,
    background: "#16A34A",
    color: "#FFFFFF",
  },
  selectedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 6,
    background: "#2563EB",
    color: "#FFFFFF",
  },
  actions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: "16px 0",
    borderTop: "1px solid #E5E7EB",
    marginTop: 8,
  },
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
    cursor: "not-allowed",
  },
  btnSecondary: {
    padding: "10px 24px",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  customSection: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  textarea: {
    width: "100%",
    minHeight: 300,
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    fontFamily: "monospace",
    background: "#FAFAFA",
    color: "#111827",
    resize: "vertical",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
  },
  currentJson: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  pre: {
    margin: 0,
    fontSize: 12,
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    maxHeight: 400,
    overflow: "auto",
    color: "#374151",
  },
  tabs: {
    display: "flex",
    gap: 6,
    marginBottom: 24,
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
  tabActive: { color: "#FFFFFF", background: "#2563EB", border: "1px solid #2563EB", boxShadow: "0 0 0 2px rgba(37,99,235,0.15)" },
  previewContainer: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  previewBlock: {
    padding: "16px 20px",
    marginBottom: 8,
    borderRadius: 8,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
  },
  previewBlockName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  previewBlockType: {
    fontSize: 12,
    color: "#6B7280",
    margin: "2px 0 0",
  },
};

// ─── Server: Theme helpers via GraphQL ───────────────────────────────────────

async function findBlumTheme(admin) {
  const response = await admin.graphql(
    `#graphql
      query FindThemes {
        themes(first: 50) {
          nodes { id name role }
        }
      }
    `,
  );
  const json = await response.json();
  const themes = json?.data?.themes?.nodes ?? [];
  const blumThemes = themes.filter(
    (t) => t.name && t.name.toLowerCase().includes(THEME_NAME.toLowerCase()),
  );
  return blumThemes.find((t) => t.role === "MAIN") || blumThemes[0] || null;
}

async function readTemplateFile(admin, themeId) {
  const response = await admin.graphql(
    `#graphql
      query ReadTemplate($themeId: ID!) {
        theme(id: $themeId) {
          files(filenames: ["templates/index.json"], first: 1) {
            nodes {
              filename
              body { ... on OnlineStoreThemeFileBodyText { content } }
            }
          }
        }
      }
    `,
    { variables: { themeId } },
  );
  const json = await response.json();
  return json?.data?.theme?.files?.nodes?.[0]?.body?.content ?? null;
}

async function writeTemplateFile(session, themeGid, jsonContent) {
  const numericId = themeGid.split("/").pop();
  const shop = session.shop;
  const token = process.env.THEME_WRITER_TOKEN;

  if (!token) {
    throw new Error("THEME_WRITER_TOKEN not set in .env");
  }

  const url = `https://${shop}/admin/api/2024-10/themes/${numericId}/assets.json`;
  const body = JSON.stringify({
    asset: { key: TEMPLATE_FILE, value: jsonContent },
  });

  console.log(`[writeTemplateFile] PUT ${url} (using Custom App token)`);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body,
  });

  const text = await response.text();
  console.log(`[writeTemplateFile] Status: ${response.status}`);

  if (!response.ok) {
    throw new Error(`REST API error (${response.status}): ${text.substring(0, 300)}`);
  }

  const result = JSON.parse(text);
  return result?.asset ? [{ filename: result.asset.key }] : [];
}

// ─── Detect active preset ───────────────────────────────────────────────────────

function detectActivePreset(currentJson) {
  if (!currentJson) return null;
  try {
    const current = JSON.parse(currentJson);
    const currentOrder = JSON.stringify(current.order ?? []);
    for (const layout of LAYOUTS) {
      const presetOrder = JSON.stringify(layout.template.order);
      if (currentOrder === presetOrder) {
        const currentTypes = (current.order ?? []).map(
          (key) => current.sections?.[key]?.type,
        );
        const presetTypes = layout.template.order.map(
          (key) => layout.template.sections?.[key]?.type,
        );
        if (JSON.stringify(currentTypes) === JSON.stringify(presetTypes)) {
          return layout.id;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// ─── Loader ─────────────────────────────────────────────────────────────────────

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  try {
    const theme = await findBlumTheme(admin);

    if (!theme) {
      return {
        error: `Theme "${THEME_NAME}" not found. Please install the ${THEME_NAME} theme first.`,
        theme: null,
        currentTemplate: null,
        activePreset: null,
        layouts: LAYOUTS.map(({ id, name, description, thumbnail, template }) => ({
          id, name, description, thumbnail,
          sectionOrder: template.order,
          sectionTypes: template.order.map((key) => template.sections[key]?.type ?? key),
        })),
      };
    }

    const currentTemplate = await readTemplateFile(admin, theme.id);
    const activePreset = detectActivePreset(currentTemplate);

    return {
      error: null,
      theme: { id: theme.id, name: theme.name, role: theme.role },
      currentTemplate,
      activePreset,
      layouts: LAYOUTS.map(({ id, name, description, thumbnail, template }) => ({
        id, name, description, thumbnail,
        sectionOrder: template.order,
        sectionTypes: template.order.map((key) => template.sections[key]?.type ?? key),
      })),
    };
  } catch (err) {
    return {
      error: err?.message || "Failed to load theme data.",
      theme: null,
      currentTemplate: null,
      activePreset: null,
      layouts: LAYOUTS.map(({ id, name, description, thumbnail, template }) => ({
        id, name, description, thumbnail,
        sectionOrder: template.order,
        sectionTypes: template.order.map((key) => template.sections[key]?.type ?? key),
      })),
    };
  }
};

// ─── Action ─────────────────────────────────────────────────────────────────────

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  try {
    const theme = await findBlumTheme(admin);
    if (!theme) {
      return { ok: false, error: `Theme "${THEME_NAME}" not found.` };
    }

    if (intent === "apply_preset") {
      const layoutId = String(formData.get("layout_id") ?? "");
      const layout = LAYOUTS.find((l) => l.id === layoutId);
      if (!layout) {
        return { ok: false, error: "Invalid layout selected." };
      }
      const jsonContent = JSON.stringify(layout.template, null, 2);
      await writeTemplateFile(session, theme.id, jsonContent);
      return { ok: true, appliedLayout: layoutId };
    }

    if (intent === "apply_custom") {
      const customJson = String(formData.get("custom_json") ?? "").trim();
      if (!customJson) {
        return { ok: false, error: "JSON content cannot be empty." };
      }
      try {
        JSON.parse(customJson);
      } catch {
        return { ok: false, error: "Invalid JSON format." };
      }
      const formatted = JSON.stringify(JSON.parse(customJson), null, 2);
      await writeTemplateFile(session, theme.id, formatted);
      return { ok: true, appliedLayout: "custom" };
    }

    return { ok: false, error: "Unknown action." };
  } catch (err) {
    return { ok: false, error: err?.message || "Failed to update layout." };
  }
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function Feature2Page() {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [activeTab, setActiveTab] = useState("presets");
  const [customJson, setCustomJson] = useState("");
  const [toast, setToast] = useState(null);

  const isSubmitting = fetcher.state !== "idle";
  const { error, theme, currentTemplate, activePreset, layouts } = loaderData ?? {};

  useEffect(() => {
    if (currentTemplate && !customJson) {
      try {
        setCustomJson(JSON.stringify(JSON.parse(currentTemplate), null, 2));
      } catch {
        setCustomJson(currentTemplate || "");
      }
    }
  }, [currentTemplate]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.ok) {
        setToast({ type: "success", message: "Layout updated! Changes are live on your storefront." });
      } else if (fetcher.data.error) {
        setToast({ type: "error", message: fetcher.data.error });
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleApplyPreset = useCallback(() => {
    if (!selectedLayout) return;
    const fd = new FormData();
    fd.set("intent", "apply_preset");
    fd.set("layout_id", selectedLayout);
    fetcher.submit(fd, { method: "POST" });
  }, [selectedLayout, fetcher]);

  const handleApplyCustom = useCallback(() => {
    const fd = new FormData();
    fd.set("intent", "apply_custom");
    fd.set("custom_json", customJson);
    fetcher.submit(fd, { method: "POST" });
  }, [customJson, fetcher]);

  return (
    <div style={S.page}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
        Switch Homepage Layout
      </h1>
      <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 20px" }}>
        Choose a preset layout or customize the homepage template for your {THEME_NAME} theme.
      </p>

      {toast && (
        <div style={{ ...S.banner, ...(toast.type === "success" ? S.bannerSuccess : S.bannerError) }}>
          {toast.type === "success" ? "OK" : "!"} {toast.message}
        </div>
      )}

      {error && (
        <div style={{ ...S.banner, ...S.bannerError }}>{error}</div>
      )}

      {theme && (
        <div style={S.themeInfo}>
          <div>
            <div style={S.themeLabel}>Active Theme</div>
            <div style={S.themeName}>{theme.name}</div>
          </div>
          <span style={S.themeRole}>{theme.role}</span>
        </div>
      )}

      <div style={S.tabs}>
        {[
          { id: "presets", label: "Preset Layouts" },
          { id: "custom", label: "Custom JSON" },
          { id: "current", label: "Current Template" },
        ].map((tab) => (
          <button
            key={tab.id}
            style={{ ...S.tab, ...(activeTab === tab.id ? S.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "presets" && (
        <div style={{ display: "flex", gap: 20 }}>
          {/* Left: Layout list */}
          <div style={{ flex: "0 0 280px" }}>
            {(layouts ?? []).map((layout) => {
              const isActive = activePreset === layout.id;
              const isSelected = selectedLayout === layout.id;
              return (
                <div
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout.id)}
                  style={{
                    position: "relative", padding: "14px 16px", marginBottom: 8, borderRadius: 12, cursor: "pointer",
                    border: isSelected ? "1px solid #2563EB" : isActive ? "1px solid #16A34A" : "1px solid #E5E7EB",
                    background: isSelected ? "#EFF6FF" : isActive ? "#F0FDF4" : "#FFFFFF",
                    boxShadow: isSelected ? "0 0 0 2px rgba(37,99,235,0.15)" : isActive ? "0 0 0 2px rgba(22,163,74,0.12)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{layout.thumbnail}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>{layout.name}</h3>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{layout.sectionTypes.length} sections</p>
                    </div>
                    {isActive && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#16A34A", color: "#FFF" }}>Active</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Preview panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {(() => {
              const layout = (layouts ?? []).find((l) => l.id === selectedLayout);
              if (!layout) return (
                <div style={{ background: "#F9FAFB", border: "2px dashed #D1D5DB", borderRadius: 12, padding: 60, textAlign: "center" }}>
                  <p style={{ fontSize: 32, margin: "0 0 8px" }}>&#x1F449;</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#6B7280", margin: 0 }}>Select a layout to preview</p>
                  <p style={{ fontSize: 13, color: "#9CA3AF", margin: "4px 0 0" }}>Click on a layout from the list to see its sections</p>
                </div>
              );
              const isActive = activePreset === layout.id;
              return (
                <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{layout.thumbnail}</span>
                      <div>
                        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{layout.name}</h2>
                        <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>{layout.sectionTypes.length} sections</p>
                      </div>
                    </div>
                    <button
                      style={{ ...S.btnPrimary, padding: "8px 20px", fontSize: 13, ...(isSubmitting || !theme || isActive ? S.btnPrimaryDisabled : {}) }}
                      disabled={isSubmitting || !theme || isActive}
                      onClick={handleApplyPreset}
                    >
                      {isSubmitting ? "Applying..." : isActive ? "Currently Active" : "Apply Layout"}
                    </button>
                  </div>
                  {/* Wireframe preview */}
                  <div style={{ padding: "16px 20px", background: "#F8FAFC" }}>
                    <div style={{ background: "#FFFFFF", borderRadius: 8, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#F3F4F6", borderBottom: "1px solid #E5E7EB" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                        <div style={{ flex: 1, height: 18, borderRadius: 4, background: "#FFFFFF", marginLeft: 8, border: "1px solid #E5E7EB" }} />
                      </div>
                      <div style={{ padding: 8 }}>
                        {layout.sectionTypes.map((type, idx) => (
                          <SectionWireframe key={idx} type={type} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === "custom" && (
        <div style={S.customSection}>
          <label style={S.label}>Custom Template JSON (templates/index.json)</label>
          <textarea
            style={S.textarea}
            value={customJson}
            onChange={(e) => setCustomJson(e.target.value)}
            placeholder='{"sections": {...}, "order": [...]}'
            spellCheck={false}
          />
          <div style={{ ...S.actions, borderTop: "none", marginTop: 0, paddingTop: 12 }}>
            <button
              style={{ ...S.btnPrimary, ...(!customJson.trim() || isSubmitting || !theme ? S.btnPrimaryDisabled : {}) }}
              disabled={!customJson.trim() || isSubmitting || !theme}
              onClick={handleApplyCustom}
            >
              {isSubmitting ? "Applying..." : "Apply Custom Layout"}
            </button>
            <button
              style={S.btnSecondary}
              onClick={() => {
                try {
                  setCustomJson(JSON.stringify(JSON.parse(customJson), null, 2));
                } catch {
                  setToast({ type: "error", message: "Cannot format: invalid JSON." });
                }
              }}
            >
              Format JSON
            </button>
          </div>
        </div>
      )}

      {activeTab === "current" && (
        <div style={S.currentJson}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ ...S.label, marginBottom: 0 }}>Current templates/index.json</label>
            <button
              style={S.btnSecondary}
              onClick={() => {
                if (currentTemplate) {
                  try { setCustomJson(JSON.stringify(JSON.parse(currentTemplate), null, 2)); }
                  catch { setCustomJson(currentTemplate); }
                  setActiveTab("custom");
                }
              }}
            >
              Edit in Custom tab
            </button>
          </div>
          {currentTemplate ? (
            <pre style={S.pre}>
              {(() => { try { return JSON.stringify(JSON.parse(currentTemplate), null, 2); } catch { return currentTemplate; } })()}
            </pre>
          ) : (
            <p style={{ fontSize: 14, color: "#6B7280" }}>
              {theme ? "No template file found." : "Connect to a theme to view the current template."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export const ErrorBoundary = boundary.error;
