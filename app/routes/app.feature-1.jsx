import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

const SETTINGS_NAMESPACE = "app_ai";
const SETTINGS_KEY = "feature_1_settings";
const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_UPLOAD_SIZE_LABEL = "2 MB";

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
  },
};

const POSITION_OPTIONS = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const UI = {
  shell: {
    display: "grid",
    gap: 16,
  },
  sectionCard: {
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
    background: "#FFFFFF",
  },
  cardBody: {
    padding: 22,
  },
  fieldGrid: {
    display: "grid",
    gap: 18,
  },
  actionBar: {
    position: "sticky",
    top: 10,
    zIndex: 10,
    display: "grid",
    gap: 10,
    border: "1px solid #BFDBFE",
    borderRadius: 14,
    background: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)",
    padding: "10px 12px",
    boxShadow: "0 6px 14px rgba(15, 23, 42, 0.08)",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  actionTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },
  actionHint: {
    margin: 0,
    fontSize: 12,
    color: "#6B7280",
  },
  detailsSummary: {
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#1E293B",
    listStyle: "none",
  },
  groupCard: {
    display: "grid",
    gap: 14,
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: 16,
    background: "#FFFFFF",
  },
  groupTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
  },
  helpText: {
    margin: 0,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 1.5,
  },
  twoCols: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    columnGap: 28,
    rowGap: 16,
  },
  badgeCols: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 16,
  },
  threeCols: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    columnGap: 24,
    rowGap: 16,
  },
  fileInput: {
    width: "100%",
    border: "1px dashed #CBD5E1",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#FFFFFF",
  },
  toggleRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  label: {
    display: "grid",
    gap: 8,
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  input: {
    width: "100%",
    border: "1px solid #D1D5DB",
    borderRadius: 10,
    minHeight: 40,
    padding: "8px 10px",
    fontSize: 14,
    background: "#FFFFFF",
    color: "#111827",
  },
  textarea: {
    width: "100%",
    border: "1px solid #D1D5DB",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    background: "#FFFFFF",
    color: "#111827",
    resize: "vertical",
  },
  checkboxRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    fontSize: 15,
    color: "#111827",
  },
  blockTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
  },
  blockDesc: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.5,
  },
  deleteButton: {
    minHeight: 36,
    border: "1px solid #FCA5A5",
    borderRadius: 9,
    background: "#FEF2F2",
    color: "#B91C1C",
    padding: "8px 12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  pageWide: {
    width: "100%",
    maxWidth: 1320,
    margin: "0 auto",
    padding: "0 12px 24px",
  },
  workspaceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 20,
    alignItems: "start",
  },
  mainCol: {
    display: "grid",
    gap: 16,
  },
  sideCol: {
    display: "grid",
    gap: 12,
  },
  sideSticky: {
    position: "static",
    display: "grid",
    gap: 12,
    alignSelf: "start",
  },
  heroCard: {
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: 16,
    background: "#FFFFFF",
  },
  badgePanel: {
    display: "grid",
    gap: 12,
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    background: "#F8FAFC",
    padding: 16,
  },
};

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
  if (typeof next.top === "number") {
    next.top += shiftPx;
    return next;
  }
  if (typeof next.bottom === "number") {
    next.bottom += shiftPx;
    return next;
  }
  return { ...next, marginTop: shiftPx };
}

function BadgePreview({ settings }) {
  const previewEndAt =
    settings.countdownBadge?.timeMode === "per_product"
      ? Object.values(settings.countdownBadge?.perProductEndAt || {}).find(Boolean) || ""
      : settings.countdownBadge?.endAt || "";
  const countdownEndTime = previewEndAt ? new Date(previewEndAt).getTime() : NaN;
  const countdownSeconds = Number.isNaN(countdownEndTime)
    ? 0
    : Math.max(0, Math.floor((countdownEndTime - Date.now()) / 1000));
  const previewTimer = `${String(Math.floor(countdownSeconds / 3600)).padStart(2, "0")}:${String(
    Math.floor((countdownSeconds % 3600) / 60),
  ).padStart(2, "0")}:${String(countdownSeconds % 60).padStart(2, "0")}`;
  const badgesSharePosition =
    settings.textBadge?.enabled &&
    settings.countdownBadge?.enabled &&
    settings.textBadge?.position === settings.countdownBadge?.position;
  const countdownPositionStyle = badgesSharePosition
    ? getShiftedPreviewPosition(
        settings.countdownBadge?.position || "top-right",
        (settings.textBadge?.badgeHeight ?? 28) + 10,
      )
    : getPositionStyle(settings.countdownBadge?.position || "top-right");

  return (
    <div
      style={{
        minHeight: 250,
        borderRadius: 14,
        border: "1px dashed #BFDBFE",
        background: "linear-gradient(160deg, #F8FBFF 0%, #FFFFFF 100%)",
        padding: 14,
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <p style={{ margin: 0, color: "#1E3A8A", fontWeight: 700 }}>
          Product card preview
        </p>
        <p style={{ margin: "6px 0 0", color: "#334155", fontSize: 13 }}>
          Text badge + countdown badge preview
        </p>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          height: 170,
          margin: "12px auto 0",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid #DBEAFE",
          background:
            "linear-gradient(180deg, rgba(224,242,254,0.7) 0%, rgba(255,255,255,1) 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(148,163,184,.22) 0%, rgba(226,232,240,.5) 55%, rgba(241,245,249,.8) 100%)",
          }}
        />

        {settings.textBadge?.enabled ? (
          <span
            style={{
              position: "absolute",
              ...getPositionStyle(settings.textBadge.position),
              zIndex: 2,
              height: settings.textBadge?.badgeHeight ?? 28,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: settings.textBadge?.borderRadius ?? 999,
              padding: `${settings.textBadge?.paddingY ?? 4}px ${settings.textBadge?.paddingX ?? 10}px`,
              fontSize: settings.textBadge?.fontSize ?? 12,
              backgroundColor: settings.textBadge?.backgroundColor || "#0F766E",
              backgroundImage: settings.textBadge?.backgroundImageUrl
                ? `url(${settings.textBadge.backgroundImageUrl})`
                : "none",
              backgroundSize: settings.textBadge?.backgroundSize || "cover",
              backgroundPosition: settings.textBadge?.backgroundPosition || "center",
              color: settings.textBadge?.textColor || "#FFFFFF",
              fontWeight: 700,
              whiteSpace: "nowrap",
              lineHeight: 1.1,
            }}
          >
            {settings.textBadge.label}
          </span>
        ) : null}

        {settings.countdownBadge?.enabled ? (
          <span
            style={{
              position: "absolute",
              ...countdownPositionStyle,
              zIndex: 2,
              height: settings.countdownBadge?.badgeHeight ?? 28,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: settings.countdownBadge?.borderRadius ?? 999,
              padding: `${settings.countdownBadge?.paddingY ?? 4}px ${settings.countdownBadge?.paddingX ?? 10}px`,
              fontSize: settings.countdownBadge?.fontSize ?? 12,
              backgroundColor: settings.countdownBadge?.backgroundColor || "#7C3AED",
              backgroundImage: settings.countdownBadge?.backgroundImageUrl
                ? `url(${settings.countdownBadge.backgroundImageUrl})`
                : "none",
              backgroundSize: settings.countdownBadge?.backgroundSize || "cover",
              backgroundPosition: settings.countdownBadge?.backgroundPosition || "center",
              color: settings.countdownBadge?.textColor || "#FFFFFF",
              fontWeight: 700,
              whiteSpace: "nowrap",
              lineHeight: 1.1,
            }}
          >
            {settings.countdownBadge.prefix || "Ends in"} {previewTimer}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SettingField({ label, children }) {
  return (
    <label style={UI.label}>
      {label}
      {children}
    </label>
  );
}

function ProductSelectionList({
  products,
  inputName,
  selectedHandles,
  controlled = false,
  onToggle,
  keyPrefix = "",
}) {
  return (
    <div
      style={{
        maxHeight: 220,
        overflow: "auto",
        border: "1px solid #D1D5DB",
        borderRadius: 10,
        padding: 10,
        background: "#fff",
        display: "grid",
        gap: 8,
      }}
    >
      {products.length === 0 ? (
        <p style={{ margin: 0, color: "#64748B", fontSize: 13 }}>No products found.</p>
      ) : (
        products.map((product) => (
          <label key={`${keyPrefix}${product.id}`} style={UI.checkboxRow}>
            <input
              type="checkbox"
              name={inputName}
              value={product.handle}
              {...(controlled
                ? {
                    checked: selectedHandles.includes(product.handle),
                    onChange: (event) => onToggle?.(product.handle, event.target.checked),
                  }
                : {
                    defaultChecked: selectedHandles.includes(product.handle),
                  })}
            />
            <span style={{ display: "grid", gap: 2 }}>
              <span>{product.title}</span>
              <span style={{ fontSize: 12, color: "#64748B" }}>/products/{product.handle}</span>
            </span>
          </label>
        ))
      )}
    </div>
  );
}

function BadgeStyleFields({ fieldPrefix, badge }) {
  return (
    <details style={UI.groupCard}>
      <summary style={UI.detailsSummary}>Advanced style</summary>
      <div style={UI.twoCols}>
        <SettingField label="Border radius">
          <input
            style={UI.input}
            type="number"
            name={`${fieldPrefix}_radius`}
            min="0"
            defaultValue={badge?.borderRadius ?? 999}
          />
        </SettingField>
        <SettingField label="Badge height">
          <input
            style={UI.input}
            type="number"
            name={`${fieldPrefix}_height`}
            min="18"
            max="100"
            defaultValue={badge?.badgeHeight ?? 28}
          />
        </SettingField>
      </div>
      <div style={UI.twoCols}>
        <SettingField label="Font size">
          <input
            style={UI.input}
            type="number"
            name={`${fieldPrefix}_font_size`}
            min="10"
            max="28"
            defaultValue={badge?.fontSize ?? 12}
          />
        </SettingField>
        <SettingField label="Text color">
          <input
            style={{ ...UI.input, padding: 4 }}
            type="color"
            name={`${fieldPrefix}_text_color`}
            defaultValue={badge?.textColor || "#FFFFFF"}
          />
        </SettingField>
      </div>
      <div style={UI.twoCols}>
        <SettingField label="Horizontal padding">
          <input
            style={UI.input}
            type="number"
            name={`${fieldPrefix}_padding_x`}
            min="0"
            defaultValue={badge?.paddingX ?? 10}
          />
        </SettingField>
        <SettingField label="Vertical padding">
          <input
            style={UI.input}
            type="number"
            name={`${fieldPrefix}_padding_y`}
            min="0"
            defaultValue={badge?.paddingY ?? 4}
          />
        </SettingField>
      </div>
    </details>
  );
}

function BadgeBackgroundFields({ fieldPrefix, badge, defaultColor, labelPrefix }) {
  return (
    <details style={UI.groupCard}>
      <summary style={UI.detailsSummary}>Background ({labelPrefix})</summary>
      <div style={UI.twoCols}>
        <SettingField label="Background color">
          <input
            style={{ ...UI.input, padding: 4 }}
            type="color"
            name={`${fieldPrefix}_background_color`}
            defaultValue={badge?.backgroundColor || defaultColor}
          />
        </SettingField>
        <SettingField label="Background size">
          <select
            name={`${fieldPrefix}_background_size`}
            style={UI.input}
            defaultValue={badge?.backgroundSize || "cover"}
          >
            <option value="cover">cover</option>
            <option value="contain">contain</option>
            <option value="auto">auto</option>
          </select>
        </SettingField>
        <SettingField label="Background position">
          <select
            name={`${fieldPrefix}_background_position`}
            style={UI.input}
            defaultValue={badge?.backgroundPosition || "center"}
          >
            <option value="center">center</option>
            <option value="top">top</option>
            <option value="bottom">bottom</option>
            <option value="left">left</option>
            <option value="right">right</option>
          </select>
        </SettingField>
      </div>
      <SettingField label={`${labelPrefix} background image URL`}>
        <input
          type="url"
          name={`${fieldPrefix}_background_image_url`}
          style={UI.input}
          placeholder="https://..."
          defaultValue={badge?.backgroundImageUrl || ""}
        />
      </SettingField>
      <SettingField label={`Upload ${labelPrefix} background (max ${MAX_UPLOAD_SIZE_LABEL})`}>
        <input
          style={UI.fileInput}
          type="file"
          name={`${fieldPrefix}_background_image_file`}
          accept="image/*"
        />
      </SettingField>
      <label style={UI.checkboxRow}>
        <input name={`remove_${fieldPrefix}_background_image`} type="checkbox" />
        Remove {labelPrefix} background image
      </label>
    </details>
  );
}

function safeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeHandle(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/^products\//, "");
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

async function resolveBackgroundImage({
  formData,
  urlField,
  fileField,
  removeField,
  existingValue,
}) {
  if (formData.get(removeField) === "on") return "";

  const uploaded = formData.get(fileField);
  const uploadedDataUrl = await fileToDataUrl(uploaded);
  if (uploadedDataUrl) return uploadedDataUrl;

  const explicitUrl = String(formData.get(urlField) || "").trim();
  if (explicitUrl) return explicitUrl;

  return existingValue || "";
}

function mergeSettings(rawValue) {
  try {
    const parsed = JSON.parse(rawValue ?? "{}");
    const trustRaw = parsed?.trustBadges ?? {};
    const hasTextBadge = typeof trustRaw?.textBadge === "object" && trustRaw?.textBadge;
    const hasCountdownBadge =
      typeof trustRaw?.countdownBadge === "object" && trustRaw?.countdownBadge;

    return {
      trustBadges: {
        ...DEFAULT_SETTINGS.trustBadges,
        ...trustRaw,
        textBadge: {
          ...DEFAULT_SETTINGS.trustBadges.textBadge,
          ...(hasTextBadge
            ? trustRaw.textBadge
            : {
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
              }),
          borderRadius: safeNumber(
            hasTextBadge
              ? trustRaw.textBadge?.borderRadius ?? trustRaw.borderRadius ?? 999
              : (trustRaw.borderRadius ?? 999),
            999,
          ),
          badgeHeight: safeNumber(
            hasTextBadge
              ? trustRaw.textBadge?.badgeHeight ?? trustRaw.badgeHeight ?? 28
              : (trustRaw.badgeHeight ?? 28),
            28,
          ),
          fontSize: safeNumber(
            hasTextBadge
              ? trustRaw.textBadge?.fontSize ?? trustRaw.fontSize ?? 12
              : (trustRaw.fontSize ?? 12),
            12,
          ),
          paddingX: safeNumber(
            hasTextBadge
              ? trustRaw.textBadge?.paddingX ?? trustRaw.paddingX ?? 10
              : (trustRaw.paddingX ?? 10),
            10,
          ),
          paddingY: safeNumber(
            hasTextBadge
              ? trustRaw.textBadge?.paddingY ?? trustRaw.paddingY ?? 4
              : (trustRaw.paddingY ?? 4),
            4,
          ),
          textColor: String(
            hasTextBadge
              ? trustRaw.textBadge?.textColor ?? trustRaw.textColor ?? "#FFFFFF"
              : (trustRaw.textColor ?? "#FFFFFF"),
          ),
          backgroundColor: String(
            hasTextBadge
              ? trustRaw.textBadge?.backgroundColor ?? trustRaw.newBackground ?? "#0F766E"
              : (trustRaw.newBackground ?? "#0F766E"),
          ),
          backgroundImageUrl: String(
            hasTextBadge
              ? trustRaw.textBadge?.backgroundImageUrl ?? trustRaw.newBackgroundImageUrl ?? ""
              : (trustRaw.newBackgroundImageUrl ?? ""),
          ),
          backgroundSize: String(
            hasTextBadge
              ? trustRaw.textBadge?.backgroundSize ?? trustRaw.backgroundSize ?? "cover"
              : (trustRaw.backgroundSize ?? "cover"),
          ),
          backgroundPosition: String(
            hasTextBadge
              ? trustRaw.textBadge?.backgroundPosition ??
                  trustRaw.backgroundPosition ??
                  "center"
              : (trustRaw.backgroundPosition ?? "center"),
          ),
        },
        countdownBadge: {
          ...DEFAULT_SETTINGS.trustBadges.countdownBadge,
          ...(hasCountdownBadge
            ? trustRaw.countdownBadge
            : {
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
              }),
          timeMode:
            String(
              hasCountdownBadge
                ? trustRaw.countdownBadge?.timeMode
                : trustRaw.countdownTimeMode,
            ).toLowerCase() === "per_product"
              ? "per_product"
              : "global",
          perProductEndAt:
            hasCountdownBadge &&
            trustRaw.countdownBadge?.perProductEndAt &&
            typeof trustRaw.countdownBadge.perProductEndAt === "object"
              ? trustRaw.countdownBadge.perProductEndAt
              : {},
          borderRadius: safeNumber(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.borderRadius ?? trustRaw.borderRadius ?? 999
              : (trustRaw.borderRadius ?? 999),
            999,
          ),
          badgeHeight: safeNumber(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.badgeHeight ?? trustRaw.badgeHeight ?? 28
              : (trustRaw.badgeHeight ?? 28),
            28,
          ),
          fontSize: safeNumber(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.fontSize ?? trustRaw.fontSize ?? 12
              : (trustRaw.fontSize ?? 12),
            12,
          ),
          paddingX: safeNumber(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.paddingX ?? trustRaw.paddingX ?? 10
              : (trustRaw.paddingX ?? 10),
            10,
          ),
          paddingY: safeNumber(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.paddingY ?? trustRaw.paddingY ?? 4
              : (trustRaw.paddingY ?? 4),
            4,
          ),
          textColor: String(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.textColor ?? trustRaw.textColor ?? "#FFFFFF"
              : (trustRaw.textColor ?? "#FFFFFF"),
          ),
          backgroundColor: String(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.backgroundColor ??
                  trustRaw.newBackground ??
                  "#7C3AED"
              : (trustRaw.newBackground ?? "#7C3AED"),
          ),
          backgroundImageUrl: String(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.backgroundImageUrl ??
                  trustRaw.newBackgroundImageUrl ??
                  ""
              : (trustRaw.newBackgroundImageUrl ?? ""),
          ),
          backgroundSize: String(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.backgroundSize ??
                  trustRaw.backgroundSize ??
                  "cover"
              : (trustRaw.backgroundSize ?? "cover"),
          ),
          backgroundPosition: String(
            hasCountdownBadge
              ? trustRaw.countdownBadge?.backgroundPosition ??
                  trustRaw.backgroundPosition ??
                  "center"
              : (trustRaw.backgroundPosition ?? "center"),
          ),
        },
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function readSettings(admin) {
  const response = await admin.graphql(
    `#graphql
      query FeatureOneSettings {
        currentAppInstallation {
          id
          metafield(namespace: "${SETTINGS_NAMESPACE}", key: "${SETTINGS_KEY}") {
            value
          }
        }
        shop {
          metafield(namespace: "${SETTINGS_NAMESPACE}", key: "${SETTINGS_KEY}") {
            value
          }
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
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `,
  );

  const json = await response.json();
  const edges = json?.data?.products?.edges ?? [];
  return edges
    .map((edge) => edge?.node)
    .filter((node) => node?.handle)
    .map((node) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
    }));
}

async function writeSettings(admin, appInstallationId, settings) {
  const response = await admin.graphql(
    `#graphql
      mutation SaveFeatureOneSettings($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            namespace: SETTINGS_NAMESPACE,
            key: SETTINGS_KEY,
            ownerId: appInstallationId,
            type: "json",
            value: JSON.stringify(settings),
          },
        ],
      },
    },
  );

  const json = await response.json();
  const errors = json?.data?.metafieldsSet?.userErrors ?? [];
  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }
}

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const { settings } = await readSettings(admin);
  const products = await readProducts(admin);

  return Response.json({
    settings,
    products,
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const { appInstallationId, settings } = await readSettings(admin);

  if (!appInstallationId) {
    return Response.json(
      { ok: false, error: "Could not resolve app installation id." },
      { status: 500 },
    );
  }

  try {
    if (intent === "save_badges") {
      const textBackgroundImageUrl = await resolveBackgroundImage({
        formData,
        urlField: "text_badge_background_image_url",
        fileField: "text_badge_background_image_file",
        removeField: "remove_text_badge_background_image",
        existingValue: settings.trustBadges.textBadge?.backgroundImageUrl,
      });
      const countdownBackgroundImageUrl = await resolveBackgroundImage({
        formData,
        urlField: "countdown_badge_background_image_url",
        fileField: "countdown_badge_background_image_file",
        removeField: "remove_countdown_badge_background_image",
        existingValue: settings.trustBadges.countdownBadge?.backgroundImageUrl,
      });
      const countdownSelectedHandles = formData
        .getAll("countdown_selected_product_handles")
        .map((item) => normalizeHandle(item))
        .filter(Boolean);
      const countdownPerProductEndAt = {};
      for (const [key, rawValue] of formData.entries()) {
        if (!String(key).startsWith("countdown_badge_product_end_at__")) continue;
        const handle = normalizeHandle(
          String(key).replace("countdown_badge_product_end_at__", ""),
        );
        const value = String(rawValue || "").trim();
        if (handle && value) countdownPerProductEndAt[handle] = value;
      }

      const nextSettings = {
        ...settings,
        trustBadges: {
          ...settings.trustBadges,
          enabled: formData.get("badge_enabled") === "on",
          textBadge: {
            ...settings.trustBadges.textBadge,
            enabled: formData.get("text_badge_enabled") === "on",
            label: String(
              formData.get("text_badge_label") ||
                settings.trustBadges.textBadge?.label ||
                "New",
            ).trim(),
            position: String(
              formData.get("text_badge_position") ||
                settings.trustBadges.textBadge?.position ||
                "top-left",
            ).toLowerCase(),
            productTargetMode:
              String(formData.get("text_product_target_mode") || "all").toLowerCase() ===
              "selected"
                ? "selected"
                : "all",
            selectedProductHandles: formData
              .getAll("text_selected_product_handles")
              .map((item) => normalizeHandle(item))
              .filter(Boolean),
            borderRadius: safeNumber(
              formData.get("text_badge_radius"),
              settings.trustBadges.textBadge?.borderRadius ?? 999,
            ),
            badgeHeight: safeNumber(
              formData.get("text_badge_height"),
              settings.trustBadges.textBadge?.badgeHeight ?? 28,
            ),
            fontSize: safeNumber(
              formData.get("text_badge_font_size"),
              settings.trustBadges.textBadge?.fontSize ?? 12,
            ),
            paddingX: safeNumber(
              formData.get("text_badge_padding_x"),
              settings.trustBadges.textBadge?.paddingX ?? 10,
            ),
            paddingY: safeNumber(
              formData.get("text_badge_padding_y"),
              settings.trustBadges.textBadge?.paddingY ?? 4,
            ),
            textColor: String(
              formData.get("text_badge_text_color") ||
                settings.trustBadges.textBadge?.textColor ||
                "#FFFFFF",
            ),
            backgroundColor: String(
              formData.get("text_badge_background_color") ||
                settings.trustBadges.textBadge?.backgroundColor ||
                "#0F766E",
            ),
            backgroundImageUrl: textBackgroundImageUrl,
            backgroundSize: String(
              formData.get("text_badge_background_size") ||
                settings.trustBadges.textBadge?.backgroundSize ||
                "cover",
            ),
            backgroundPosition: String(
              formData.get("text_badge_background_position") ||
                settings.trustBadges.textBadge?.backgroundPosition ||
                "center",
            ),
          },
          countdownBadge: {
            ...settings.trustBadges.countdownBadge,
            enabled: formData.get("countdown_badge_enabled") === "on",
            prefix: String(
              formData.get("countdown_badge_prefix") ||
                settings.trustBadges.countdownBadge?.prefix ||
                "Ends in",
            ).trim(),
            endAt: String(
              formData.get("countdown_badge_end_at") ||
                settings.trustBadges.countdownBadge?.endAt ||
                "",
            ).trim(),
            timeMode:
              String(formData.get("countdown_badge_time_mode") || "global").toLowerCase() ===
              "per_product"
                ? "per_product"
                : "global",
            position: String(
              formData.get("countdown_badge_position") ||
                settings.trustBadges.countdownBadge?.position ||
                "top-right",
            ).toLowerCase(),
            productTargetMode:
              String(formData.get("countdown_product_target_mode") || "all").toLowerCase() ===
              "selected"
                ? "selected"
                : "all",
            selectedProductHandles: countdownSelectedHandles,
            perProductEndAt: countdownPerProductEndAt,
            borderRadius: safeNumber(
              formData.get("countdown_badge_radius"),
              settings.trustBadges.countdownBadge?.borderRadius ?? 999,
            ),
            badgeHeight: safeNumber(
              formData.get("countdown_badge_height"),
              settings.trustBadges.countdownBadge?.badgeHeight ?? 28,
            ),
            fontSize: safeNumber(
              formData.get("countdown_badge_font_size"),
              settings.trustBadges.countdownBadge?.fontSize ?? 12,
            ),
            paddingX: safeNumber(
              formData.get("countdown_badge_padding_x"),
              settings.trustBadges.countdownBadge?.paddingX ?? 10,
            ),
            paddingY: safeNumber(
              formData.get("countdown_badge_padding_y"),
              settings.trustBadges.countdownBadge?.paddingY ?? 4,
            ),
            textColor: String(
              formData.get("countdown_badge_text_color") ||
                settings.trustBadges.countdownBadge?.textColor ||
                "#FFFFFF",
            ),
            backgroundColor: String(
              formData.get("countdown_badge_background_color") ||
                settings.trustBadges.countdownBadge?.backgroundColor ||
                "#7C3AED",
            ),
            backgroundImageUrl: countdownBackgroundImageUrl,
            backgroundSize: String(
              formData.get("countdown_badge_background_size") ||
                settings.trustBadges.countdownBadge?.backgroundSize ||
                "cover",
            ),
            backgroundPosition: String(
              formData.get("countdown_badge_background_position") ||
                settings.trustBadges.countdownBadge?.backgroundPosition ||
                "center",
            ),
          },
        },
      };

      await writeSettings(admin, appInstallationId, nextSettings);
      return Response.json({
        ok: true,
        message: "Trust badge settings saved.",
        settings: nextSettings,
      });
    }

    return Response.json({ ok: false, error: "Unknown intent." }, { status: 400 });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error.",
      },
      { status: 500 },
    );
  }
};

export default function Feature1Route() {
  const { settings: loaderSettings, products } = useLoaderData();
  const fetcher = useFetcher();
  const [settings, setSettings] = useState(loaderSettings);
  const [textTargetModeDraft, setTextTargetModeDraft] = useState(
    loaderSettings.trustBadges.textBadge?.productTargetMode === "selected" ? "selected" : "all",
  );
  const [countdownTargetModeDraft, setCountdownTargetModeDraft] = useState(
    loaderSettings.trustBadges.countdownBadge?.productTargetMode === "selected"
      ? "selected"
      : "all",
  );
  const [countdownSelectedHandlesDraft, setCountdownSelectedHandlesDraft] = useState(
    loaderSettings.trustBadges.countdownBadge?.selectedProductHandles || [],
  );
  const [countdownTimeModeDraft, setCountdownTimeModeDraft] = useState(
    loaderSettings.trustBadges.countdownBadge?.timeMode === "per_product"
      ? "per_product"
      : "global",
  );
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.ok && fetcher.data.settings) {
      setSettings(fetcher.data.settings);
      setTextTargetModeDraft(
        fetcher.data.settings.trustBadges.textBadge?.productTargetMode === "selected"
          ? "selected"
          : "all",
      );
      setCountdownTargetModeDraft(
        fetcher.data.settings.trustBadges.countdownBadge?.productTargetMode ===
          "selected"
          ? "selected"
          : "all",
      );
      setCountdownSelectedHandlesDraft(
        fetcher.data.settings.trustBadges.countdownBadge?.selectedProductHandles || [],
      );
      setCountdownTimeModeDraft(
        fetcher.data.settings.trustBadges.countdownBadge?.timeMode === "per_product"
          ? "per_product"
          : "global",
      );
      setNotice(fetcher.data.message || "Saved.");
      setError("");
      return;
    }
    if (!fetcher.data.ok) {
      setError(fetcher.data.error || "Failed to save.");
      setNotice("");
    }
  }, [fetcher.data]);

  const isSaving = fetcher.state !== "idle";
  const countdownPreviewHandles =
    countdownTargetModeDraft === "selected"
      ? countdownSelectedHandlesDraft
      : products.map((product) => product.handle);

  return (
    <s-page heading="Feature 1 - Trust Badge">
      {notice ? (
        <s-banner tone="success">{notice}</s-banner>
      ) : error ? (
        <s-banner tone="critical">{error}</s-banner>
      ) : null}

      <div style={UI.pageWide}>
        <fetcher.Form method="post" encType="multipart/form-data">
          <input type="hidden" name="intent" value="save_badges" />
          <div style={UI.fieldGrid}>
            <div style={UI.heroCard}>
              <p style={UI.blockTitle}>Trust Badge Settings</p>
              <p style={UI.blockDesc}>
                Configure visibility, targeting, style, and background for Text Badge and
                Countdown Badge.
              </p>
            </div>

            <div style={UI.actionBar}>
              <div>
                <p style={UI.actionTitle}>Primary action</p>
                <p style={UI.actionHint}>Save all updates after reviewing preview.</p>
              </div>
              <div style={{ justifySelf: "end" }}>
                <s-button
                  variant="primary"
                  type="submit"
                  loading={isSaving}
                  disabled={isSaving}
                >
                  Save settings
                </s-button>
              </div>
            </div>

            <div style={UI.groupCard}>
              <p style={UI.groupTitle}>Visibility</p>
              <label style={UI.checkboxRow}>
                <input
                  name="badge_enabled"
                  type="checkbox"
                  defaultChecked={settings.trustBadges.enabled}
                />
                Enable badge injection on product cards
              </label>
            </div>

            <div style={UI.badgePanel}>
              <div style={UI.groupCard}>
                <p style={UI.groupTitle}>Text Badge</p>
                <label style={UI.checkboxRow}>
                  <input
                    name="text_badge_enabled"
                    type="checkbox"
                    defaultChecked={settings.trustBadges.textBadge?.enabled}
                  />
                  Enable normal text badge
                </label>
                <SettingField label="Badge label">
                  <input
                    style={UI.input}
                    name="text_badge_label"
                    defaultValue={settings.trustBadges.textBadge?.label || "New"}
                  />
                </SettingField>
                <SettingField label="Badge position">
                  <select
                    style={UI.input}
                    name="text_badge_position"
                    defaultValue={settings.trustBadges.textBadge?.position || "top-left"}
                  >
                    {POSITION_OPTIONS.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </SettingField>
                <div style={UI.groupCard}>
                  <p style={{ ...UI.groupTitle, fontSize: 14 }}>Targets</p>
                  <div style={UI.twoCols}>
                    <label style={UI.checkboxRow}>
                      <input
                        type="radio"
                        name="text_product_target_mode"
                        value="all"
                        checked={textTargetModeDraft !== "selected"}
                        onChange={() => setTextTargetModeDraft("all")}
                      />
                      All products
                    </label>
                    <label style={UI.checkboxRow}>
                      <input
                        type="radio"
                        name="text_product_target_mode"
                        value="selected"
                        checked={textTargetModeDraft === "selected"}
                        onChange={() => setTextTargetModeDraft("selected")}
                      />
                      Only selected products
                    </label>
                  </div>
                  {textTargetModeDraft === "selected" ? (
                    <ProductSelectionList
                      products={products}
                      inputName="text_selected_product_handles"
                      selectedHandles={settings.trustBadges.textBadge?.selectedProductHandles || []}
                    />
                  ) : null}
                </div>
                <BadgeStyleFields fieldPrefix="text_badge" badge={settings.trustBadges.textBadge} />
                <BadgeBackgroundFields
                  fieldPrefix="text_badge"
                  badge={settings.trustBadges.textBadge}
                  defaultColor="#0F766E"
                  labelPrefix="text badge"
                />
              </div>
            </div>

            <div style={UI.badgePanel}>
              <div style={UI.groupCard}>
                <p style={UI.groupTitle}>Countdown Badge (Flash Sale)</p>
                <label style={UI.checkboxRow}>
                  <input
                    name="countdown_badge_enabled"
                    type="checkbox"
                    defaultChecked={settings.trustBadges.countdownBadge?.enabled}
                  />
                  Enable countdown badge
                </label>
                <div style={UI.twoCols}>
                  <SettingField label="Countdown prefix">
                    <input
                      style={UI.input}
                      name="countdown_badge_prefix"
                      defaultValue={settings.trustBadges.countdownBadge?.prefix || "Ends in"}
                      placeholder="Ends in"
                    />
                  </SettingField>
                  <SettingField label="Countdown end time">
                    <input
                      style={UI.input}
                      type="datetime-local"
                      name="countdown_badge_end_at"
                      defaultValue={settings.trustBadges.countdownBadge?.endAt || ""}
                    />
                  </SettingField>
                </div>
                <div style={UI.groupCard}>
                  <p style={{ ...UI.groupTitle, fontSize: 14 }}>Time mode</p>
                  <div style={UI.twoCols}>
                    <label style={UI.checkboxRow}>
                      <input
                        type="radio"
                        name="countdown_badge_time_mode"
                        value="global"
                        checked={countdownTimeModeDraft !== "per_product"}
                        onChange={() => setCountdownTimeModeDraft("global")}
                      />
                      One global countdown time
                    </label>
                    <label style={UI.checkboxRow}>
                      <input
                        type="radio"
                        name="countdown_badge_time_mode"
                        value="per_product"
                        checked={countdownTimeModeDraft === "per_product"}
                        onChange={() => setCountdownTimeModeDraft("per_product")}
                      />
                      Per-product countdown time
                    </label>
                  </div>
                </div>
                <SettingField label="Badge position">
                  <select
                    style={UI.input}
                    name="countdown_badge_position"
                    defaultValue={settings.trustBadges.countdownBadge?.position || "top-right"}
                  >
                    {POSITION_OPTIONS.map((position) => (
                      <option key={`countdown-${position}`} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </SettingField>
                <div style={UI.groupCard}>
                  <p style={{ ...UI.groupTitle, fontSize: 14 }}>Targets</p>
                  <div style={UI.twoCols}>
                    <label style={UI.checkboxRow}>
                      <input
                        type="radio"
                        name="countdown_product_target_mode"
                        value="all"
                        checked={countdownTargetModeDraft !== "selected"}
                        onChange={() => setCountdownTargetModeDraft("all")}
                      />
                      All products
                    </label>
                    <label style={UI.checkboxRow}>
                      <input
                        type="radio"
                        name="countdown_product_target_mode"
                        value="selected"
                        checked={countdownTargetModeDraft === "selected"}
                        onChange={() => setCountdownTargetModeDraft("selected")}
                      />
                      Only selected products
                    </label>
                  </div>
                  {countdownTargetModeDraft === "selected" ? (
                    <ProductSelectionList
                      products={products}
                      inputName="countdown_selected_product_handles"
                      selectedHandles={countdownSelectedHandlesDraft}
                      controlled
                      keyPrefix="countdown-"
                      onToggle={(handle, checked) => {
                        setCountdownSelectedHandlesDraft((previous) => {
                          if (checked) {
                            return previous.includes(handle) ? previous : [...previous, handle];
                          }
                          return previous.filter((item) => item !== handle);
                        });
                      }}
                    />
                  ) : null}
                  {countdownTimeModeDraft === "per_product" ? (
                    <div style={UI.groupCard}>
                      <p style={{ ...UI.groupTitle, fontSize: 14 }}>Per-product countdown end time</p>
                      {countdownPreviewHandles.length === 0 ? (
                        <p style={{ margin: 0, color: "#64748B", fontSize: 13 }}>
                          Select products first to configure per-product times.
                        </p>
                      ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                          {countdownPreviewHandles.map((handle) => {
                            const product = products.find((item) => item.handle === handle);
                            return (
                              <label key={`per-time-${handle}`} style={UI.label}>
                                {product?.title || handle}
                                <input
                                  style={UI.input}
                                  type="datetime-local"
                                  name={`countdown_badge_product_end_at__${handle}`}
                                  defaultValue={
                                    settings.trustBadges.countdownBadge?.perProductEndAt?.[handle] || ""
                                  }
                                />
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <BadgeStyleFields
                  fieldPrefix="countdown_badge"
                  badge={settings.trustBadges.countdownBadge}
                />
                <BadgeBackgroundFields
                  fieldPrefix="countdown_badge"
                  badge={settings.trustBadges.countdownBadge}
                  defaultColor="#7C3AED"
                  labelPrefix="countdown badge"
                />
              </div>
            </div>

            <div style={UI.groupCard}>
              <p style={UI.groupTitle}>Live preview</p>
              <p style={UI.helpText}>See how text and countdown badge render on product card.</p>
              <BadgePreview settings={settings.trustBadges} />
            </div>
          </div>
        </fetcher.Form>
      </div>

    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
