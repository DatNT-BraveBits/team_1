# Feature 5: Live Shopping UX/UI Overhaul Design

**Goal:** Redesign all Live Shopping admin pages to follow Shopify Polaris web component patterns, making the app look professional and production-ready.

**Scope:** 4 pages — Dashboard, Create, Manage, Viewer (light touch)

## Pages

### 1. Dashboard (app.feature-5._index.jsx)
- s-page heading "Live Shopping" + primary action "Create Livestream"
- Empty state when no sessions
- Session cards with s-thumbnail, s-badge status, title, date
- Stats row: total sessions, active, products (s-grid + s-box)
- Remove sidebar how-it-works

### 2. Create (app.feature-5.create.jsx)
- s-page + backAction
- Native input styled consistently (s-text-field doesn't work with Remix forms)
- Product grid with s-thumbnail + visual selected state
- Styled submit button

### 3. Manage (app.feature-5.$sessionId.jsx)
- s-page with s-badge status + backAction
- Browser streaming section (keep as-is)
- Stream config card with copy fields
- Products with s-thumbnail + s-badge Pinned + styled buttons
- Danger zone for End Stream

### 4. Viewer (app.feature-5.live.$sessionId.jsx)
- Light polish: consistent chat styling, s-thumbnail for products

## Constraints
- s-text-field doesn't sync with native FormData — use native inputs with Polaris-like styling
- s-button submit doesn't trigger native form submission — use native buttons styled to match
- Keep all existing functionality intact
