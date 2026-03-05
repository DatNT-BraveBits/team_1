# Feature 5 Polaris UI Overhaul — Design

**Goal:** Replace native HTML elements and inline styles with Polaris web components across all Feature 5 pages to follow Shopify app design practices.

## Pages to Update

### 1. Create Livestream (app.feature-5.create.jsx)
- Native `<input>` → `<s-text-field label="Title">` + onChange sync to hidden input
- Product grid: `<s-grid>` + `<s-card>` + `<s-thumbnail>` + `<s-checkbox>`
- Submit: `fetcher.submit()` with `<s-button variant="primary">`
- Remove all inline styles

### 2. Manage Session (app.feature-5.$sessionId.jsx)
- CopyField: `<s-text-field>` readonly
- Pin/Unpin: `<s-button>` / `<s-button variant="primary">`
- End Stream: `<s-button tone="critical">`
- Product images: `<s-thumbnail>`
- Layout: `<s-stack>` instead of inline flex
- BrowserStream: `<s-button variant="primary">`

### 3. Live Viewer (app.feature-5.live.$sessionId.jsx)
- Product cards: `<s-card>` + `<s-thumbnail>` + `<s-button>`
- Layout: Polaris layout components where possible

### 4. LiveChat component
- Input: `<s-text-field>` + `<s-button variant="primary">`
- Remove inline styles, use `<s-box>` and `<s-stack>`

## Known Constraint
`<s-text-field>` doesn't populate native FormData. Solution: use `onChange` to sync value to state, then submit via `fetcher.submit()` or hidden inputs.

## Not Changing
- streaming-studio.jsx (standalone, not in Shopify admin)
- app.feature-5._index.jsx (already uses Polaris well)
