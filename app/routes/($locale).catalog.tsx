import {Link} from 'react-router';
import type {CSSProperties} from 'react';
import type {Route} from './+types/catalog';
import {BROCHURE_PRODUCTS} from '~/lib/brochure-products';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Aromaz Product Catalog | Refillable Natural Scent Care'},
    {
      name: 'description',
      content:
        'Explore the Aromaz product catalog with refillable deodorant scents, natural loofah soap, and lip care essentials.',
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
            '--catalog-hero-bg': `url(${BROCHURE_PRODUCTS[1].background})`,
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
            essentials from the Aromaz brochure, rebuilt as a scrollable store
            experience.
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
          <article
            className="catalog-panel"
            key={product.name}
            style={
              {
                '--catalog-panel-bg': `url(${product.background})`,
              } as CSSProperties
            }
          >
            <div className="catalog-panel-backdrop" aria-hidden="true" />
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
                <Link to={product.href}>
                  {product.category.includes('Deodorant')
                    ? `Build ${product.name}`
                    : 'Add to cart'}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
