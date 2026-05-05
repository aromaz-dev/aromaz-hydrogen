import type {Route} from './+types/collections.all';
import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [{title: `Aromaz | Shop Natural Scent Care`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();
  const productCount = products.nodes.length;

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div className="shop-hero-copy">
          <p>Shop Aromaz</p>
          <h1>Natural scent care for refillable daily routines.</h1>
          <span>
            Explore deodorant refills, reusable cases, loofah soap, and lip
            care with clear product imagery and simple paths to buy.
          </span>
          <div className="shop-hero-actions">
            <Link to="/products/refillable-deodorant/customize">
              Build deodorant
            </Link>
            <Link to="/catalog">View catalog</Link>
          </div>
        </div>
        <div className="shop-hero-media" aria-hidden="true">
          <img
            src="/aromaz-products/deodorant-eco-case.png"
            alt=""
            loading="eager"
          />
          <img src="/aromaz-products/deodorant-refill.png" alt="" />
          <img src="/aromaz-products/lip-balm.png" alt="" />
        </div>
      </section>

      <section className="shop-filter-band" aria-label="Shop shortcuts">
        <Link to="/products/refillable-deodorant/customize">
          Refillable deodorant
        </Link>
        <Link to="/catalog">Scent catalog</Link>
        <Link to="/search?q=soap">Loofah soap</Link>
        <Link to="/search?q=lip%20balm">Lip balm</Link>
      </section>

      <section className="shop-grid-shell">
        <div className="shop-grid-heading">
          <div>
            <p>{productCount} products</p>
            <h2>Shop the collection</h2>
          </div>
          <span>
            Product-first cards with prices, clear imagery, and quick paths to
            the items that matter most.
          </span>
        </div>
        <PaginatedResourceSection<CollectionItemFragment>
          connection={products}
          resourcesClassName="products-grid shop-products-grid"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      </section>
    </main>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
