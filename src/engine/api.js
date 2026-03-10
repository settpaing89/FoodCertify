// src/engine/api.js
// Open Food Facts API integration — free, no API key required

const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';
const USER_AGENT = 'FoodSafe/1.0.0 (com.yourname.foodsafe; contact@yourname.com)';

// In-memory cache — cleared on app restart, which is fine for barcodes
const productCache = new Map();

/**
 * Fetch product data by barcode from Open Food Facts.
 * Returns null if not found.
 */
export async function fetchProductByBarcode(barcode) {
  // Return cached result immediately on repeat scans
  if (productCache.has(barcode)) {
    return productCache.get(barcode);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URL}/${barcode}.json`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const result = data.status === 0 || !data.product
      ? { found: false, barcode }
      : { found: true, barcode, product: normalizeProduct(data.product) };

    productCache.set(barcode, result);
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection.');
    }
    throw new Error(`Could not fetch product: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Normalize Open Food Facts product to our app's format
 */
function normalizeProduct(raw) {
  return {
    id: raw.code || raw._id,
    name: raw.product_name || raw.product_name_en || 'Unknown Product',
    brand: raw.brands || '',
    quantity: raw.quantity || '',
    imageUrl: raw.image_front_url || raw.image_url || null,
    imageThumbnailUrl: raw.image_front_thumb_url || raw.image_thumb_url || null,

    // Ingredients — check all language variants, fall back to ingredients array
    ingredients: (() => {
      const text =
        raw.ingredients_text_en ||
        raw.ingredients_text ||
        raw.ingredients_text_fr ||
        raw.ingredients_text_de ||
        Object.keys(raw)
          .filter(k => k.startsWith('ingredients_text_') && raw[k])
          .map(k => raw[k])[0] ||
        '';
      if (text) return text;
      if (Array.isArray(raw.ingredients) && raw.ingredients.length > 0) {
        return raw.ingredients.map(i => i.text || i.id || '').filter(Boolean).join(', ');
      }
      return '';
    })(),
    ingredientsList: raw.ingredients || [],
    allergens: (() => {
      if (Array.isArray(raw.allergens_tags) && raw.allergens_tags.length > 0)
        return raw.allergens_tags;
      if (raw.allergens && typeof raw.allergens === 'string' && raw.allergens.trim())
        return raw.allergens.split(',').map(s => s.trim()).filter(Boolean);
      if (Array.isArray(raw.allergens_hierarchy) && raw.allergens_hierarchy.length > 0)
        return raw.allergens_hierarchy;
      return [];
    })(),
    traces: raw.traces_tags || [],

    // Nutrition
    nutriments: raw.nutriments || {},
    nutriscoreGrade: raw.nutriscore_grade?.toUpperCase() || null,
    novaGroup: raw.nova_group || null,
    ecoscore: raw.ecoscore_grade?.toUpperCase() || null,

    // Labels & certifications
    labels: raw.labels_tags || [],
    categories: raw.categories_tags || [],

    // Serving
    servingSize: raw.serving_size || '',
    servingQuantity: raw.serving_quantity || null,

    // Metadata
    countries: raw.countries_tags || [],
    stores: raw.stores || '',
    lastModified: raw.last_modified_t,
  };
}

/**
 * Search for products by name (for manual search)
 */
export async function searchProducts(query, page = 1) {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: 1,
      action: 'process',
      json: 1,
      page,
      page_size: 20,
    });

    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
      { headers: { 'User-Agent': USER_AGENT } }
    );

    const data = await response.json();

    return {
      products: (data.products || []).map(normalizeProduct),
      count: data.count || 0,
      page: data.page || 1,
      pageCount: data.page_count || 1,
    };
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
}
