import {Link} from 'react-router';
import type {Route} from './+types/($locale).catalog';
import {BROCHURE_PRODUCTS} from '~/lib/brochure-products';
import {
  DEFAULT_STORE_URL,
  SEO_KEYWORDS,
  SITE_NAME,
  getBreadcrumbJsonLd,
  getCanonicalUrl,
} from '~/lib/seo';

const CATALOG_TITLE =
  'Aromaz Catalog | Refillable Natural Deodorant and Cosmetics';
const CATALOG_DESCRIPTION =
  'Explore the Aromaz catalog with refillable natural deodorant scents, sensitive skin deodorant refills, natural loofah soap, and lip care essentials.';

function getCatalogImageUrl(image: string) {
  return /^https?:\/\//.test(image)
    ? image
    : getCanonicalUrl(image, DEFAULT_STORE_URL);
}

export const meta: Route.MetaFunction = () => {
  const canonicalUrl = getCanonicalUrl('/catalog', DEFAULT_STORE_URL);

  return [
    {title: CATALOG_TITLE},
    {
      name: 'description',
      content: CATALOG_DESCRIPTION,
    },
    {name: 'keywords', content: SEO_KEYWORDS},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: CATALOG_TITLE},
    {property: 'og:description', content: CATALOG_DESCRIPTION},
    {property: 'og:url', content: canonicalUrl},
    {tagName: 'link', rel: 'canonical', href: canonicalUrl},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Aromaz product catalog',
        itemListElement: BROCHURE_PRODUCTS.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: getCanonicalUrl(product.href, DEFAULT_STORE_URL),
          item: {
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: getCatalogImageUrl(product.image),
            brand: {
              '@type': 'Brand',
              name: SITE_NAME,
            },
            offers: {
              '@type': 'Offer',
              price: product.price.replace(/[^0-9.]/g, ''),
              priceCurrency: 'CAD',
              availability: 'https://schema.org/InStock',
              url: getCanonicalUrl(product.href, DEFAULT_STORE_URL),
              seller: {
                '@id': `${getCanonicalUrl('/', DEFAULT_STORE_URL)}#organization`,
              },
            },
          },
        })),
      },
    },
    {
      'script:ld+json': getBreadcrumbJsonLd(
        [
          {name: 'Home', path: '/'},
          {name: 'Catalog', path: '/catalog'},
        ],
        DEFAULT_STORE_URL,
      ),
    },
  ];
};

export default function CatalogRoute() {
  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        <div className="catalog-hero-inner">
          <img
            src="/images/aromaz-new-logo.png"
            alt="Aromaz"
            className="catalog-hero-logo"
          />
          <p>Product Catalog</p>
          <h1><a href="#catalog-start">Aromaz Collection</a></h1>
          <span>
            Refill-led deodorant scents, natural loofah soap, and daily lip care
            essentials organized for easy scent discovery, wholesale review, and
            checkout.
          </span>
          <div className="catalog-hero-actions">
            <Link to="/products/refillable-deodorant/customize">
              Build your deodorant
            </Link>
            <Link to="/collections/all">Shop all</Link>
          </div>
        </div>
        <div className="catalog-hero-media">
          <img
            src="/images/IMG_9440.jpg"
            alt="Aromaz natural deodorant"
            loading="eager"
          />
        </div>
      </section>

      <section className="catalog-parallax" aria-label="Aromaz catalog items">
        {BROCHURE_PRODUCTS.map((product, index) => (
          <article className="catalog-panel" key={product.name} {...(index === 0 ? {id: 'catalog-start'} : {})}>
            <div className="catalog-panel-backdrop" aria-hidden="true" />
            <div className="catalog-panel-content">
              <div className="catalog-panel-card">
                <div className="catalog-panel-card-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>
                <div className="catalog-panel-card-body">
                  <p>{String(index + 1).padStart(2, '0')}</p>
                  <span>{product.category}</span>
                  <h2>{product.name}</h2>
                  <strong>{product.price}</strong>
                  <div>
                    <p>{product.description}</p>
                    <p>{product.detail}</p>
                  </div>
                  <Link to={product.href}>Add to cart</Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
