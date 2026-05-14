/**
 * Product Configuration
 *
 * Centralized product handles and configuration for Aromaz products.
 * This file can be committed to version control.
 */

export const PRODUCT_HANDLES = {
  NATURAL_LOOFAH_SOAP: 'beauty-example-product-1',
  MINI_DEODORANT: 'beauty-example-product-2',
  /**
   * Refillable Deodorant Products
   */
  DEODORANT_CASE: 'beauty-example-product-4',
  DEODORANT_REFILL: 'beauty-example-product-3',
} as const;

const SHOPIFY_TO_PUBLIC_PRODUCT_HANDLES: Record<string, string> = {
  [PRODUCT_HANDLES.NATURAL_LOOFAH_SOAP]: 'natural-loofah-soap',
  [PRODUCT_HANDLES.MINI_DEODORANT]: 'mini-natural-deodorant',
  [PRODUCT_HANDLES.DEODORANT_REFILL]: 'natural-deodorant-refill',
  [PRODUCT_HANDLES.DEODORANT_CASE]: 'refillable-deodorant-case',
};

const PUBLIC_TO_SHOPIFY_PRODUCT_HANDLES = Object.fromEntries(
  Object.entries(SHOPIFY_TO_PUBLIC_PRODUCT_HANDLES).map(
    ([shopifyHandle, publicHandle]) => [publicHandle, shopifyHandle],
  ),
);

export function getPublicProductHandle(handle: string) {
  return SHOPIFY_TO_PUBLIC_PRODUCT_HANDLES[handle] ?? handle;
}

export function getShopifyProductHandle(handle: string) {
  return PUBLIC_TO_SHOPIFY_PRODUCT_HANDLES[handle] ?? handle;
}

/**
 * Product Metafield Namespaces
 *
 * Used to query product-specific data like ingredients, origins, etc.
 */
export const METAFIELD_NAMESPACES = {
  CUSTOM: 'custom',
  PRODUCT_INFO: 'product_info',
} as const;

/**
 * Product Metafield Keys
 */
export const METAFIELD_KEYS = {
  // Case-specific
  MATERIAL: 'material',
  SUSTAINABILITY_NOTE: 'sustainability_note',

  // Refill-specific
  ORIGIN_REGION: 'origin_region',
  KEY_INGREDIENTS: 'key_ingredients',
  BENEFITS: 'benefits',
  SCENT_PROFILE: 'scent_profile',
  SCENT_INTENSITY: 'scent_intensity',
  BEST_FOR: 'best_for',
  NATURAL_PERCENTAGE: 'natural_percentage',
  VEGAN: 'vegan',
  CRUELTY_FREE: 'cruelty_free',
} as const;

/**
 * Customization Flow Route
 */
export const CUSTOMIZE_ROUTE = '/products/refillable-deodorant/customize';
