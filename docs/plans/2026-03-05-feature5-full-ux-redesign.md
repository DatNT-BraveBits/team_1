# Feature 5 Live Shopping - Full UX/UI Redesign

**Date**: 2026-03-05
**Scope**: Full page redesign of all Feature 5 pages
**Approach**: Approach C - Full Redesign (rethink information architecture + strict Polaris compliance)

## Goals

1. Replace all inline styles and native HTML elements with Polaris web components
2. Replace hardcoded colors with Polaris design tokens
3. Restructure page layouts to follow Shopify app design guidelines
4. Add proper empty states, loading states, and UX patterns per "Built for Shopify" standards
5. Improve information architecture across all pages

## Reference

- Shopify App Design Guidelines: https://shopify.dev/docs/apps/design
- Layout patterns: https://shopify.dev/docs/apps/design/layout
- Navigation: https://shopify.dev/docs/apps/design/navigation
- Forms: https://shopify.dev/docs/apps/design/user-experience/forms
- Polaris Web Components: https://shopify.dev/docs/api/app-home/using-polaris-components

---

## Page 1: Dashboard (`app.feature-5._index.jsx`)

### Current Issues
- Stats use 3 separate `s-card` wrappers (noisy)
- Custom `SessionTable` component with manual `s-table` markup
- `s-link` used as primary action instead of `s-button`

### Redesign

**Layout**: `s-page inlineSize="large"` (full-width for resource list)

**Stats**: Single `s-section` with inline `s-stack` of key metrics. Cleaner, less visual noise.

**Resource list**: Replace custom `SessionTable` with a proper resource list pattern:
- Each row: status icon, title, status badge, product count, date
- Clickable rows navigating to session detail
- Sortable by date

**Empty state**: Follow Shopify empty state pattern:
- Centered icon
- Heading + description
- Primary CTA button
- No extra `s-card` wrapper

**Primary action**: `s-button variant="primary"` in page header slot (not `s-link`)

**Status filter**: Add tabs above the list (All / Active / Ended) within the section

---

## Page 2: Create Livestream (`app.feature-5.create.jsx`)

### Current Issues
- Product grid uses inline CSS `display: grid` with hardcoded gap/columns
- Native `<input type="checkbox">` with inline styles
- DOM manipulation in `onChange` for selection border styling
- Submit button in standalone section instead of page action

### Redesign

**Layout**: `s-page` default width with `backAction`

**Two-section form**:

1. **Stream Details** (`s-section`):
   - Title: `s-text-field` (keep as is)
   - Description: `s-text-field multiline` (new, optional)

2. **Product Selection** (`s-section`):
   - `s-grid columns="3"` with responsive product cards
   - Each card: `s-image` + title + price + `s-checkbox`
   - Selected state via CSS class using `--p-color-border-brand` token
   - Product count summary badge ("3 products selected")

**Submit**: Move to `s-page` primary action slot

---

## Page 3: Stream Management (`app.feature-5.$sessionId.jsx`)

### Current Issues
- `BrowserStream.jsx`: native `<button>` with hardcoded `#008060`, inline margin
- `s-card` nested inside `s-section` (redundant - section renders as card at top level)
- End stream action buried in bottom warning banner
- Single column layout doesn't use space efficiently

### Redesign

**Layout**: `s-page` default width with `aside` slot for status sidebar

**Page header**: Badge in title-metadata + "Preview" and "Share" in secondary-actions

**Main column**:

1. **Go Live** (`s-section`):
   - `s-button variant="primary"` with camera icon (replaces native button)
   - Description text explaining popup behavior

2. **Stream Configuration** (`s-section`):
   - Remove redundant `s-card` wrapper inside section
   - Keep `CopyField` pattern (already good)
   - Move info banner above section as page-level banner

3. **Products** (`s-section`):
   - Keep table layout
   - Add "currently pinned" highlight row style

**Aside sidebar**:
- Live status indicator (large badge)
- Quick stats: duration, products pinned
- End Stream `s-button tone="critical"` with confirmation

---

## Page 4: Live Viewer (`app.feature-5.live.$sessionId.jsx`)

### Current Issues
- Inline CSS grid `gridTemplateColumns: "1fr 360px"` with hardcoded gap
- Hardcoded `background: "#000"` for video area
- Inline `marginTop` throughout
- `div` wrappers everywhere instead of Polaris layout components

### Redesign

**Layout**: `s-page` with `aside` slot for chat sidebar

**Main content**:

1. **Video player**:
   - `s-box background="strong"` instead of hardcoded `#000`
   - Proper "Waiting for stream" empty state with Polaris pattern
   - Keep MuxPlayer (external component)

2. **Pinned product** (`s-section`):
   - Replace `div` with `s-section` wrapper
   - `s-stack` for proper spacing (no inline margins)

3. **Other products** (`s-section heading="Products"`):
   - `s-grid columns="2"` (already good)
   - Remove inline margins

**Aside (chat sidebar)**: `s-page` aside slot with fixed header

---

## Page 5: LiveChat Component (`components/LiveChat.jsx`)

### Current Issues
- 100% inline styles (flex, padding, colors, border-radius)
- Native `<input>` and `<form>` elements
- Hardcoded colors: `#e3f2fd`, `#f5f5f5`, `#666`, `#999`, `#ccc`

### Redesign - Full Rewrite

- **Message list**: `s-stack direction="block"` with `s-box` per message
  - Assistant messages: `s-box background="subdued"` + `s-text`
  - User messages: `s-box background="fill"` + `s-text` (aligned end)
- **Input**: `s-text-field` with connected `s-button variant="primary"` (Send)
- **Empty state**: `s-text tone="subdued"` centered
- **Loading**: Polaris loading indicator pattern
- **Layout**: `s-stack direction="block"` for overall structure, no inline styles

---

## Page 6: BrowserStream Component (`components/BrowserStream.jsx`)

### Current Issues
- Native `<button>` with hardcoded `background: "#008060"`, inline styles
- `div` wrapper with `marginTop`

### Redesign

- Replace native `<button>` with `<s-button variant="primary">` with camera icon
- Replace `div` wrapper with `s-stack direction="block" gap="base"`
- Keep the popup window behavior (necessary for camera access outside iframe)

---

## Files to Modify

1. `app/routes/app.feature-5._index.jsx` - Dashboard
2. `app/routes/app.feature-5.create.jsx` - Create page
3. `app/routes/app.feature-5.$sessionId.jsx` - Management page
4. `app/routes/app.feature-5.live.$sessionId.jsx` - Viewer page
5. `app/features/feature-5/components/LiveChat.jsx` - Chat component
6. `app/features/feature-5/components/BrowserStream.jsx` - Streaming component

## Files NOT Modified

- `app/routes/app.feature-5.chat.$sessionId.jsx` - API route, no UI
- `app/features/feature-5/utils/*.server.js` - Server utilities, no UI
- `app/features/feature-5/index.jsx` - Placeholder, not used by routes
