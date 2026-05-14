export const SITE_NAME = 'Aromaz Cosmetics';
export const DEFAULT_STORE_URL = 'https://aromazco.com';

export const SEO_KEYWORDS = [
  'natural deodorant',
  'refillable deodorant',
  'Vancouver natural deodorant',
  'Canada natural cosmetics',
  'USA natural cosmetics',
  'natural cosmetics',
  'sensitive skin deodorant',
  'botanical deodorant',
  'natural loofah soap',
  'natural lip balm',
].join(', ');

export function getStoreUrl(request: Request, publicStoreDomain?: string) {
  const publicDomain = publicStoreDomain
    ?.replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .trim();

  if (publicDomain && !publicDomain.includes('myshopify.com')) {
    return `https://${publicDomain}`;
  }

  try {
    const url = new URL(request.url);

    if (!url.hostname.includes('localhost')) {
      return url.origin;
    }
  } catch {
    return DEFAULT_STORE_URL;
  }

  return DEFAULT_STORE_URL;
}

export function getCanonicalUrl(path: string, storeUrl = DEFAULT_STORE_URL) {
  return new URL(path.startsWith('/') ? path : `/${path}`, `${storeUrl}/`)
    .toString()
    .replace(/\/$/, '');
}

export function getPlainText(value?: string | null) {
  if (!value) return '';

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getSeoDescription(value?: string | null, fallback = '') {
  const description = getPlainText(value) || fallback;

  return description.length > 158
    ? `${description.slice(0, 155).trim()}...`
    : description;
}
