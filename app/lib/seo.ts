export const SITE_NAME = 'Aromaz';
export const SITE_LEGAL_NAME = 'Aromaz Cosmetics';
export const DEFAULT_STORE_URL = 'https://aromazco.com';
export const CUSTOMER_SUPPORT_EMAIL = 'info@aromazco.com';

export const SITE_ALTERNATE_NAMES = [
  SITE_LEGAL_NAME,
  'Aromaz Co',
  'aromazco.com',
];

export const SOCIAL_URLS = [
  'https://www.instagram.com/aromaz_cosmetics',
  'https://www.tiktok.com/@aromaz873',
];

export const SEO_KEYWORDS = [
  'natural deodorant',
  'natural deodorant Canada',
  'natural deodorant Vancouver',
  'refillable deodorant',
  'refillable natural deodorant',
  'Vancouver natural deodorant',
  'Canada natural cosmetics',
  'USA natural cosmetics',
  'natural cosmetics',
  'sensitive skin deodorant',
  'sensitive skin natural deodorant',
  'botanical deodorant',
  'botanical deodorant refills',
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
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    const isLocalPreview =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local');

    if (!isLocalPreview) {
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

export function getOrganizationJsonLd(storeUrl = DEFAULT_STORE_URL) {
  const url = getCanonicalUrl('/', storeUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}#organization`,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url,
    logo: getCanonicalUrl('/favicon.png', storeUrl),
    sameAs: SOCIAL_URLS,
    email: CUSTOMER_SUPPORT_EMAIL,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: CUSTOMER_SUPPORT_EMAIL,
        areaServed: ['CA', 'US'],
        availableLanguage: ['en'],
      },
    ],
    areaServed: [
      'Vancouver, BC',
      'Burnaby, BC',
      'West Vancouver, BC',
      'Canada',
      'United States',
    ],
  };
}

export function getWebSiteJsonLd(storeUrl = DEFAULT_STORE_URL) {
  const url = getCanonicalUrl('/', storeUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${url}#website`,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url,
    publisher: {
      '@id': `${url}#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbJsonLd(
  items: Array<{name: string; path: string}>,
  storeUrl = DEFAULT_STORE_URL,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path, storeUrl),
    })),
  };
}

export function getPlainText(value?: string | null) {
  if (!value) return '';

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSeoDescription(value?: string | null, fallback = '') {
  const description = getPlainText(value) || fallback;

  return description.length > 158
    ? `${description.slice(0, 155).trim()}...`
    : description;
}
