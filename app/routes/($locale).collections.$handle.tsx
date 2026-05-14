import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {
  DEFAULT_STORE_URL,
  SEO_KEYWORDS,
  SITE_NAME,
  getCanonicalUrl,
  getSeoDescription,
  getStoreUrl,
} from '~/lib/seo';
import {getPublicProductHandle} from '~/config/products';

export const meta: Route.MetaFunction = ({data}) => {
  const collection = data?.collection;
  const storeUrl = data?.storeUrl ?? DEFAULT_STORE_URL;
  const title = collection
    ? `${collection.title} | Natural Cosmetics by Aromaz`
    : 'Aromaz Natural Cosmetics Collection';
  const description = getSeoDescription(
    collection?.description,
    'Shop Aromaz natural deodorant, refillable scent care, loofah soap, and lip care for sensitive daily routines.',
  );
  const canonicalUrl = getCanonicalUrl(
    `/collections/${collection?.handle ?? ''}`,
    storeUrl,
  );

  return [
    {title},
    {name: 'description', content: description},
    {name: 'keywords', content: SEO_KEYWORDS},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:url', content: canonicalUrl},
    {tagName: 'link', rel: 'canonical', href: canonicalUrl},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: collection?.title ?? 'Aromaz collection',
        description,
        url: canonicalUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: (collection?.products.nodes ?? [])
            .slice(0, 12)
            .map((product: ProductItemFragment, index: number) => {
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
                  name: product.title,
                  url: productUrl,
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
                  },
                },
              };
            }),
        },
      },
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
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections/all');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
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
  const {collection} = useLoaderData<typeof loader>();

  return (
    <div className="collection">
      <section className="collection-hero">
        <p>Shop Aromaz</p>
        <h1>{collection.title}</h1>
        {collection.description && (
          <div className="collection-description">{collection.description}</div>
        )}
      </section>
      <PaginatedResourceSection<ProductItemFragment>
        connection={collection.products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
