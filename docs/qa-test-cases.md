# MirrorAI (Feature 4) - QA Test Cases

**App:** MirrorAI - Virtual Try-On for Shopify
**Feature:** Feature 4
**Author:** QA Engineer
**Date:** 2026-03-06
**Priority Legend:** P0 = Critical (blocking), P1 = High (major functionality), P2 = Medium (minor/edge case)

---

## 1. Upload Flow

| ID | Description | Steps | Expected Result | Priority |
|----|-------------|-------|-----------------|----------|
| UP-001 | Upload valid JPG image | 1. Navigate to Try-On page. 2. Click "Upload Photo." 3. Select a valid JPG file under 5MB containing a person. | Image uploads successfully. Preview thumbnail displays. Upload progress indicator completes. No errors shown. | P0 |
| UP-002 | Upload valid PNG image | 1. Navigate to Try-On page. 2. Click "Upload Photo." 3. Select a valid PNG file under 5MB containing a person. | Image uploads successfully. Preview thumbnail displays. Upload progress indicator completes. No errors shown. | P0 |
| UP-003 | Upload valid WEBP image | 1. Navigate to Try-On page. 2. Click "Upload Photo." 3. Select a valid WEBP file under 5MB containing a person. | Image uploads successfully. Preview thumbnail displays. Upload progress indicator completes. No errors shown. | P0 |
| UP-004 | Upload file exceeding 5MB | 1. Navigate to Try-On page. 2. Click "Upload Photo." 3. Select an image file larger than 5MB. | Upload is rejected before network transfer (client-side validation). Error message displays: "File size must be under 5MB." No partial upload occurs. | P0 |
| UP-005 | Upload non-image file | 1. Navigate to Try-On page. 2. Click "Upload Photo." 3. Select a non-image file (e.g., .pdf, .txt, .zip). | File picker filters out non-image types. If bypassed, server returns a clear error: "Unsupported file type. Please upload a JPG, PNG, or WEBP image." | P0 |
| UP-006 | Upload blurry or dark photo | 1. Navigate to Try-On page. 2. Upload a blurry or extremely dark photo of a person. | System accepts the upload but displays a quality warning: "This photo may be low quality. Results may vary. Consider uploading a clearer photo." User can proceed or re-upload. | P1 |
| UP-007 | Upload photo with no person (landscape) | 1. Navigate to Try-On page. 2. Upload a landscape or scenery photo with no person visible. | System detects no human subject. Error message displays: "No person detected in this photo. Please upload a photo that clearly shows a person." Upload is not accepted for try-on. | P0 |
| UP-008 | Upload pet photo | 1. Navigate to Try-On page. 2. Upload a photo of a pet (dog, cat, etc.) with no human present. | System detects no human subject. Error message displays: "No person detected in this photo. Please upload a photo that clearly shows a person." Upload is not accepted for try-on. | P1 |
| UP-009 | Upload object photo | 1. Navigate to Try-On page. 2. Upload a photo of an inanimate object (furniture, food, etc.). | System detects no human subject. Error message displays: "No person detected in this photo. Please upload a photo that clearly shows a person." Upload is not accepted for try-on. | P1 |

---

## 2. Try-On Generation

| ID | Description | Steps | Expected Result | Priority |
|----|-------------|-------|-----------------|----------|
| TG-001 | Successful try-on with normal person photo and product | 1. Upload a valid person photo. 2. Select a product from the catalog. 3. Click "Try It On." | Loading spinner/progress indicator appears. Within a reasonable time (under 30s typical), a composite image is generated showing the person wearing the selected product. Result displays in the try-on modal. | P0 |
| TG-002 | API timeout exceeding 60 seconds | 1. Upload a valid person photo. 2. Select a product. 3. Click "Try It On." 4. Simulate or wait for API response exceeding 60s. | After 60s, the request times out gracefully. User sees an error message: "Generation is taking longer than expected. Please try again." A "Retry" button is displayed. No infinite spinner. | P0 |
| TG-003 | API key invalid or expired | 1. Configure the app with an invalid or expired API key. 2. Upload a valid person photo. 3. Select a product. 4. Click "Try It On." | User sees a user-friendly error: "Try-on service is temporarily unavailable. Please contact the store for assistance." Merchant admin panel shows a clear alert about the invalid API key. Error is logged server-side. | P0 |
| TG-004 | API billing limit reached | 1. Exhaust the API billing quota. 2. Upload a valid person photo. 3. Select a product. 4. Click "Try It On." | User sees a message: "Try-on service is temporarily unavailable. Please try again later." Merchant admin panel displays a billing alert with a link to upgrade. Error is logged server-side. | P0 |
| TG-005 | Network disconnect during generation | 1. Upload a valid person photo. 2. Select a product. 3. Click "Try It On." 4. Disconnect network while generation is in progress. | App detects the lost connection. Loading state stops. User sees: "Connection lost. Please check your network and try again." No duplicate requests are sent on reconnect without user action. | P1 |
| TG-006 | User closes modal during loading | 1. Upload a valid person photo. 2. Select a product. 3. Click "Try It On." 4. Close the try-on modal while generation is in progress. | Modal closes immediately. Background request is cancelled or its result is discarded. No orphaned state or errors on next interaction. User can initiate a new try-on without issues. | P1 |

---

## 3. Size Advisor

| ID | Description | Steps | Expected Result | Priority |
|----|-------------|-------|-----------------|----------|
| SA-001 | Size recommendation with height and weight provided | 1. Navigate to the Size Advisor section. 2. Enter height (e.g., 175cm). 3. Enter weight (e.g., 70kg). 4. Click "Get Size Recommendation." | System returns a specific size recommendation (e.g., "Medium") with a confidence indicator. Recommendation accounts for the selected product's sizing chart. | P0 |
| SA-002 | Size recommendation with only height provided | 1. Navigate to the Size Advisor section. 2. Enter height (e.g., 175cm). 3. Leave weight blank. 4. Click "Get Size Recommendation." | System returns a size range (e.g., "Small - Medium") with a note: "Providing your weight can improve accuracy." Partial recommendation is still useful. | P1 |
| SA-003 | Size recommendation with only weight provided | 1. Navigate to the Size Advisor section. 2. Leave height blank. 3. Enter weight (e.g., 70kg). 4. Click "Get Size Recommendation." | System returns a size range (e.g., "Medium - Large") with a note: "Providing your height can improve accuracy." Partial recommendation is still useful. | P1 |
| SA-004 | Size recommendation without any measurements | 1. Navigate to the Size Advisor section. 2. Leave both height and weight blank. 3. Click "Get Size Recommendation." | Button is disabled or system displays: "Please provide at least your height or weight for a size recommendation." No recommendation is generated. | P0 |
| SA-005 | Extreme values - height 300cm, weight 200kg | 1. Navigate to the Size Advisor section. 2. Enter height as 300cm. 3. Enter weight as 200kg. 4. Click "Get Size Recommendation." | System validates inputs and either: (a) rejects with "Please enter realistic measurements" if values exceed defined thresholds, or (b) returns the largest available size with a note that measurements are outside standard ranges. No crash or unhandled error. | P1 |
| SA-006 | Size recommendation with purchase history match | 1. Log in as a customer with prior purchase history. 2. Navigate to Size Advisor. 3. Enter measurements. 4. Click "Get Size Recommendation." | System factors in past purchases. Recommendation includes: "Based on your previous orders, [Size] has been your best fit." Confidence indicator is higher than without history. | P1 |
| SA-007 | Size recommendation without purchase history | 1. Log in as a new customer with no purchase history. 2. Navigate to Size Advisor. 3. Enter measurements. 4. Click "Get Size Recommendation." | System returns a standard recommendation based on measurements and product sizing chart only. No errors related to missing history. No mention of purchase history in the result. | P1 |

---

## 4. UGC (User-Generated Content) Save

| ID | Description | Steps | Expected Result | Priority |
|----|-------------|-------|-----------------|----------|
| UGC-001 | Save try-on result with consent checked | 1. Complete a successful try-on. 2. Check the "I consent to sharing this image" checkbox. 3. Click "Save to Gallery." | Image is saved to the UGC gallery. Success toast: "Your try-on has been saved!" Image appears in the pending gallery (awaiting merchant approval). Consent timestamp is recorded in the database. | P0 |
| UGC-002 | Attempt save without consent checkbox | 1. Complete a successful try-on. 2. Leave the consent checkbox unchecked. 3. Observe the "Save to Gallery" button. | "Save to Gallery" button is disabled/greyed out. Tooltip or helper text indicates: "You must consent to sharing before saving." No save request is sent. | P0 |
| UGC-003 | Save with customer name provided | 1. Complete a successful try-on. 2. Check consent. 3. Enter a customer name (e.g., "Jane D."). 4. Click "Save to Gallery." | Image is saved with the provided name displayed as attribution. Gallery shows "Jane D." next to the try-on image. | P1 |
| UGC-004 | Save without customer name (Anonymous) | 1. Complete a successful try-on. 2. Check consent. 3. Leave the name field blank. 4. Click "Save to Gallery." | Image is saved with attribution shown as "Anonymous." No error about missing name. Gallery entry displays "Anonymous" as the contributor. | P1 |
| UGC-005 | Merchant approve flow | 1. (As merchant) Navigate to the UGC management panel in admin. 2. View list of pending UGC submissions. 3. Select a pending try-on image. 4. Click "Approve." | Image status changes to "Approved." Image becomes visible in the public-facing storefront gallery. Approval timestamp is recorded. Merchant sees a success confirmation. | P0 |
| UGC-006 | Merchant reject flow | 1. (As merchant) Navigate to the UGC management panel in admin. 2. View list of pending UGC submissions. 3. Select a pending try-on image. 4. Click "Reject." | Image status changes to "Rejected." Image is removed from the pending queue. Image does not appear in the public gallery. Rejection reason field is optionally available. Merchant sees a confirmation. | P0 |

---

## 5. Analytics Dashboard

| ID | Description | Steps | Expected Result | Priority |
|----|-------------|-------|-----------------|----------|
| AD-001 | Dashboard displays with data | 1. (As merchant) Ensure there is existing try-on usage data. 2. Navigate to the Analytics Dashboard. | Dashboard loads and displays: total try-ons count, conversion rate, most tried-on products, UGC submissions count, and return rate. Charts render correctly. Data matches database records. | P0 |
| AD-002 | Dashboard displays with no data (empty state) | 1. (As merchant) Use a fresh store with no try-on data. 2. Navigate to the Analytics Dashboard. | Dashboard loads without errors. An empty state is shown with a message: "No try-on data yet. Analytics will appear once customers start using MirrorAI." No broken charts, no NaN values, no console errors. | P1 |
| AD-003 | Return rate calculation accuracy | 1. (As merchant) Ensure there are completed orders, some with returns, that used the try-on feature. 2. Navigate to the Analytics Dashboard. 3. Check the return rate metric. | Return rate is calculated as: (number of returned items that used try-on / total items purchased that used try-on) x 100. Value matches manual calculation from the database. Comparison to the store's overall return rate is shown if available. | P0 |

---

## 6. Edge Cases

| ID | Description | Steps | Expected Result | Priority |
|----|-------------|-------|-----------------|----------|
| EC-001 | Multiple rapid "Try It On" clicks | 1. Upload a valid person photo. 2. Select a product. 3. Rapidly click "Try It On" 5+ times in quick succession. | Only one generation request is sent (button is disabled after first click or requests are debounced). No duplicate images generated. No duplicate billing charges. UI remains stable. | P0 |
| EC-002 | Browser back button during try-on | 1. Upload a valid person photo. 2. Select a product. 3. Click "Try It On." 4. While loading, press the browser back button. | Navigation occurs without error. No unhandled promise rejections or console errors. In-flight request is cancelled or its result is discarded. Returning to the try-on page shows a clean state, ready for a new attempt. | P1 |
| EC-003 | Session expired during use | 1. Upload a valid person photo. 2. Wait for the Shopify session to expire (or simulate expiry). 3. Attempt to click "Try It On." | App detects the expired session. User is redirected to re-authenticate. After re-authentication, user is returned to the try-on page. No data loss or cryptic error messages. | P0 |
| EC-004 | Mobile responsive layout | 1. Open the try-on feature on a mobile device (or use browser dev tools to simulate 375px width). 2. Navigate through upload, try-on, size advisor, and UGC save flows. | All UI elements are visible and usable without horizontal scrolling. Buttons are tappable (minimum 44px touch targets). Images scale appropriately. Modals fit the viewport. Text is readable without zooming. | P1 |

---

## Summary

| Section | Total Cases | P0 | P1 | P2 |
|---------|-------------|-----|-----|-----|
| Upload Flow | 9 | 4 | 4 | 0 |
| Try-On Generation | 6 | 4 | 2 | 0 |
| Size Advisor | 7 | 2 | 5 | 0 |
| UGC Save | 6 | 4 | 2 | 0 |
| Analytics Dashboard | 3 | 2 | 1 | 0 |
| Edge Cases | 4 | 2 | 2 | 0 |
| **Total** | **35** | **18** | **16** | **0** |
