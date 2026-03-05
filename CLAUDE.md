# Shopify Mega App - Hackathon

## Architecture

This is a modular Shopify app where 5 team members work independently on separate features.

## Project Structure

```
app/features/feature-{1-5}/     # Each person's workspace
  ├── index.jsx                  # Main page component
  ├── components/                # Feature-specific UI components
  └── utils/                     # Feature-specific helpers
app/routes/app.feature-{1-5}.jsx # Thin route wrappers (don't edit often)
app/nav-config.js                # Navigation links (each person adds 1 line)
app/shared/                      # Shared utilities across features
prisma/schema.prisma             # DB models with Feature{N}_ prefix
```

## Rules to Avoid Merge Conflicts

1. **Work in your feature folder**: `app/features/feature-{N}/`
2. **Prisma models**: Add models under your section with `Feature{N}_` prefix
3. **New routes**: Name them `app.feature-{N}.yourpage.jsx`
4. **Nav config**: Only change your own entry in `app/nav-config.js`
5. **Don't touch** other people's feature folders or route files
6. **Shared code**: Discuss with team before adding to `app/shared/`

## Tech Stack

- React Router v7 (file-based routing)
- Shopify App Bridge + Polaris web components (`<s-page>`, `<s-card>`, etc.)
- Prisma ORM with SQLite
- Authentication via `authenticate.admin(request)` in loaders/actions

## Common Patterns

```jsx
// In your route loader/action:
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  // Use admin.graphql() for Shopify API calls
  // Use prisma for database queries
  return { data };
};
```
