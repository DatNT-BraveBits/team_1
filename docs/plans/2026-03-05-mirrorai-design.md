# MirrorAI: See It On Me - Feature 4 Design

## Overview
Virtual try-on feature for Shopify merchants. Customers upload photos, AI generates try-on images, and Smart Size Advisor recommends sizing.

Slogan: "Turn customers into models, turn bedrooms into runways."

## Modules (MVP)
- **A) Magic "See It On Me" Button** - Upload photo, trigger try-on
- **B) AI Virtual Fitting** - OpenAI image generation (swappable to Fal.ai later)
- **C) Smart Size Advisor** - Body measurements + mock size data = personalized advice

## Tech Stack
- OpenAI image gen (existing in project)
- Prisma SQLite for mock product/size data
- Shopify Polaris web components
- UI in English, demo script in Vietnamese

## File Structure
```
app/features/feature-4/
  index.jsx                  # Dashboard with product list
  components/
    TryOnModal.jsx           # Modal container
    PhotoUploader.jsx        # Upload + body info input
    TryOnResult.jsx          # Generated image display
    SizeAdvisor.jsx          # Size recommendation
    ProductPicker.jsx        # Product selection
  utils/
    tryon.server.js          # OpenAI image generation logic
    size-logic.server.js     # Size matching logic

app/routes/
  app.feature-4.jsx          # Dashboard route (existing)
  app.feature-4.tryon.jsx    # Try-on API endpoint
  app.feature-4.advisor.jsx  # Size advisor API endpoint

prisma/schema.prisma         # Feature4_ prefixed models
```

## DB Models
- Feature4_Product: Mock products with images
- Feature4_TryOnSession: Try-on history
- Feature4_SizeChart: Size data per product

## User Flow
1. Merchant opens Feature 4 dashboard
2. Sees mock product list
3. Clicks "See It On Me" on a product
4. Modal opens: upload photo + optional height/weight
5. AI generates try-on image
6. Size Advisor shows recommendation alongside result
7. Can try another or close

## Future (Post-hackathon)
- Fal.ai OOTDiffusion for better try-on quality
- Real product data from Shopify metafields
- Purchase history + similar product data for size recommendations
- UGC automation pipeline
