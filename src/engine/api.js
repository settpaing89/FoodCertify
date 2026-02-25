// src/engine/api.js
// Open Food Facts API integration — free, no API key required

const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';
const USER_AGENT = 'FoodSafe/1.0.0 (com.yourname.foodsafe; contact@yourname.com)';

/**
 * Fetch product data by barcode from Open Food Facts.
 * Returns null if not found.
 */
export async function fetchProductByBarcode(barcode) {
  try {
    const response = await fetch(`${BASE_URL}/${barcode}.json`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 0 || !data.product) {
      return { found: false, barcode };
    }

    return {
      found: true,
      barcode,
      product: normalizeProduct(data.product),
    };
  } catch (error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      throw new Error('Request timed out. Check your connection.');
    }
    throw new Error(`Could not fetch product: ${error.message}`);
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

    // Ingredients
    ingredients: raw.ingredients_text || raw.ingredients_text_en || '',
    ingredientsList: raw.ingredients || [],
    allergens: raw.allergens_tags || [],
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
