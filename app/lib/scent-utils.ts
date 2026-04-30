/**
 * Utility functions for scent/strength variant handling
 *
 * Scent products have variants named: "{ScentName} {Strength}"
 * Example: "Lavender Strong", "Mint Normal", "Citrus Sensitive"
 */

export const STRENGTH_OPTIONS = ['Strong', 'Normal', 'Sensitive'] as const;
export type Strength = (typeof STRENGTH_OPTIONS)[number];

/**
 * Extract the scent name from a variant title by removing strength suffix
 * @example getScentName("Lavender Strong") => "Lavender"
 */
export function getScentName(variantTitle: string): string {
  return variantTitle.replace(/ (Strong|Normal|Sensitive)$/, '');
}

/**
 * Extract the strength from a variant title
 * @example getStrength("Lavender Strong") => "Strong"
 */
export function getStrength(variantTitle: string): Strength | null {
  const match = variantTitle.match(/(Strong|Normal|Sensitive)$/);
  return match ? (match[1] as Strength) : null;
}

/**
 * Check if a product's variants follow the scent+strength naming pattern
 */
export function isScentProduct(
  variants: Array<{title: string}>,
): boolean {
  if (variants.length === 0) return false;
  return variants.every((v) =>
    STRENGTH_OPTIONS.some((s) => v.title.endsWith(s)),
  );
}

/**
 * Filter variants by strength
 */
export function filterByStrength<T extends {title: string}>(
  variants: T[],
  strength: Strength,
): T[] {
  return variants.filter((v) => v.title.endsWith(strength));
}

/**
 * Find a variant by scent name and strength
 */
export function findVariant<T extends {title: string}>(
  variants: T[],
  scentName: string,
  strength: Strength,
): T | undefined {
  return variants.find((v) => v.title === `${scentName} ${strength}`);
}
