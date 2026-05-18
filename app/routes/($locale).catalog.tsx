import {Link} from 'react-router';
import type {CSSProperties} from 'react';
import type {Route} from './+types/catalog';
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

const CATALOG_HERO_OVERLAY =
  'linear-gradient(to right, rgba(32, 35, 34, 0.82) 0%, rgba(32, 35, 34, 0.58) 36%, rgba(32, 35, 34, 0.06) 62%, rgba(32, 35, 34, 0.04) 100%)';

const CATALOG_PANEL_OVERLAY =
  'linear-gradient(90deg, rgba(32, 35, 34, 0.82), rgba(32, 35, 34, 0.32) 48%, rgba(32, 35, 34, 0.74))';

function getCssBackgroundImage(image: string, overlay: string) {
  return `${overlay}, url("${image}")`;
}

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
      <section
        className="catalog-hero"
        style={
          {
            backgroundImage: getCssBackgroundImage(
              '/brand-story/heade-home3.png',
              CATALOG_HERO_OVERLAY,
            ),
          } as CSSProperties
        }
      >
        <div className="catalog-hero-inner">
          <img
            src="/brochure/aromaz-logo-transparent.png"
            alt="Aromaz"
            className="catalog-hero-logo"
          />
          <p>Product Catalog</p>
          <h1>Aromaz Collection</h1>
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
      </section>

      <section className="catalog-parallax" aria-label="Aromaz catalog items">
        {BROCHURE_PRODUCTS.map((product, index) => (
          <article className="catalog-panel" key={product.name}>
            <div
              className="catalog-panel-backdrop"
              style={
                {
                  backgroundImage: getCssBackgroundImage(
                    product.background,
                    CATALOG_PANEL_OVERLAY,
                  ),
                } as CSSProperties
              }
              aria-hidden="true"
            />
            <div className="catalog-panel-content">
              <div className="catalog-panel-product" aria-hidden="true">
                <img src={product.image} alt="" loading="lazy" />
              </div>
              <div className="catalog-panel-card">
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
          </article>
        ))}
      </section>
    </main>
  );
}
