# FoodSafe — API Infrastructure & Improvements

**File:** `src/engine/api.js`
**External service:** [Open Food Facts](https://world.openfoodfacts.org) (free, no API key required)

---

## Overview

FoodSafe fetches all product data from the Open Food Facts (OFF) public REST API. There is no custom backend. The app communicates directly with OFF from the device. All post-fetch logic (analysis, storage, UI rendering) happens entirely on-device.

```
User scans barcode
       │
       ▼
fetchProductByBarcode(barcode)        ← src/engine/api.js
       │
       ├─ [cache hit] ──► return cached result instantly
       │
       └─ [cache miss] ──► fetch OFF API ──► normalizeProduct() ──► cache + return
                                │
                                └─ [not found] ──► return { found: false }
                                └─ [timeout / network error] ──► throw Error
```

---

## Endpoints Used

### 1. Product Lookup by Barcode
```
GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json
```
- Used by `fetchProductByBarcode(barcode)`
- Returns a single product object or `{ status: 0 }` when not found
- No authentication required

### 2. Product Search by Name
```
GET https://world.openfoodfacts.org/cgi/search.pl
    ?search_terms={query}
    &search_simple=1
    &action=process
    &json=1
    &page={page}
    &page_size=20
```
- Used by `searchProducts(query, page)` for the manual entry search screen
- Returns paginated product list with `count`, `page`, `page_count`

---

## Module Architecture

```
api.js
 ├── productCache          Map<barcode, result>   (module-level, in-memory)
 ├── fetchProductByBarcode(barcode)               (exported)
 │    ├── cache check
 │    ├── AbortController timeout (10s)
 │    ├── fetch + parse
 │    ├── normalizeProduct()
 │    └── cache write
 ├── searchProducts(query, page)                  (exported)
 └── normalizeProduct(raw)                        (internal)
```

---

## normalizeProduct — Data Shape

The OFF API returns a large, inconsistent raw object. `normalizeProduct()` maps it to a stable, predictable shape used throughout the app:

| App field | OFF source fields | Notes |
|---|---|---|
| `id` | `code`, `_id` | barcode |
| `name` | `product_name`, `product_name_en` | falls back to `'Unknown Product'` |
| `brand` | `brands` | comma-separated string |
| `quantity` | `quantity` | e.g. `"500g"` |
| `imageUrl` | `image_front_url`, `image_url` | full resolution |
| `imageThumbnailUrl` | `image_front_thumb_url`, `image_thumb_url` | used in list cards |
| `ingredients` | `ingredients_text`, `ingredients_text_en` | plain text, fed into `analyzeIngredients()` |
| `ingredientsList` | `ingredients` | structured array (unused in analysis currently) |
| `allergens` | `allergens_tags` | `["en:gluten", ...]` |
| `traces` | `traces_tags` | cross-contamination labels |
| `nutriments` | `nutriments` | `{ energy_100g, fat_100g, ... }` — fed into `checkNutrientLimits()` |
| `nutriscoreGrade` | `nutriscore_grade` | uppercased: A–E |
| `novaGroup` | `nova_group` | 1–4 processing level |
| `ecoscore` | `ecoscore_grade` | A–E environmental score |
| `labels` | `labels_tags` | `["en:organic", ...]` |
| `categories` | `categories_tags` | food category tags |
| `servingSize` | `serving_size` | e.g. `"30g"` |
| `servingQuantity` | `serving_quantity` | numeric grams |
| `countries` | `countries_tags` | where sold |
| `stores` | `stores` | retailer names |
| `lastModified` | `last_modified_t` | Unix timestamp |

---

## Improvements Made

### Problem 1 — Timeout was silently ignored

**Before:**
```js
const response = await fetch(url, {
  headers: { 'User-Agent': USER_AGENT },
  timeout: 10000,   // ← silently ignored in React Native's fetch polyfill
});
```

React Native's `fetch` is not the browser's `fetch`. The `timeout` option is not a standard fetch API field and is silently discarded. A slow or stalled request would hang indefinitely with no error thrown.

**After:**
```js
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: controller.signal,   // ← real cancellation
  });
  // ...
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('Request timed out. Check your connection.');
  }
  throw error;
} finally {
  clearTimeout(timeoutId);   // ← always cleans up the timer
}
```

`AbortController` is the standard Web API mechanism for cancelling fetch requests. When the 10-second timer fires it calls `controller.abort()`, which causes the in-flight `fetch` to reject with an `AbortError`. The `finally` block ensures the timer is always cleared even on success, preventing memory leaks.

---

### Problem 2 — No caching (every scan hit the network)

**Before:** Every barcode scan, including rescanning the same product, performed a full network round-trip to OFF.

**After:**
```js
// Module-level — survives re-renders and screen navigation, cleared on app restart
const productCache = new Map();

export async function fetchProductByBarcode(barcode) {
  if (productCache.has(barcode)) {
    return productCache.get(barcode);   // instant, zero network cost
  }

  // ... fetch ...

  productCache.set(barcode, result);   // store after first successful fetch
  return result;
}
```

The cache is a module-level `Map`, which means it lives for the lifetime of the JS runtime (i.e. as long as the app is open). It is not persisted to disk — product data changes infrequently but the OFF database does update, so stale persistence would be a liability. The trade-off is intentional: session-level caching with zero staleness risk across app restarts.

**Impact:**
- Rescanning a product that was already scanned in the session: ~0ms (no network)
- First scan of any product: same as before (~200ms–2s depending on connection)
- Opening a result from History that was scanned earlier in the same session: instant

---

### Problem 3 — Side-effects blocked the fetch (in ScannerScreen)

**Before (in `ScannerScreen.js`):**
```js
setScanned(true);
setLoading(true);
await incrementScanCount();                                    // ← AsyncStorage write
await Haptics.notificationAsync(NotificationFeedbackType.Success);  // ← haptic motor
const result = await fetchProductByBarcode(barcode);          // ← fetch starts here
```

`incrementScanCount` performs an AsyncStorage read-modify-write. `Haptics` awaits the motor completion. Neither result is needed to start the network request, yet both blocked it.

**After:**
```js
setScanned(true);
setLoading(true);
incrementScanCount();                                          // fire and forget
Haptics.notificationAsync(NotificationFeedbackType.Success);  // fire and forget
const result = await fetchProductByBarcode(barcode);          // ← fetch starts immediately
```

Both calls are fire-and-forget. Their promises are intentionally not awaited because:
- `incrementScanCount` failing silently is acceptable (scan count is a soft limit)
- Haptic feedback does not need to complete before showing the result

This change eliminates ~50–150ms of avoidable latency before the network request begins.

---

## Error Handling Strategy

| Error type | Behaviour |
|---|---|
| HTTP non-2xx | Throws `"HTTP {status}"` — propagated to UI as an alert |
| Product not in OFF database | Returns `{ found: false, barcode }` — UI shows "Product not found" screen |
| Network timeout (>10s) | Throws `"Request timed out. Check your connection."` |
| Any other network error | Throws `"Could not fetch product: {message}"` |
| Search failure | Throws `"Search failed: {message}"` |

Errors from `fetchProductByBarcode` are caught in `ScannerScreen` and `ManualEntryScreen` and shown to the user as an alert. They never crash the app.

---

## What Does NOT Live in api.js

These concerns are intentionally kept out of the API layer to maintain separation:

| Concern | Where it lives |
|---|---|
| Ingredient safety analysis | `src/engine/analyzer.js` |
| Dietary pref enforcement | `src/engine/analyzer.js` → `checkNutrientLimits()` |
| Scan count gating (free tier) | `src/context/PremiumContext.js` |
| Scan history persistence | `src/hooks/useStorage.js` → `useHistory()` |
| Product display / navigation | `src/screens/ResultScreen.js` |

---

## Potential Future Improvements

| Improvement | Rationale |
|---|---|
| Add `AbortController` to `searchProducts()` | Currently no timeout on the name-search endpoint — same silent-hang risk |
| Cache `searchProducts` results | Typing the same query twice hits the network; simple LRU on `(query, page)` key would help |
| Persistent barcode cache (AsyncStorage) | Frequently scanned barcodes (e.g. daily groceries) would survive restarts. Needs a TTL (e.g. 7 days) to avoid stale data |
| Retry with exponential back-off | A single retry on timeout would improve reliability on flaky connections without adding perceived latency |
| Field selection via OFF API `fields` param | OFF supports `?fields=product_name,ingredients_text,...` to reduce response size from ~80KB to ~5KB for typical use |
