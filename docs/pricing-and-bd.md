# MirrorAI - Pricing & Business Development Strategy

---

## 1. Pricing Plans

### Free Plan

| Attribute | Details |
|---|---|
| Price | $0/month |
| Try-Ons per Month | 50 |
| Products Enabled | Up to 10 |
| AI Model | gpt-4o-mini (standard quality) |
| Analytics | Basic (total try-ons, top products) |
| Support | Community / docs only |
| Branding | MirrorAI watermark on results |
| Target User | Small merchants testing virtual try-on, stores under $10K/month revenue |

**Goal:** Remove all friction to adoption. Let merchants see measurable impact on return rates before committing. The 50-try-on limit is enough for a merchant with ~500 monthly visitors to validate the feature over 2-4 weeks.

---

### Pro Plan - $29/month

| Attribute | Details |
|---|---|
| Price | $29/month |
| Try-Ons per Month | 2,000 |
| Products Enabled | Unlimited |
| AI Model | gpt-4o (high quality) |
| Analytics | Full dashboard (conversion lift, return rate impact, heatmaps) |
| Support | Email support, 48-hour response |
| Branding | No watermark, customizable UI |
| UGC Gallery | Customers can share try-on photos (social proof) |
| Target User | Growing merchants doing $10K-$100K/month, fashion-focused DTC brands |

**Competitive Comparison:**

| Aspect | MirrorAI Pro ($29) | Kiwi Sizing ($6.99-$49) | Virtusize ($299+) |
|---|---|---|---|
| Virtual try-on (photo) | Yes - AI-generated | No (sizing only) | Yes (silhouette-based) |
| Size recommendation | Planned Q3 | Yes (core feature) | Yes |
| UGC / social sharing | Yes | No | No |
| Setup time | < 5 minutes | 15-30 minutes | Days (manual integration) |
| AI quality | Photorealistic (GPT-image-1) | N/A | Basic overlay |
| Monthly cost at scale | $29 flat | $12.49-$49 | $299-$999 |

MirrorAI Pro sits in a gap: more capable than sizing-only tools like Kiwi, but far more affordable and easier to set up than enterprise solutions like Virtusize.

---

### Enterprise Plan - Custom Pricing

| Attribute | Details |
|---|---|
| Price | Custom (starting at $299/month) |
| Try-Ons per Month | Unlimited (volume-based pricing above 50K) |
| Products Enabled | Unlimited |
| AI Model | gpt-image-1 (highest fidelity) + custom fine-tuning |
| Analytics | Full dashboard + API access + data export |
| Support | Dedicated account manager, Slack channel, 4-hour SLA |
| Branding | Fully white-labeled |
| Integrations | Custom ERP, PIM, and returns management integrations |
| SLA | 99.9% uptime guarantee |
| Onboarding | Dedicated onboarding specialist, product photography guidance |
| Target User | Brands doing $1M+/month revenue, multi-brand retailers |

---

### Plan Comparison Table

| Feature | Free | Pro ($29/mo) | Enterprise (Custom) |
|---|:---:|:---:|:---:|
| Monthly try-ons | 50 | 2,000 | Unlimited |
| Products enabled | 10 | Unlimited | Unlimited |
| AI quality | Standard | High | Highest + custom |
| Analytics | Basic | Full | Full + API |
| UGC gallery | No | Yes | Yes |
| Custom branding | No | Yes | White-label |
| Support | Docs | Email (48h) | Dedicated (4h SLA) |
| API access | No | No | Yes |
| Uptime SLA | None | None | 99.9% |

---

## 2. Unit Economics

### Cost per Try-On Session

A single try-on session involves the following API calls:

| Step | Model Used | Input | Output | Cost per Call |
|---|---|---|---|---|
| Image analysis (body/pose detection) | gpt-4o-mini | ~800 tokens + 1 image (~85 tokens low-res) | ~200 tokens | ~$0.0002 |
| Garment mapping & prompt construction | gpt-4o | ~1,200 tokens | ~500 tokens | ~$0.006 |
| Image generation (try-on render) | gpt-image-1 | 1 prompt (~200 tokens) | 1 image (1024x1024) | ~$0.04 |
| **Total per try-on** | | | | **~$0.046** |

Rounding up for overhead (retries, edge cases, infrastructure): **$0.05 per try-on session.**

### Alternative: Optimized Pipeline (Pro Tier)

Using gpt-4o for analysis + gpt-image-1 for generation:

- Cost per try-on: ~$0.046
- Rounded with overhead: **$0.05**

### Alternative: Budget Pipeline (Free Tier)

Using gpt-4o-mini for analysis + gpt-image-1 for generation:

- Cost per try-on: ~$0.041
- Rounded with overhead: **$0.045**

### Break-Even Analysis

| Tier | Revenue/Month | Max Try-Ons | Max API Cost | Gross Margin |
|---|---|---|---|---|
| Free | $0 | 50 | $2.25 | -$2.25 (acquisition cost) |
| Pro | $29 | 2,000 | $100 | -$71 at max usage |
| Pro (avg usage) | $29 | ~600 (30% utilization) | $30 | -$1 (near break-even) |
| Enterprise ($299) | $299 | ~10,000 (typical) | $500 | -$201 at base price |
| Enterprise ($599) | $599 | ~10,000 | $500 | +$99 (17% margin) |

### Key Insight: Margin Challenge

At current OpenAI pricing, image generation is the dominant cost. The business model depends on:

1. **Usage-based pricing for Enterprise** - charge $0.08-$0.12 per try-on above included volume to maintain 40%+ margins.
2. **Low average utilization on Pro** - typical SaaS sees 20-40% feature utilization. At 30% utilization (600 try-ons), Pro is near break-even on API costs alone.
3. **Price trajectory** - OpenAI image generation costs have dropped ~60% year-over-year. At projected 2027 pricing, per-try-on cost could fall to $0.02, making all tiers profitable.

### Revised Pro Tier Recommendation

To ensure profitability, consider one of:

- **Option A:** Raise Pro to $49/month (break-even at ~1,000 try-ons, 50% utilization)
- **Option B:** Keep $29/month but cap at 1,000 try-ons, charge $0.03/try-on overage
- **Option C:** Keep $29/month with 2,000 try-ons as a growth/acquisition play, monetize through Enterprise upsell

---

## 3. ROI Calculator for Merchants

### Example: Mid-Size Fashion DTC Store

| Metric | Without MirrorAI | With MirrorAI |
|---|---|---|
| Monthly orders | 10,000 | 10,000 |
| Average order value (AOV) | $50 | $52 (upsell effect) |
| Return rate | 35% | 25% |
| Returns per month | 3,500 | 2,500 |
| Return processing cost (avg) | $12/return | $12/return |
| **Monthly return costs** | **$42,000** | **$30,000** |
| Gross revenue | $500,000 | $520,000 |
| Net revenue after returns | $325,000 | $390,000 |

### Savings Breakdown

| Line Item | Value |
|---|---|
| Reduction in returns | 1,000 fewer returns/month |
| Return cost savings | $12,000/month |
| Revenue from reduced refunds | 1,000 x $50 = $50,000 retained |
| AOV lift (conservative 4%) | $20,000/month additional revenue |
| **Total monthly benefit** | **$82,000** |
| MirrorAI cost (Enterprise) | ~$599/month + ~$500 API overage |
| **Net monthly gain** | **~$80,900** |
| **ROI** | **7,363%** |

### Conservative Scenario (5% Return Rate Reduction Only)

| Metric | Value |
|---|---|
| Return rate reduction | 35% to 30% (5 percentage points) |
| Fewer returns | 500/month |
| Return cost savings | $6,000/month |
| Retained revenue | $25,000/month |
| Total monthly benefit | $31,000 |
| MirrorAI cost | ~$1,099/month |
| Net monthly gain | ~$29,900 |
| ROI | 2,720% |

### Key Assumptions and Sources

- Average return processing cost of $12 is based on NRF/Appriss Retail 2024 data ($10-$15 range for apparel).
- 35% baseline return rate aligns with industry average for online apparel (Shopify, Narvar reports).
- 10-percentage-point return rate reduction is based on comparable virtual try-on case studies (Zeekit reported 36% reduction in returns for select retailers).
- AOV lift of 4% is conservative; AR/virtual try-on studies (Shopify AR, 2023) show 2-8% AOV increases.

---

## 4. Competitive Analysis

### Feature Comparison

| Feature | MirrorAI | Kiwi Sizing | Virtusize | Zeekit (Nike) |
|---|---|---|---|---|
| **Type** | AI photo try-on | Size recommendation | Size comparison | AI photo try-on |
| **Pricing** | $0-$299+/mo | $6.99-$49/mo | $299-$999/mo | Not publicly available (acquired by Nike) |
| **Shopify App** | Yes (native) | Yes | Yes (limited) | No (proprietary) |
| **Setup Time** | < 5 min | 15-30 min | Days-weeks | N/A |
| **Photo Try-On** | Yes (AI-generated) | No | No (silhouette only) | Yes |
| **Size Rec** | Planned | Yes (core) | Yes (core) | Yes |
| **AI Quality** | Photorealistic (GPT) | N/A | Basic overlay | High (proprietary) |
| **UGC / Social** | Yes | No | No | No |
| **Analytics** | Conversion + returns | Basic | Detailed | Internal only |
| **Multi-language** | Yes (50+) | Yes (10+) | Yes (20+) | Limited |
| **Mobile Experience** | Responsive web | Responsive web | Responsive web | Native app |

### Competitive Positioning

**vs. Kiwi Sizing:** Not a direct competitor. Kiwi solves sizing; MirrorAI solves visualization. Potential integration partner -- MirrorAI could recommend sizes alongside try-on. Kiwi's lower price point means merchants may use both.

**vs. Virtusize:** Virtusize targets enterprise with high price and long setup. MirrorAI undercuts on price (10x cheaper at Pro tier) and setup time (minutes vs. days). Virtusize has stronger size-comparison data but lacks photorealistic try-on.

**vs. Zeekit:** Acquired by Nike in 2021 and no longer available to third-party merchants. Validates the market but is not a competitive threat. MirrorAI fills the gap Zeekit left in the Shopify ecosystem.

**vs. Google Virtual Try-On:** Available on Google Shopping only, not embeddable in merchant stores. Limited to Google's product catalog. MirrorAI works on any merchant's products with their own photography.

### Moat and Differentiation

1. **Shopify-native integration** - one-click install, no developer needed.
2. **UGC loop** - customers share try-on photos, driving organic traffic.
3. **Price accessibility** - only AI try-on solution under $50/month.
4. **Speed of iteration** - built on OpenAI APIs means automatic quality improvements as models improve.

---

## 5. Go-to-Market Strategy

### Phase 1: Beta (Months 1-3)

**Goal:** Validate product-market fit with 50 merchants.

| Activity | Details |
|---|---|
| Target merchants | 50 Shopify stores, apparel/fashion, $5K-$100K/month GMV |
| Pricing | Free (all features unlocked, 500 try-ons/month) |
| Acquisition | Direct outreach on Shopify Community forums, Twitter/X DMs, Reddit r/shopify |
| Success metrics | >10% try-on-to-cart rate, >5% return rate reduction, NPS > 40 |
| Feedback loop | Weekly calls with 10 power users, in-app feedback widget |
| Key risk | Image quality not meeting merchant expectations -- mitigate with prompt engineering iteration |

### Phase 2: Shopify App Store Launch (Months 4-6)

**Goal:** Reach 500 paying merchants and establish App Store presence.

| Activity | Details |
|---|---|
| App Store listing | Optimized with video demo, merchant testimonials from beta |
| Pricing launch | Free + Pro ($29/month) tiers live |
| Target installs | 500 total, 100 Pro conversions (20% conversion) |
| Marketing budget | $3,000/month (App Store ads, influencer partnerships) |
| Content strategy | Case studies from beta merchants, "return rate calculator" landing page |
| Partnerships | Reach out to Shopify theme developers for bundled recommendations |
| Revenue target | $2,900 MRR by end of month 6 |

### Phase 3: Scale with Partnerships (Months 7-12)

**Goal:** Reach $25K MRR and launch Enterprise tier.

| Activity | Details |
|---|---|
| Enterprise launch | Custom pricing, dedicated onboarding, SLA |
| Agency partnerships | Partner with 10 Shopify Plus agencies for referral commission (20% rev share) |
| Integration partners | Kiwi Sizing (complementary), Klaviyo (email try-on links), Loop Returns (data sharing) |
| International | Localize app for UK, EU, Japan markets |
| Shopify Plus | Apply for Shopify Plus Certified App Program |
| Hiring | 1 customer success manager, 1 additional engineer |
| Revenue target | $25,000 MRR (200 Pro + 5 Enterprise) |

### Phase 4: Expansion (Year 2)

| Activity | Details |
|---|---|
| Platform expansion | WooCommerce, BigCommerce plugins |
| Product expansion | Accessories, eyewear, furniture visualization |
| API product | Let developers build on MirrorAI's try-on engine |
| Funding | Seed round ($1-2M) if metrics support it |
| Revenue target | $100,000 MRR |

### Key Milestones

| Month | Milestone | Metric |
|---|---|---|
| 1 | Beta launch | 50 merchants onboarded |
| 3 | Beta results | Validated return rate reduction data |
| 4 | App Store launch | Live listing with 4.5+ star rating target |
| 6 | Pro traction | 100 paying merchants, $2.9K MRR |
| 9 | Enterprise first deal | First $299+/month customer |
| 12 | Sustainable growth | $25K MRR, positive unit economics trend |

---

## Appendix: Key Assumptions

- OpenAI API pricing as of March 2026 (gpt-image-1: ~$0.04/image, gpt-4o: $2.50/$10 per 1M tokens input/output, gpt-4o-mini: $0.15/$0.60 per 1M tokens).
- Shopify App Store takes a 0% revenue share on the first $1M in annual revenue (Shopify's current developer terms).
- Return rate data sourced from NRF, Narvar, and Shopify public reports.
- Virtual try-on impact estimates based on published case studies from Zeekit, Snap AR, and Shopify AR features.
