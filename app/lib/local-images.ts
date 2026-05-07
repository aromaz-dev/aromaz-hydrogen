export const LOCAL_IMAGE_FALLBACKS = {
  hero: '/hero-bg.jpg',
  product: '/brand-story/natural-ingredients.jpg',
  collection: '/brand-story/artisanal-craft.jpg',
  deodorant: '/hero-bg.jpg',
  refill: '/ingredients/rose.jpg',
  balm: '/ingredients/shea-butter.jpg',
  scent: '/ingredients/lavender.jpg',
  case: '/brand-story/artisanal-craft.jpg',
} as const;

export function isDemoOrPlaceholderImage(url?: string | null) {
  if (!url) return true;

  return (
    url.includes('placehold.co') ||
    url.includes('/s/files/1/0688/1755/1382/')
  );
}

export function getLocalProductImage(title?: string | null, handle?: string | null) {
  const value = `${title ?? ''} ${handle ?? ''}`.toLowerCase();

  if (value.includes('refill')) return LOCAL_IMAGE_FALLBACKS.refill;
  if (value.includes('deodorant') || value.includes('case')) {
    return LOCAL_IMAGE_FALLBACKS.deodorant;
  }
  if (value.includes('balm')) return LOCAL_IMAGE_FALLBACKS.balm;
  if (value.includes('scent')) return LOCAL_IMAGE_FALLBACKS.scent;

  return LOCAL_IMAGE_FALLBACKS.product;
}

export function getLocalCollectionImage(title?: string | null, handle?: string | null) {
  const value = `${title ?? ''} ${handle ?? ''}`.toLowerCase();

  if (value.includes('deodorant') || value.includes('refill')) {
    return LOCAL_IMAGE_FALLBACKS.deodorant;
  }
  if (value.includes('ingredient') || value.includes('scent')) {
    return LOCAL_IMAGE_FALLBACKS.scent;
  }

  return LOCAL_IMAGE_FALLBACKS.collection;
}
