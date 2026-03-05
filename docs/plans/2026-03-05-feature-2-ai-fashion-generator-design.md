# Feature 2: AI Fashion Generator

## Overview
Upload fabric texture images, select fashion options, and auto-generate model images wearing outfits made from the uploaded fabric using OpenAI gpt-image-1.

## UI Layout (2 columns)

**Left column — Input:**
- File picker for fabric texture image (with preview)
- 5 option groups (multi-select):
  - Garment type: Shirt, Dress, Pants, Jacket, Skirt
  - Style: Casual, Formal, Streetwear, Vintage, Minimalist
  - Gender: Male, Female, Unisex
  - Pose: Standing, Walking, Sitting
  - Background: Studio, Outdoor, Runway

**Right column — Output:**
- Generated image (or placeholder)
- Loading spinner during generation
- Download button

## Flow
1. User picks fabric image from local machine -> preview displayed
2. User selects options -> each change auto-triggers generation (if image exists)
3. Server receives base64 image + options -> builds prompt -> calls OpenAI gpt-image-1
4. Returns generated image to display on right side
5. User clicks Download to save image

## Tech Stack
- Frontend: `app/features/feature-2/index.jsx` + components
- API Route: `app/routes/app.feature-2.generate.jsx`
- AI: OpenAI `gpt-image-1` via `openai` provider from `ai.server.js`
- Upload: File picker + base64, no server storage
- Database: None (no history)

## File Structure
```
app/features/feature-2/
  index.jsx              # Main page, 2-column layout
  components/
    FabricUploader.jsx   # File picker + preview
    OptionSelector.jsx   # Option groups
    ResultDisplay.jsx    # Generated image + download
app/routes/
  app.feature-2.jsx              # Route wrapper (existing)
  app.feature-2.generate.jsx     # API endpoint for generation
```
