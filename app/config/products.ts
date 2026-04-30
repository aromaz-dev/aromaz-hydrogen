/**
 * Product Configuration
 *
 * Centralized product handles and configuration for Aromaz products.
 * This file can be committed to version control.
 */

export const PRODUCT_HANDLES = {
  /**
   * Refillable Deodorant Products
   */
  DEODORANT_CASE: 'beauty-example-product-4',
  DEODORANT_REFILL: 'beauty-example-product-3',
} as const;

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
