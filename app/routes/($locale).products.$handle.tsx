import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ScentProductForm} from '~/components/ScentProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {isScentProduct} from '~/lib/scent-utils';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Aromaz | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
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

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Check if this is a scent product (needs all variants for optimistic updates)
  const isScent = isScentProduct(product.variants?.nodes || []);

  // For scent products, use ALL variants for optimistic lookup
  // (adjacentVariants only includes variants differing by one option)
  const variantsForOptimistic = isScent
    ? product.variants?.nodes || []
    : getAdjacentAndFirstAvailableVariants(product);

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    variantsForOptimistic,
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  return (
    <div className="product-page min-h-screen bg-cream">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <ProductImage image={selectedVariant?.image} />
        <div className="px-6 py-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-olive">
            Aromaz care
          </p>
          <h1 className="mt-2 font-serif text-3xl text-charcoal">{title}</h1>
          {!isScent && (
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          )}
          {isScent ? (
            <ScentProductForm
              product={product}
              selectedVariant={selectedVariant}
            />
          ) : (
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          )}
          <ProductTrustNotes />
          {descriptionHtml && (
            <div className="mt-10 pt-8 border-t border-charcoal/10">
              <h2 className="font-serif text-lg text-charcoal mb-4">
                Description
              </h2>
              <div
                className="font-sans text-base text-charcoal/80 leading-relaxed prose prose-sm"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-2 gap-12">
            {/* Left: Sticky Image */}
            <div className="sticky top-24 self-start">
              <ProductImage image={selectedVariant?.image} />
            </div>

            {/* Right: Product Info */}
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-olive">
                Aromaz care
              </p>
              <h1 className="mt-3 font-serif text-5xl leading-tight text-charcoal">
                {title}
              </h1>
              {!isScent && (
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
              )}
              {isScent ? (
                <ScentProductForm
                  product={product}
                  selectedVariant={selectedVariant}
                />
              ) : (
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />
              )}
              <ProductTrustNotes />
              {descriptionHtml && (
                <div className="mt-12 pt-10 border-t border-charcoal/10">
                  <h2 className="font-serif text-xl text-charcoal mb-4">
                    Description
                  </h2>
                  <div
                    className="font-sans text-base text-charcoal/80 leading-relaxed prose"
                    dangerouslySetInnerHTML={{__html: descriptionHtml}}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function ProductTrustNotes() {
  return (
    <div className="mt-8 grid grid-cols-3 gap-3 border-y border-charcoal/10 py-4">
      {['Natural scent', 'Refill-minded', 'Daily comfort'].map((note) => (
        <div key={note}>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-olive">
            {note}
          </p>
        </div>
      ))}
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
