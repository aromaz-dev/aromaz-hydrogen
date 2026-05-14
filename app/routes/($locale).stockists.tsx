import {STOCKIST_LOCATIONS, StockistsPage} from '~/components/StockistsPage';
import {
  DEFAULT_STORE_URL,
  SEO_KEYWORDS,
  SITE_NAME,
  getCanonicalUrl,
} from '~/lib/seo';

const STOCKISTS_TITLE = 'Aromaz Stockists in Vancouver and Burnaby | Find a Store';
const STOCKISTS_DESCRIPTION =
  'Find Aromaz natural deodorant, refillable scent care, and natural cosmetics at Vancouver-area retail partners in West Vancouver, Burnaby, and Vancouver.';

export const meta = () => {
  const canonicalUrl = getCanonicalUrl('/stockists', DEFAULT_STORE_URL);

  return [
    {title: STOCKISTS_TITLE},
    {
      name: 'description',
      content: STOCKISTS_DESCRIPTION,
    },
    {name: 'keywords', content: SEO_KEYWORDS},
    {property: 'og:type', content: 'place'},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: STOCKISTS_TITLE},
    {property: 'og:description', content: STOCKISTS_DESCRIPTION},
    {property: 'og:url', content: canonicalUrl},
    {tagName: 'link', rel: 'canonical', href: canonicalUrl},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Aromaz Vancouver-area stockists',
        itemListElement: STOCKIST_LOCATIONS.map((location, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Store',
            name: location.name,
            address: location.address,
            url: location.mapUrl,
            areaServed: location.city,
          },
        })),
      },
    },
  ];
};

export default function StockistsRoute() {
  return <StockistsPage />;
}
