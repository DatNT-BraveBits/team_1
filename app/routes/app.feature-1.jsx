import { useEffect, useState, useCallback } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

// ─── Constants ──────────────────────────────────────────────────────────────────

const SETTINGS_NAMESPACE = "app_ai";
const SETTINGS_KEY = "feature_1_settings";
const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_UPLOAD_SIZE_LABEL = "2 MB";

const POSITION_OPTIONS = [
  "top-left", "top-center", "top-right",
  "center-left", "center", "center-right",
  "bottom-left", "bottom-center", "bottom-right",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const TABS = [
  { id: "design", label: "Badge Design" },
  { id: "schedule", label: "Schedule" },
  { id: "analytics", label: "Overview" },
];

const DEFAULT_SETTINGS = {
  trustBadges: {
    enabled: true,
    textBadge: {
      enabled: true,
      label: "New",
      position: "top-left",
      productTargetMode: "all",
      selectedProductHandles: [],
      borderRadius: 999,
      badgeHeight: 28,
      fontSize: 12,
      paddingX: 10,
      paddingY: 4,
      textColor: "#FFFFFF",
      backgroundColor: "#0F766E",
      backgroundImageUrl: "",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    countdownBadge: {
      enabled: false,
      prefix: "Ends in",
      endAt: "",
      timeMode: "global",
      perProductEndAt: {},
      position: "top-right",
      productTargetMode: "all",
      selectedProductHandles: [],
      borderRadius: 999,
      badgeHeight: 28,
      fontSize: 12,
      paddingX: 10,
      paddingY: 4,
      textColor: "#FFFFFF",
      backgroundColor: "#7C3AED",
      backgroundImageUrl: "",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    schedule: {
      enabled: false,
      startAt: "",
      endAt: "",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    },
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
  tabActive: {
    color: "#2563EB",
    borderBottomColor: "#2563EB",
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
    border: "1px solid #D1D5DB",
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
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    background: "#FFFFFF",
    color: "#111827",
    minHeight: 38,
    boxSizing: "border-box",
  },
  checkbox: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    fontSize: 14,
    color: "#374151",
    cursor: "pointer",
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
  section: {
    display: "grid",
    gap: 16,
    padding: 20,
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" },
  sectionDesc: { margin: "2px 0 0", fontSize: 13, color: "#6B7280" },
  fileInput: {
    width: "100%",
    border: "1px dashed #CBD5E1",
    borderRadius: 8,
    padding: "8px 10px",
    background: "#FFFFFF",
    boxSizing: "border-box",
  },
  detailsSummary: {
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    padding: "8px 0",
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
  dot: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    marginRight: 6,
  },
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
  dayChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 36,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid #D1D5DB",
    background: "#FFFFFF",
    color: "#6B7280",
    transition: "all 0.15s",
  },
  dayChipActive: {
    background: "#2563EB",
    color: "#FFFFFF",
    borderColor: "#2563EB",
  },
  scheduleCard: {
    background: "#F0F9FF",
    border: "1px solid #BAE6FD",
    borderRadius: 12,
    padding: 20,
    display: "grid",
    gap: 16,
  },
  previewBox: {
    position: "relative",
    width: "100%",
    maxWidth: 380,
    height: 180,
    margin: "12px auto 0",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #DBEAFE",
    background: "linear-gradient(180deg, rgba(224,242,254,0.7), rgba(255,255,255,1))",
  },
};

// ─── Helper Functions ───────────────────────────────────────────────────────────

function safeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeHandle(value) {
  return String(value || "").trim().toLowerCase().replace(/^\/+|\/+$/g, "").replace(/^products\//, "");
}

function getPositionStyle(position) {
  const map = {
    "top-left": { top: 8, left: 8 },
    "top-center": { top: 8, left: "50%", transform: "translateX(-50%)" },
    "top-right": { top: 8, right: 8 },
    "center-left": { top: "50%", left: 8, transform: "translateY(-50%)" },
    center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    "center-right": { top: "50%", right: 8, transform: "translateY(-50%)" },
    "bottom-left": { bottom: 8, left: 8 },
    "bottom-center": { bottom: 8, left: "50%", transform: "translateX(-50%)" },
    "bottom-right": { bottom: 8, right: 8 },
  };
  return map[position] ?? map["top-left"];
}

function getShiftedPreviewPosition(position, shiftPx) {
  const base = getPositionStyle(position);
  const next = { ...base };
  if (typeof next.top === "number") { next.top += shiftPx; return next; }
  if (typeof next.bottom === "number") { next.bottom += shiftPx; return next; }
  return { ...next, marginTop: shiftPx };
}

async function fileToDataUrl(file) {
  if (!(file instanceof File) || file.size <= 0) return "";
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error(`File is too large. Max ${MAX_UPLOAD_SIZE_LABEL}.`);
  }
  const fileBytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/png";
  return `data:${mimeType};base64,${fileBytes.toString("base64")}`;
}

async function resolveBackgroundImage({ formData, urlField, fileField, removeField, existingValue }) {
  if (formData.get(removeField) === "on") return "";
  const uploaded = formData.get(fileField);
  const uploadedDataUrl = await fileToDataUrl(uploaded);
  if (uploadedDataUrl) return uploadedDataUrl;
  const explicitUrl = String(formData.get(urlField) || "").trim();
  if (explicitUrl) return explicitUrl;
  return existingValue || "";
}

// ─── Settings Merge (backward compatible) ───────────────────────────────────────

function mergeSettings(rawValue) {
  try {
    const parsed = JSON.parse(rawValue ?? "{}");
    const trustRaw = parsed?.trustBadges ?? {};
    const hasTextBadge = typeof trustRaw?.textBadge === "object" && trustRaw?.textBadge;
    const hasCountdownBadge = typeof trustRaw?.countdownBadge === "object" && trustRaw?.countdownBadge;
    const scheduleRaw = trustRaw?.schedule ?? {};

    const mergeBadge = (badgeRaw, hasBadge, defaults, legacyMap) => {
      const raw = hasBadge ? badgeRaw : legacyMap;
      return {
        ...defaults,
        ...raw,
        borderRadius: safeNumber(raw?.borderRadius ?? defaults.borderRadius, defaults.borderRadius),
        badgeHeight: safeNumber(raw?.badgeHeight ?? defaults.badgeHeight, defaults.badgeHeight),
        fontSize: safeNumber(raw?.fontSize ?? defaults.fontSize, defaults.fontSize),
        paddingX: safeNumber(raw?.paddingX ?? defaults.paddingX, defaults.paddingX),
        paddingY: safeNumber(raw?.paddingY ?? defaults.paddingY, defaults.paddingY),
        textColor: String(raw?.textColor ?? defaults.textColor),
        backgroundColor: String(raw?.backgroundColor ?? defaults.backgroundColor),
        backgroundImageUrl: String(raw?.backgroundImageUrl ?? defaults.backgroundImageUrl),
        backgroundSize: String(raw?.backgroundSize ?? defaults.backgroundSize),
        backgroundPosition: String(raw?.backgroundPosition ?? defaults.backgroundPosition),
      };
    };

    const textDefaults = DEFAULT_SETTINGS.trustBadges.textBadge;
    const countdownDefaults = DEFAULT_SETTINGS.trustBadges.countdownBadge;

    const textLegacy = {
      enabled: trustRaw.showNewProduct ?? true,
      label: trustRaw.newLabel ?? "New",
      position: trustRaw.position ?? "top-left",
      productTargetMode: trustRaw.productTargetMode ?? "all",
      selectedProductHandles: trustRaw.selectedProductHandles ?? [],
      borderRadius: trustRaw.borderRadius ?? 999,
      badgeHeight: trustRaw.badgeHeight ?? 28,
      fontSize: trustRaw.fontSize ?? 12,
      paddingX: trustRaw.paddingX ?? 10,
      paddingY: trustRaw.paddingY ?? 4,
      textColor: trustRaw.textColor ?? "#FFFFFF",
      backgroundColor: trustRaw.newBackground ?? "#0F766E",
      backgroundImageUrl: trustRaw.newBackgroundImageUrl ?? "",
      backgroundSize: trustRaw.backgroundSize ?? "cover",
      backgroundPosition: trustRaw.backgroundPosition ?? "center",
    };

    const countdownLegacy = {
      enabled: trustRaw.countdownEnabled ?? false,
      prefix: trustRaw.countdownPrefix ?? "Ends in",
      endAt: trustRaw.countdownEndAt ?? "",
      position: trustRaw.position ?? "top-right",
      productTargetMode: trustRaw.productTargetMode ?? "all",
      selectedProductHandles: trustRaw.selectedProductHandles ?? [],
      borderRadius: trustRaw.borderRadius ?? 999,
      badgeHeight: trustRaw.badgeHeight ?? 28,
      fontSize: trustRaw.fontSize ?? 12,
      paddingX: trustRaw.paddingX ?? 10,
      paddingY: trustRaw.paddingY ?? 4,
      textColor: trustRaw.textColor ?? "#FFFFFF",
      backgroundColor: trustRaw.newBackground ?? "#7C3AED",
      backgroundImageUrl: trustRaw.newBackgroundImageUrl ?? "",
      backgroundSize: trustRaw.backgroundSize ?? "cover",
      backgroundPosition: trustRaw.backgroundPosition ?? "center",
    };

    const countdownBadge = mergeBadge(trustRaw.countdownBadge, hasCountdownBadge, countdownDefaults, countdownLegacy);
    countdownBadge.timeMode =
      String(hasCountdownBadge ? trustRaw.countdownBadge?.timeMode : trustRaw.countdownTimeMode).toLowerCase() === "per_product"
        ? "per_product" : "global";
    countdownBadge.perProductEndAt =
      hasCountdownBadge && trustRaw.countdownBadge?.perProductEndAt && typeof trustRaw.countdownBadge.perProductEndAt === "object"
        ? trustRaw.countdownBadge.perProductEndAt : {};

    return {
      trustBadges: {
        ...DEFAULT_SETTINGS.trustBadges,
        ...trustRaw,
        enabled: trustRaw.enabled ?? true,
        textBadge: mergeBadge(trustRaw.textBadge, hasTextBadge, textDefaults, textLegacy),
        countdownBadge,
        schedule: {
          enabled: scheduleRaw.enabled ?? false,
          startAt: scheduleRaw.startAt ?? "",
          endAt: scheduleRaw.endAt ?? "",
          daysOfWeek: Array.isArray(scheduleRaw.daysOfWeek) ? scheduleRaw.daysOfWeek : ALL_DAYS,
        },
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
      query FeatureOneSettings {
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

async function readProducts(admin) {
  const response = await admin.graphql(
    `#graphql
      query FeatureOneProducts {
        products(first: 100, sortKey: TITLE) {
          edges { node { id title handle } }
        }
      }
    `,
  );
  const json = await response.json();
  return (json?.data?.products?.edges ?? [])
    .map((e) => e?.node)
    .filter((n) => n?.handle)
    .map((n) => ({ id: n.id, title: n.title, handle: n.handle }));
}

async function writeSettings(admin, appInstallationId, settings) {
  const response = await admin.graphql(
    `#graphql
      mutation SaveFeatureOneSettings($metafields: [MetafieldsSetInput!]!) {
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
  const products = await readProducts(admin);
  return Response.json({ settings, products });
};

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
    if (intent === "save_badges") {
      const textBgUrl = await resolveBackgroundImage({
        formData,
        urlField: "text_badge_background_image_url",
        fileField: "text_badge_background_image_file",
        removeField: "remove_text_badge_background_image",
        existingValue: settings.trustBadges.textBadge?.backgroundImageUrl,
      });
      const countdownBgUrl = await resolveBackgroundImage({
        formData,
        urlField: "countdown_badge_background_image_url",
        fileField: "countdown_badge_background_image_file",
        removeField: "remove_countdown_badge_background_image",
        existingValue: settings.trustBadges.countdownBadge?.backgroundImageUrl,
      });

      const countdownSelectedHandles = formData
        .getAll("countdown_selected_product_handles")
        .map((i) => normalizeHandle(i)).filter(Boolean);

      const countdownPerProductEndAt = {};
      for (const [key, rawVal] of formData.entries()) {
        if (!String(key).startsWith("countdown_badge_product_end_at__")) continue;
        const handle = normalizeHandle(String(key).replace("countdown_badge_product_end_at__", ""));
        const value = String(rawVal || "").trim();
        if (handle && value) countdownPerProductEndAt[handle] = value;
      }

      const scheduleDays = formData.getAll("schedule_days").map(Number).filter((n) => n >= 0 && n <= 6);

      const nextSettings = {
        ...settings,
        trustBadges: {
          ...settings.trustBadges,
          enabled: formData.get("badge_enabled") === "on",
          textBadge: {
            ...settings.trustBadges.textBadge,
            enabled: formData.get("text_badge_enabled") === "on",
            label: String(formData.get("text_badge_label") || settings.trustBadges.textBadge?.label || "New").trim(),
            position: String(formData.get("text_badge_position") || settings.trustBadges.textBadge?.position || "top-left").toLowerCase(),
            productTargetMode: String(formData.get("text_product_target_mode") || "all").toLowerCase() === "selected" ? "selected" : "all",
            selectedProductHandles: formData.getAll("text_selected_product_handles").map((i) => normalizeHandle(i)).filter(Boolean),
            borderRadius: safeNumber(formData.get("text_badge_radius"), settings.trustBadges.textBadge?.borderRadius ?? 999),
            badgeHeight: safeNumber(formData.get("text_badge_height"), settings.trustBadges.textBadge?.badgeHeight ?? 28),
            fontSize: safeNumber(formData.get("text_badge_font_size"), settings.trustBadges.textBadge?.fontSize ?? 12),
            paddingX: safeNumber(formData.get("text_badge_padding_x"), settings.trustBadges.textBadge?.paddingX ?? 10),
            paddingY: safeNumber(formData.get("text_badge_padding_y"), settings.trustBadges.textBadge?.paddingY ?? 4),
            textColor: String(formData.get("text_badge_text_color") || settings.trustBadges.textBadge?.textColor || "#FFFFFF"),
            backgroundColor: String(formData.get("text_badge_background_color") || settings.trustBadges.textBadge?.backgroundColor || "#0F766E"),
            backgroundImageUrl: textBgUrl,
            backgroundSize: String(formData.get("text_badge_background_size") || settings.trustBadges.textBadge?.backgroundSize || "cover"),
            backgroundPosition: String(formData.get("text_badge_background_position") || settings.trustBadges.textBadge?.backgroundPosition || "center"),
          },
          countdownBadge: {
            ...settings.trustBadges.countdownBadge,
            enabled: formData.get("countdown_badge_enabled") === "on",
            prefix: String(formData.get("countdown_badge_prefix") || settings.trustBadges.countdownBadge?.prefix || "Ends in").trim(),
            endAt: String(formData.get("countdown_badge_end_at") || settings.trustBadges.countdownBadge?.endAt || "").trim(),
            timeMode: String(formData.get("countdown_badge_time_mode") || "global").toLowerCase() === "per_product" ? "per_product" : "global",
            position: String(formData.get("countdown_badge_position") || settings.trustBadges.countdownBadge?.position || "top-right").toLowerCase(),
            productTargetMode: String(formData.get("countdown_product_target_mode") || "all").toLowerCase() === "selected" ? "selected" : "all",
            selectedProductHandles: countdownSelectedHandles,
            perProductEndAt: countdownPerProductEndAt,
            borderRadius: safeNumber(formData.get("countdown_badge_radius"), settings.trustBadges.countdownBadge?.borderRadius ?? 999),
            badgeHeight: safeNumber(formData.get("countdown_badge_height"), settings.trustBadges.countdownBadge?.badgeHeight ?? 28),
            fontSize: safeNumber(formData.get("countdown_badge_font_size"), settings.trustBadges.countdownBadge?.fontSize ?? 12),
            paddingX: safeNumber(formData.get("countdown_badge_padding_x"), settings.trustBadges.countdownBadge?.paddingX ?? 10),
            paddingY: safeNumber(formData.get("countdown_badge_padding_y"), settings.trustBadges.countdownBadge?.paddingY ?? 4),
            textColor: String(formData.get("countdown_badge_text_color") || settings.trustBadges.countdownBadge?.textColor || "#FFFFFF"),
            backgroundColor: String(formData.get("countdown_badge_background_color") || settings.trustBadges.countdownBadge?.backgroundColor || "#7C3AED"),
            backgroundImageUrl: countdownBgUrl,
            backgroundSize: String(formData.get("countdown_badge_background_size") || settings.trustBadges.countdownBadge?.backgroundSize || "cover"),
            backgroundPosition: String(formData.get("countdown_badge_background_position") || settings.trustBadges.countdownBadge?.backgroundPosition || "center"),
          },
          schedule: {
            enabled: formData.get("schedule_enabled") === "on",
            startAt: String(formData.get("schedule_start_at") || "").trim(),
            endAt: String(formData.get("schedule_end_at") || "").trim(),
            daysOfWeek: scheduleDays.length > 0 ? scheduleDays : ALL_DAYS,
          },
        },
      };

      await writeSettings(admin, appInstallationId, nextSettings);
      return Response.json({ ok: true, message: "Settings saved successfully.", settings: nextSettings });
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

function ProductSelectionList({ products, inputName, selectedHandles, controlled = false, onToggle, keyPrefix = "" }) {
  return (
    <div style={{ maxHeight: 200, overflow: "auto", border: "1px solid #E5E7EB", borderRadius: 8, padding: 10, background: "#fff", display: "grid", gap: 6 }}>
      {products.length === 0 ? (
        <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>No products found.</p>
      ) : products.map((product) => (
        <label key={`${keyPrefix}${product.id}`} style={S.checkbox}>
          <input
            type="checkbox"
            name={inputName}
            value={product.handle}
            {...(controlled
              ? { checked: selectedHandles.includes(product.handle), onChange: (e) => onToggle?.(product.handle, e.target.checked) }
              : { defaultChecked: selectedHandles.includes(product.handle) }
            )}
          />
          <span>
            <span style={{ fontSize: 14 }}>{product.title}</span>
            <span style={{ display: "block", fontSize: 12, color: "#9CA3AF" }}>/products/{product.handle}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function BadgeStyleFields({ fieldPrefix, badge }) {
  return (
    <details>
      <summary style={S.detailsSummary}>Advanced style options</summary>
      <div style={{ ...S.fieldGrid, paddingTop: 12 }}>
        <div style={S.fieldRow}>
          <Field label="Border radius">
            <input style={S.input} type="number" name={`${fieldPrefix}_radius`} min="0" defaultValue={badge?.borderRadius ?? 999} />
          </Field>
          <Field label="Badge height">
            <input style={S.input} type="number" name={`${fieldPrefix}_height`} min="18" max="100" defaultValue={badge?.badgeHeight ?? 28} />
          </Field>
        </div>
        <div style={S.fieldRow}>
          <Field label="Font size">
            <input style={S.input} type="number" name={`${fieldPrefix}_font_size`} min="10" max="28" defaultValue={badge?.fontSize ?? 12} />
          </Field>
          <Field label="Text color">
            <input style={{ ...S.input, padding: 4, height: 42 }} type="color" name={`${fieldPrefix}_text_color`} defaultValue={badge?.textColor || "#FFFFFF"} />
          </Field>
        </div>
        <div style={S.fieldRow}>
          <Field label="Horizontal padding">
            <input style={S.input} type="number" name={`${fieldPrefix}_padding_x`} min="0" defaultValue={badge?.paddingX ?? 10} />
          </Field>
          <Field label="Vertical padding">
            <input style={S.input} type="number" name={`${fieldPrefix}_padding_y`} min="0" defaultValue={badge?.paddingY ?? 4} />
          </Field>
        </div>
      </div>
    </details>
  );
}

function BadgeBackgroundFields({ fieldPrefix, badge, defaultColor, labelPrefix }) {
  return (
    <details>
      <summary style={S.detailsSummary}>Background settings ({labelPrefix})</summary>
      <div style={{ ...S.fieldGrid, paddingTop: 12 }}>
        <div style={S.fieldRow}>
          <Field label="Background color">
            <input style={{ ...S.input, padding: 4, height: 42 }} type="color" name={`${fieldPrefix}_background_color`} defaultValue={badge?.backgroundColor || defaultColor} />
          </Field>
          <Field label="Background size">
            <select name={`${fieldPrefix}_background_size`} style={S.select} defaultValue={badge?.backgroundSize || "cover"}>
              <option value="cover">cover</option>
              <option value="contain">contain</option>
              <option value="auto">auto</option>
            </select>
          </Field>
        </div>
        <Field label="Background position">
          <select name={`${fieldPrefix}_background_position`} style={S.select} defaultValue={badge?.backgroundPosition || "center"}>
            {["center", "top", "bottom", "left", "right"].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <Field label={`${labelPrefix} background image URL`}>
          <input type="url" name={`${fieldPrefix}_background_image_url`} style={S.input} placeholder="https://..." defaultValue={badge?.backgroundImageUrl || ""} />
        </Field>
        <Field label={`Upload image (max ${MAX_UPLOAD_SIZE_LABEL})`}>
          <input style={S.fileInput} type="file" name={`${fieldPrefix}_background_image_file`} accept="image/*" />
        </Field>
        <label style={S.checkbox}>
          <input name={`remove_${fieldPrefix}_background_image`} type="checkbox" />
          Remove background image
        </label>
      </div>
    </details>
  );
}

function BadgePreview({ settings }) {
  const previewEndAt =
    settings.countdownBadge?.timeMode === "per_product"
      ? Object.values(settings.countdownBadge?.perProductEndAt || {}).find(Boolean) || ""
      : settings.countdownBadge?.endAt || "";
  const countdownEndTime = previewEndAt ? new Date(previewEndAt).getTime() : NaN;
  const countdownSeconds = Number.isNaN(countdownEndTime) ? 0 : Math.max(0, Math.floor((countdownEndTime - Date.now()) / 1000));
  const previewTimer = `${String(Math.floor(countdownSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((countdownSeconds % 3600) / 60)).padStart(2, "0")}:${String(countdownSeconds % 60).padStart(2, "0")}`;

  const badgesSharePosition =
    settings.textBadge?.enabled && settings.countdownBadge?.enabled &&
    settings.textBadge?.position === settings.countdownBadge?.position;
  const countdownPositionStyle = badgesSharePosition
    ? getShiftedPreviewPosition(settings.countdownBadge?.position || "top-right", (settings.textBadge?.badgeHeight ?? 28) + 10)
    : getPositionStyle(settings.countdownBadge?.position || "top-right");

  const badgeStyle = (badge, fallbackBg) => ({
    position: "absolute",
    zIndex: 2,
    height: badge?.badgeHeight ?? 28,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: badge?.borderRadius ?? 999,
    padding: `${badge?.paddingY ?? 4}px ${badge?.paddingX ?? 10}px`,
    fontSize: badge?.fontSize ?? 12,
    backgroundColor: badge?.backgroundColor || fallbackBg,
    backgroundImage: badge?.backgroundImageUrl ? `url(${badge.backgroundImageUrl})` : "none",
    backgroundSize: badge?.backgroundSize || "cover",
    backgroundPosition: badge?.backgroundPosition || "center",
    color: badge?.textColor || "#FFFFFF",
    fontWeight: 700,
    whiteSpace: "nowrap",
    lineHeight: 1.1,
  });

  return (
    <div style={S.previewBox}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(148,163,184,.22), rgba(226,232,240,.5) 55%, rgba(241,245,249,.8))" }} />
      {settings.textBadge?.enabled && (
        <span style={{ ...badgeStyle(settings.textBadge, "#0F766E"), ...getPositionStyle(settings.textBadge.position) }}>
          {settings.textBadge.label}
        </span>
      )}
      {settings.countdownBadge?.enabled && (
        <span style={{ ...badgeStyle(settings.countdownBadge, "#7C3AED"), ...countdownPositionStyle }}>
          {settings.countdownBadge.prefix || "Ends in"} {previewTimer}
        </span>
      )}
      <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>Product card preview</span>
      </div>
    </div>
  );
}

// ─── Tab: Badge Design ──────────────────────────────────────────────────────────

function DesignTab({ settings, products, textTargetMode, setTextTargetMode, countdownTargetMode, setCountdownTargetMode, countdownSelectedHandles, setCountdownSelectedHandles, countdownTimeMode, setCountdownTimeMode }) {
  const countdownPreviewHandles = countdownTargetMode === "selected" ? countdownSelectedHandles : products.map((p) => p.handle);

  return (
    <div style={S.fieldGrid}>
      {/* Master toggle */}
      <div style={S.toggle}>
        <div>
          <div style={S.toggleLabel}>Badge System</div>
          <div style={S.toggleDesc}>Enable or disable all badge injection on product cards</div>
        </div>
        <input name="badge_enabled" type="checkbox" defaultChecked={settings.trustBadges.enabled} style={{ width: 18, height: 18 }} />
      </div>

      {/* Live Preview */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>Live Preview</p>
        </div>
        <div style={S.cardBody}>
          <BadgePreview settings={settings.trustBadges} />
        </div>
      </div>

      {/* Text Badge */}
      <div style={S.card}>
        <div style={{ ...S.cardHeader, background: "#F0FDF4", borderBottom: "1px solid #BBF7D0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ ...S.cardTitle, color: "#166534" }}>Text Badge</p>
            <label style={S.checkbox}>
              <input name="text_badge_enabled" type="checkbox" defaultChecked={settings.trustBadges.textBadge?.enabled} />
              <span style={{ fontSize: 13 }}>Enabled</span>
            </label>
          </div>
        </div>
        <div style={{ ...S.cardBody, ...S.fieldGrid }}>
          <div style={S.fieldRow}>
            <Field label="Badge label">
              <input style={S.input} name="text_badge_label" defaultValue={settings.trustBadges.textBadge?.label || "New"} />
            </Field>
            <Field label="Position">
              <select style={S.select} name="text_badge_position" defaultValue={settings.trustBadges.textBadge?.position || "top-left"}>
                {POSITION_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ padding: "12px 16px", background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
            <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600, color: "#374151" }}>Product targeting</p>
            <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
              <label style={S.checkbox}>
                <input type="radio" name="text_product_target_mode" value="all" checked={textTargetMode !== "selected"} onChange={() => setTextTargetMode("all")} />
                All products
              </label>
              <label style={S.checkbox}>
                <input type="radio" name="text_product_target_mode" value="selected" checked={textTargetMode === "selected"} onChange={() => setTextTargetMode("selected")} />
                Selected only
              </label>
            </div>
            {textTargetMode === "selected" && (
              <ProductSelectionList products={products} inputName="text_selected_product_handles" selectedHandles={settings.trustBadges.textBadge?.selectedProductHandles || []} />
            )}
          </div>

          <BadgeStyleFields fieldPrefix="text_badge" badge={settings.trustBadges.textBadge} />
          <BadgeBackgroundFields fieldPrefix="text_badge" badge={settings.trustBadges.textBadge} defaultColor="#0F766E" labelPrefix="Text badge" />
        </div>
      </div>

      {/* Countdown Badge */}
      <div style={S.card}>
        <div style={{ ...S.cardHeader, background: "#F5F3FF", borderBottom: "1px solid #DDD6FE" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ ...S.cardTitle, color: "#5B21B6" }}>Countdown Badge</p>
            <label style={S.checkbox}>
              <input name="countdown_badge_enabled" type="checkbox" defaultChecked={settings.trustBadges.countdownBadge?.enabled} />
              <span style={{ fontSize: 13 }}>Enabled</span>
            </label>
          </div>
        </div>
        <div style={{ ...S.cardBody, ...S.fieldGrid }}>
          <div style={S.fieldRow}>
            <Field label="Prefix text">
              <input style={S.input} name="countdown_badge_prefix" defaultValue={settings.trustBadges.countdownBadge?.prefix || "Ends in"} placeholder="Ends in" />
            </Field>
            <Field label="End time">
              <input style={S.input} type="datetime-local" name="countdown_badge_end_at" defaultValue={settings.trustBadges.countdownBadge?.endAt || ""} />
            </Field>
          </div>

          <div style={{ padding: "12px 16px", background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
            <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600, color: "#374151" }}>Time mode</p>
            <div style={{ display: "flex", gap: 16 }}>
              <label style={S.checkbox}>
                <input type="radio" name="countdown_badge_time_mode" value="global" checked={countdownTimeMode !== "per_product"} onChange={() => setCountdownTimeMode("global")} />
                Global countdown
              </label>
              <label style={S.checkbox}>
                <input type="radio" name="countdown_badge_time_mode" value="per_product" checked={countdownTimeMode === "per_product"} onChange={() => setCountdownTimeMode("per_product")} />
                Per-product
              </label>
            </div>
          </div>

          <Field label="Position">
            <select style={S.select} name="countdown_badge_position" defaultValue={settings.trustBadges.countdownBadge?.position || "top-right"}>
              {POSITION_OPTIONS.map((p) => <option key={`cd-${p}`} value={p}>{p}</option>)}
            </select>
          </Field>

          <div style={{ padding: "12px 16px", background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
            <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600, color: "#374151" }}>Product targeting</p>
            <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
              <label style={S.checkbox}>
                <input type="radio" name="countdown_product_target_mode" value="all" checked={countdownTargetMode !== "selected"} onChange={() => setCountdownTargetMode("all")} />
                All products
              </label>
              <label style={S.checkbox}>
                <input type="radio" name="countdown_product_target_mode" value="selected" checked={countdownTargetMode === "selected"} onChange={() => setCountdownTargetMode("selected")} />
                Selected only
              </label>
            </div>
            {countdownTargetMode === "selected" && (
              <ProductSelectionList
                products={products}
                inputName="countdown_selected_product_handles"
                selectedHandles={countdownSelectedHandles}
                controlled
                keyPrefix="cd-"
                onToggle={(handle, checked) => {
                  setCountdownSelectedHandles((prev) =>
                    checked ? (prev.includes(handle) ? prev : [...prev, handle]) : prev.filter((i) => i !== handle)
                  );
                }}
              />
            )}
          </div>

          {countdownTimeMode === "per_product" && (
            <div style={{ padding: "12px 16px", background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A" }}>
              <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600, color: "#92400E" }}>Per-product end times</p>
              {countdownPreviewHandles.length === 0 ? (
                <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>Select products to configure individual times.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {countdownPreviewHandles.map((handle) => {
                    const product = products.find((p) => p.handle === handle);
                    return (
                      <Field key={`per-${handle}`} label={product?.title || handle}>
                        <input style={S.input} type="datetime-local" name={`countdown_badge_product_end_at__${handle}`} defaultValue={settings.trustBadges.countdownBadge?.perProductEndAt?.[handle] || ""} />
                      </Field>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <BadgeStyleFields fieldPrefix="countdown_badge" badge={settings.trustBadges.countdownBadge} />
          <BadgeBackgroundFields fieldPrefix="countdown_badge" badge={settings.trustBadges.countdownBadge} defaultColor="#7C3AED" labelPrefix="Countdown badge" />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Schedule ──────────────────────────────────────────────────────────────

function ScheduleTab({ schedule, scheduleDaysDraft, setScheduleDaysDraft }) {
  const toggleDay = useCallback((day) => {
    setScheduleDaysDraft((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }, [setScheduleDaysDraft]);

  const isActive = schedule.enabled;
  const hasTimeRange = schedule.startAt || schedule.endAt;

  return (
    <div style={S.fieldGrid}>
      {/* Schedule info banner */}
      <div style={{ padding: "16px 20px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1E40AF" }}>
          Schedule your badges
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#3B82F6", lineHeight: 1.5 }}>
          Control when badges appear on your storefront. Set a date range and specific days of the week.
          When scheduling is disabled, badges follow their individual enabled/disabled settings.
        </p>
      </div>

      {/* Enable schedule */}
      <div style={S.toggle}>
        <div>
          <div style={S.toggleLabel}>Enable Schedule</div>
          <div style={S.toggleDesc}>Badges will only show during the scheduled time window</div>
        </div>
        <input name="schedule_enabled" type="checkbox" defaultChecked={schedule.enabled} style={{ width: 18, height: 18 }} />
      </div>

      {/* Date range */}
      <div style={S.scheduleCard}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0C4A6E" }}>Date &amp; Time Range</p>
        <div style={S.fieldRow}>
          <Field label="Start date & time">
            <input style={S.input} type="datetime-local" name="schedule_start_at" defaultValue={schedule.startAt || ""} />
          </Field>
          <Field label="End date & time">
            <input style={S.input} type="datetime-local" name="schedule_end_at" defaultValue={schedule.endAt || ""} />
          </Field>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#0369A1" }}>
          Leave empty to have no start/end restriction. Times are based on the visitor's browser timezone.
        </p>
      </div>

      {/* Days of week */}
      <div style={S.scheduleCard}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0C4A6E" }}>Active Days</p>
        <p style={{ margin: "2px 0 12px", fontSize: 13, color: "#0284C7" }}>
          Select which days of the week badges should be visible.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DAY_LABELS.map((label, index) => {
            const active = scheduleDaysDraft.includes(index);
            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleDay(index)}
                style={{ ...S.dayChip, ...(active ? S.dayChipActive : {}) }}
              >
                {label}
              </button>
            );
          })}
        </div>
        {/* Hidden inputs for form submission */}
        {scheduleDaysDraft.map((day) => (
          <input key={`sday-${day}`} type="hidden" name="schedule_days" value={day} />
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button type="button" onClick={() => setScheduleDaysDraft([...ALL_DAYS])} style={{ fontSize: 12, color: "#2563EB", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
            Select all
          </button>
          <span style={{ color: "#CBD5E1" }}>|</span>
          <button type="button" onClick={() => setScheduleDaysDraft([1, 2, 3, 4, 5])} style={{ fontSize: 12, color: "#2563EB", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
            Weekdays
          </button>
          <span style={{ color: "#CBD5E1" }}>|</span>
          <button type="button" onClick={() => setScheduleDaysDraft([0, 6])} style={{ fontSize: 12, color: "#2563EB", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
            Weekends
          </button>
          <span style={{ color: "#CBD5E1" }}>|</span>
          <button type="button" onClick={() => setScheduleDaysDraft([])} style={{ fontSize: 12, color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
            Clear
          </button>
        </div>
      </div>

      {/* Schedule summary */}
      <div style={{ ...S.card, overflow: "visible" }}>
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>Schedule Summary</p>
        </div>
        <div style={S.cardBody}>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Status</span>
            <span style={S.summaryValue}>
              <span style={{ ...S.dot, backgroundColor: isActive ? "#22C55E" : "#9CA3AF" }} />
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Start</span>
            <span style={S.summaryValue}>{schedule.startAt ? new Date(schedule.startAt).toLocaleString() : "No limit"}</span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>End</span>
            <span style={S.summaryValue}>{schedule.endAt ? new Date(schedule.endAt).toLocaleString() : "No limit"}</span>
          </div>
          <div style={{ ...S.summaryRow, borderBottom: "none" }}>
            <span style={S.summaryLabel}>Active days</span>
            <span style={S.summaryValue}>
              {scheduleDaysDraft.length === 7 ? "Every day" : scheduleDaysDraft.length === 0 ? "None" : scheduleDaysDraft.map((d) => DAY_LABELS[d]).join(", ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Analytics / Overview ──────────────────────────────────────────────────

function AnalyticsTab({ settings, products }) {
  const trust = settings.trustBadges;
  const schedule = trust.schedule || {};
  const textBadge = trust.textBadge || {};
  const countdownBadge = trust.countdownBadge || {};

  const textProductCount = textBadge.productTargetMode === "selected"
    ? (textBadge.selectedProductHandles || []).length
    : products.length;
  const countdownProductCount = countdownBadge.productTargetMode === "selected"
    ? (countdownBadge.selectedProductHandles || []).length
    : products.length;

  const countdownEndTime = countdownBadge.endAt ? new Date(countdownBadge.endAt).getTime() : NaN;
  const countdownActive = countdownBadge.enabled && !Number.isNaN(countdownEndTime) && countdownEndTime > Date.now();
  const countdownRemaining = countdownActive ? Math.max(0, Math.floor((countdownEndTime - Date.now()) / 1000)) : 0;
  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const scheduleActive = schedule.enabled;
  const withinScheduleNow = (() => {
    if (!schedule.enabled) return true;
    const now = new Date();
    if (schedule.startAt && new Date(schedule.startAt) > now) return false;
    if (schedule.endAt && new Date(schedule.endAt) < now) return false;
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && schedule.daysOfWeek.length < 7) {
      if (!schedule.daysOfWeek.includes(now.getDay())) return false;
    }
    return true;
  })();

  return (
    <div style={S.fieldGrid}>
      {/* Status overview */}
      <div style={S.statGrid}>
        <div style={S.statCard}>
          <p style={{ ...S.statValue, color: trust.enabled ? "#059669" : "#DC2626" }}>
            {trust.enabled ? "ON" : "OFF"}
          </p>
          <p style={S.statLabel}>Badge System</p>
        </div>
        <div style={S.statCard}>
          <p style={{ ...S.statValue, color: textBadge.enabled ? "#059669" : "#9CA3AF" }}>
            {textBadge.enabled ? "ON" : "OFF"}
          </p>
          <p style={S.statLabel}>Text Badge</p>
        </div>
        <div style={S.statCard}>
          <p style={{ ...S.statValue, color: countdownBadge.enabled ? "#7C3AED" : "#9CA3AF" }}>
            {countdownBadge.enabled ? "ON" : "OFF"}
          </p>
          <p style={S.statLabel}>Countdown Badge</p>
        </div>
        <div style={S.statCard}>
          <p style={{ ...S.statValue, color: scheduleActive ? "#2563EB" : "#9CA3AF" }}>
            {scheduleActive ? (withinScheduleNow ? "LIVE" : "WAIT") : "OFF"}
          </p>
          <p style={S.statLabel}>Schedule</p>
        </div>
      </div>

      {/* Product coverage */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>Product Coverage</p>
          <p style={S.cardDesc}>How many products are affected by each badge type</p>
        </div>
        <div style={S.cardBody}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ textAlign: "center", padding: 16, background: "#F0FDF4", borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#166534" }}>{textProductCount}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#15803D" }}>
                products with text badge
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>
                {textBadge.productTargetMode === "selected" ? "Selected products" : "All products"}
              </p>
            </div>
            <div style={{ textAlign: "center", padding: 16, background: "#F5F3FF", borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#5B21B6" }}>{countdownProductCount}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6D28D9" }}>
                products with countdown
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>
                {countdownBadge.productTargetMode === "selected" ? "Selected products" : "All products"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown status */}
      {countdownBadge.enabled && (
        <div style={S.card}>
          <div style={{ ...S.cardHeader, background: countdownActive ? "#F5F3FF" : "#FEF2F2", borderBottom: `1px solid ${countdownActive ? "#DDD6FE" : "#FECACA"}` }}>
            <p style={{ ...S.cardTitle, color: countdownActive ? "#5B21B6" : "#991B1B" }}>
              Countdown Timer Status
            </p>
          </div>
          <div style={S.cardBody}>
            {countdownActive ? (
              <div style={{ textAlign: "center", padding: 16 }}>
                <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: "#7C3AED", fontVariantNumeric: "tabular-nums" }}>
                  {formatTime(countdownRemaining)}
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6B7280" }}>
                  remaining until {new Date(countdownBadge.endAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 16 }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#991B1B" }}>
                  {countdownBadge.endAt ? "Countdown has ended" : "No end time set"}
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6B7280" }}>
                  {countdownBadge.endAt ? `Ended at ${new Date(countdownBadge.endAt).toLocaleString()}` : "Set an end time in Badge Design tab"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration summary */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <p style={S.cardTitle}>Configuration Summary</p>
        </div>
        <div style={S.cardBody}>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Text badge label</span>
            <span style={{ ...S.summaryValue, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                color: textBadge.textColor || "#fff",
                backgroundColor: textBadge.backgroundColor || "#0F766E",
              }}>
                {textBadge.label || "New"}
              </span>
            </span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Text badge position</span>
            <span style={S.summaryValue}>{textBadge.position || "top-left"}</span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Countdown prefix</span>
            <span style={S.summaryValue}>{countdownBadge.prefix || "Ends in"}</span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Countdown position</span>
            <span style={S.summaryValue}>{countdownBadge.position || "top-right"}</span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Countdown time mode</span>
            <span style={S.summaryValue}>{countdownBadge.timeMode === "per_product" ? "Per-product" : "Global"}</span>
          </div>
          <div style={S.summaryRow}>
            <span style={S.summaryLabel}>Schedule</span>
            <span style={S.summaryValue}>
              {scheduleActive ? (
                <span>
                  <span style={{ ...S.dot, backgroundColor: "#22C55E" }} />
                  {schedule.startAt ? new Date(schedule.startAt).toLocaleDateString() : "No start"} — {schedule.endAt ? new Date(schedule.endAt).toLocaleDateString() : "No end"}
                </span>
              ) : "Not scheduled"}
            </span>
          </div>
          <div style={{ ...S.summaryRow, borderBottom: "none" }}>
            <span style={S.summaryLabel}>Scheduled days</span>
            <span style={S.summaryValue}>
              {!scheduleActive ? "N/A" : (schedule.daysOfWeek || []).length === 7 ? "Every day" : (schedule.daysOfWeek || []).map((d) => DAY_LABELS[d]).join(", ") || "None"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Feature1Route() {
  const { settings: loaderSettings, products } = useLoaderData();
  const fetcher = useFetcher();
  const [settings, setSettings] = useState(loaderSettings);
  const [activeTab, setActiveTab] = useState("design");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Design tab state
  const [textTargetMode, setTextTargetMode] = useState(
    loaderSettings.trustBadges.textBadge?.productTargetMode === "selected" ? "selected" : "all"
  );
  const [countdownTargetMode, setCountdownTargetMode] = useState(
    loaderSettings.trustBadges.countdownBadge?.productTargetMode === "selected" ? "selected" : "all"
  );
  const [countdownSelectedHandles, setCountdownSelectedHandles] = useState(
    loaderSettings.trustBadges.countdownBadge?.selectedProductHandles || []
  );
  const [countdownTimeMode, setCountdownTimeMode] = useState(
    loaderSettings.trustBadges.countdownBadge?.timeMode === "per_product" ? "per_product" : "global"
  );

  // Schedule tab state
  const [scheduleDaysDraft, setScheduleDaysDraft] = useState(
    loaderSettings.trustBadges.schedule?.daysOfWeek ?? [...ALL_DAYS]
  );

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.ok && fetcher.data.settings) {
      setSettings(fetcher.data.settings);
      setTextTargetMode(fetcher.data.settings.trustBadges.textBadge?.productTargetMode === "selected" ? "selected" : "all");
      setCountdownTargetMode(fetcher.data.settings.trustBadges.countdownBadge?.productTargetMode === "selected" ? "selected" : "all");
      setCountdownSelectedHandles(fetcher.data.settings.trustBadges.countdownBadge?.selectedProductHandles || []);
      setCountdownTimeMode(fetcher.data.settings.trustBadges.countdownBadge?.timeMode === "per_product" ? "per_product" : "global");
      setScheduleDaysDraft(fetcher.data.settings.trustBadges.schedule?.daysOfWeek ?? [...ALL_DAYS]);
      setNotice(fetcher.data.message || "Saved.");
      setError("");
    } else if (!fetcher.data.ok) {
      setError(fetcher.data.error || "Failed to save.");
      setNotice("");
    }
  }, [fetcher.data]);

  const isSaving = fetcher.state !== "idle";

  return (
    <s-page heading="Trust Badges">
      {notice && <s-banner tone="success" onDismiss={() => setNotice("")}>{notice}</s-banner>}
      {error && <s-banner tone="critical" onDismiss={() => setError("")}>{error}</s-banner>}

      <div style={S.page}>
        <fetcher.Form method="post" encType="multipart/form-data">
          <input type="hidden" name="intent" value="save_badges" />

          {/* Save bar */}
          <div style={S.saveBar}>
            <div>
              <p style={S.saveTitle}>Trust Badge Settings</p>
              <p style={S.saveHint}>Configure badges, schedule, and view overview</p>
            </div>
            <s-button variant="primary" type="submit" loading={isSaving} disabled={isSaving}>
              Save settings
            </s-button>
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

          {/* Tab panels - all rendered, only active visible */}
          <div style={{ display: activeTab === "design" ? "block" : "none" }}>
            <DesignTab
              settings={settings}
              products={products}
              textTargetMode={textTargetMode}
              setTextTargetMode={setTextTargetMode}
              countdownTargetMode={countdownTargetMode}
              setCountdownTargetMode={setCountdownTargetMode}
              countdownSelectedHandles={countdownSelectedHandles}
              setCountdownSelectedHandles={setCountdownSelectedHandles}
              countdownTimeMode={countdownTimeMode}
              setCountdownTimeMode={setCountdownTimeMode}
            />
          </div>

          <div style={{ display: activeTab === "schedule" ? "block" : "none" }}>
            <ScheduleTab
              schedule={settings.trustBadges.schedule || DEFAULT_SETTINGS.trustBadges.schedule}
              scheduleDaysDraft={scheduleDaysDraft}
              setScheduleDaysDraft={setScheduleDaysDraft}
            />
          </div>

          <div style={{ display: activeTab === "analytics" ? "block" : "none" }}>
            <AnalyticsTab settings={settings} products={products} />
          </div>
        </fetcher.Form>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
