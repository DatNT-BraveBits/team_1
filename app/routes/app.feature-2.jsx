import { useEffect, useState, useCallback } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { LAYOUTS } from "../features/feature-2/layouts/index";

// ─── Constants ──────────────────────────────────────────────────────────────────

const THEME_NAME = "Blum";
const TEMPLATE_FILE = "templates/index.json";

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
    padding: "4px 10px",
    borderRadius: 999,
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
    border: "2px solid #E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  cardSelected: {
    borderColor: "#2563EB",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.15)",
  },
  cardActive: {
    borderColor: "#16A34A",
    boxShadow: "0 0 0 3px rgba(22,163,74,0.12)",
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
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 999,
    background: "#16A34A",
    color: "#FFFFFF",
  },
  selectedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 999,
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
    fontSize: 14,
    fontWeight: 700,
    color: "#FFFFFF",
    background: "#2563EB",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  btnPrimaryDisabled: {
    background: "#93C5FD",
    cursor: "not-allowed",
  },
  btnSecondary: {
    padding: "10px 24px",
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    background: "#FFFFFF",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    cursor: "pointer",
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
    border: "1px solid #D1D5DB",
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
    gap: 0,
    borderBottom: "2px solid #E5E7EB",
    marginBottom: 24,
  },
  tab: {
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 600,
    color: "#6B7280",
    cursor: "pointer",
    border: "none",
    background: "none",
    borderBottom: "2px solid transparent",
    marginBottom: -2,
    transition: "color 0.15s, border-color 0.15s",
  },
  tabActive: { color: "#2563EB", borderBottomColor: "#2563EB" },
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
        setSelectedLayout(null);
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
        <>
          <div style={S.grid}>
            {(layouts ?? []).map((layout) => {
              const isActive = activePreset === layout.id;
              const isSelected = selectedLayout === layout.id;
              return (
                <div
                  key={layout.id}
                  style={{
                    ...S.card,
                    ...(isSelected ? S.cardSelected : {}),
                    ...(isActive && !isSelected ? S.cardActive : {}),
                  }}
                  onClick={() => setSelectedLayout(layout.id)}
                >
                  {isActive && <span style={S.activeBadge}>Active</span>}
                  {isSelected && !isActive && <span style={S.selectedBadge}>Selected</span>}
                  <div style={S.cardPreview}>{layout.thumbnail}</div>
                  <div style={S.cardBody}>
                    <h3 style={S.cardName}>{layout.name}</h3>
                    <p style={S.cardDesc}>{layout.description}</p>
                    <div style={S.cardSections}>
                      {layout.sectionTypes.map((type, i) => (
                        <span key={i} style={S.sectionTag}>{type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedLayout && (
            <div style={S.previewContainer}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#111827" }}>
                Layout Preview: {(layouts ?? []).find((l) => l.id === selectedLayout)?.name}
              </h3>
              {(() => {
                const layout = (layouts ?? []).find((l) => l.id === selectedLayout);
                if (!layout) return null;
                return layout.sectionTypes.map((type, idx) => (
                  <div key={idx} style={S.previewBlock}>
                    <p style={S.previewBlockName}>{idx + 1}. {type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</p>
                  </div>
                ));
              })()}
            </div>
          )}

          <div style={S.actions}>
            <button
              style={{ ...S.btnPrimary, ...(!selectedLayout || isSubmitting || !theme ? S.btnPrimaryDisabled : {}) }}
              disabled={!selectedLayout || isSubmitting || !theme}
              onClick={handleApplyPreset}
            >
              {isSubmitting ? "Applying..." : "Apply Layout"}
            </button>
            {selectedLayout && (
              <button style={S.btnSecondary} onClick={() => setSelectedLayout(null)}>
                Cancel
              </button>
            )}
          </div>
        </>
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
