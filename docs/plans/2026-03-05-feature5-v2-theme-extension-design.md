# Feature 5 v2: Theme Extension + Polish UI

## Overview

Add a Shopify theme app extension so customers can watch livestreams on the storefront, plus polish the admin UI.

## 1. Theme App Extension (App Block)

A Liquid app block that merchants drag into any page. Shows:
- Mux video player (HLS via vanilla JS)
- Pinned product highlight with Buy Now
- Product grid with Add to Cart buttons
- Auto-refresh pinned product every 10s

Block settings: merchant selects livestream session ID.

## 2. App Proxy API

Public endpoint for storefront to fetch livestream data:
- `GET /apps/live-shopping/session/:id` → JSON: playbackId, products, pinnedProduct, status
- No auth required (public customer-facing data)
- Served via Shopify App Proxy

## 3. Polish Admin UI

- Dashboard: live indicator, copy stream key, viewer link button
- Manage page: better layout, stream status display
- Create page: product selector with images

## Tech

- `shopify app generate extension` for theme extension scaffold
- Liquid + vanilla JS + CSS for storefront block (no React)
- App proxy route in React Router for API
- Mux HLS.js for storefront video playback
