import type {Route} from './+types/collections.all';
import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {
  DEFAULT_STORE_URL,
  SEO_KEYWORDS,
  SITE_NAME,
  getBreadcrumbJsonLd,
  getCanonicalUrl,
  getStoreUrl,
} from '~/lib/seo';
import {getPublicProductHandle} from '~/config/products';

const SHOP_TITLE = 'Shop Natural Deodorant, Loofah Soap and Lip Care | Aromaz';
const SHOP_DESCRIPTION =
  'Shop Aromaz refillable natural deodorant, botanical deodorant refills, natural loofah soap, and lip care for sensitive skin in Vancouver, Canada, and the United States.';

export const meta: Route.MetaFunction = ({data}) => {
  const storeUrl = data?.storeUrl ?? DEFAULT_STORE_URL;
  const canonicalUrl = getCanonicalUrl('/collections/all', storeUrl);
  const products = data?.products?.nodes ?? [];

  return [
    {title: SHOP_TITLE},
    {name: 'description', content: SHOP_DESCRIPTION},
    {name: 'keywords', content: SEO_KEYWORDS},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: SHOP_TITLE},
    {property: 'og:description', content: SHOP_DESCRIPTION},
    {property: 'og:url', content: canonicalUrl},
    {property: 'og:image', content: getCanonicalUrl('/hero-bg.jpg', storeUrl)},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: SHOP_TITLE},
    {name: 'twitter:description', content: SHOP_DESCRIPTION},
    {tagName: 'link', rel: 'canonical', href: canonicalUrl},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        name: SHOP_TITLE,
        description: SHOP_DESCRIPTION,
        url: canonicalUrl,
        isPartOf: {
          '@id': `${getCanonicalUrl('/', storeUrl)}#website`,
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: products
            .slice(0, 12)
            .map((product: CollectionItemFragment, index: number) => {
              const productUrl = getCanonicalUrl(
                `/products/${getPublicProductHandle(product.handle)}`,
                storeUrl,
              );
              const image = product.featuredImage?.url;

              return {
                '@type': 'ListItem',
                position: index + 1,
                url: productUrl,
                item: {
                  '@type': 'Product',
                  '@id': `${productUrl}#product`,
                  name: product.title,
                  url: productUrl,
                  category: 'Natural personal care',
                  ...(image ? {image} : {}),
                  brand: {
                    '@type': 'Brand',
                    name: SITE_NAME,
                  },
                  offers: {
                    '@type': 'Offer',
                    price: product.priceRange.minVariantPrice.amount,
                    priceCurrency:
                      product.priceRange.minVariantPrice.currencyCode,
                    availability: 'https://schema.org/InStock',
                    url: productUrl,
                    seller: {
                      '@id': `${getCanonicalUrl('/', storeUrl)}#organization`,
                    },
                  },
                },
              };
            }),
        },
      },
    },
    {
      'script:ld+json': getBreadcrumbJsonLd(
        [
          {name: 'Home', path: '/'},
          {name: 'Shop', path: '/collections/all'},
        ],
        storeUrl,
      ),
    },
  ];
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
  return {
    products,
    storeUrl: getStoreUrl(request, context.env.PUBLIC_STORE_DOMAIN),
  };
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
          <h1>Everyday care with natural ingredients and refillable design</h1>
          <span>
            Explore refillable natural deodorant, reusable cases, botanical
            scent refills, loofah soap, and lip care made for everyday comfort.
          </span>
          <div className="shop-hero-actions">
            <Link to="/products/refillable-deodorant/customize">
              Build deodorant
            </Link>
            <Link to="/catalog">View catalog</Link>
          </div>
        </div>
      </section>

      <section className="shop-grid-shell">
        <div className="shop-grid-heading">
          <div>
            <p>{productCount} products</p>
            <h2>Shop the collection</h2>
          </div>
          <span>
            Find deodorant refills, natural cosmetics, gentle body care, and
            checkout-ready essentials in one organized shop.
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
