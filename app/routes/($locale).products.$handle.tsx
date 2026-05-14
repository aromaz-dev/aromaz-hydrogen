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
import {
  DEFAULT_STORE_URL,
  SEO_KEYWORDS,
  SITE_NAME,
  getBreadcrumbJsonLd,
  getCanonicalUrl,
  getSeoDescription,
  getStoreUrl,
} from '~/lib/seo';
import {
  getPublicProductHandle,
  getShopifyProductHandle,
} from '~/config/products';

type ProductVariantJsonLdInput = {
  id?: string | null;
  title?: string | null;
  sku?: string | null;
  availableForSale?: boolean | null;
  image?: {url?: string | null} | null;
  price?: {amount?: string | null; currencyCode?: string | null} | null;
  selectedOptions?: Array<{name?: string | null; value?: string | null}> | null;
};

function getSchemaId(value?: string | null) {
  return encodeURIComponent(
    (value || 'item')
      .replace(/^gid:\/\/shopify\/[^/]+\//, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase(),
  );
}

function getProductCategory(title?: string | null) {
  const value = title?.toLowerCase() ?? '';

  if (value.includes('deodorant') || value.includes('refill')) {
    return 'Natural deodorant';
  }

  if (value.includes('loofah') || value.includes('soap')) {
    return 'Natural loofah soap';
  }

  if (value.includes('balm') || value.includes('lip')) {
    return 'Natural lip care';
  }

  return 'Natural cosmetics';
}

function getOptionJsonLd(
  selectedOptions?: ProductVariantJsonLdInput['selectedOptions'],
) {
  const schemaProperties: Record<string, string> = {};
  const additionalProperty: Array<Record<string, string>> = [];

  selectedOptions?.forEach((option) => {
    if (!option.name || !option.value) return;

    const name = option.name.toLowerCase();

    if (name.includes('color') || name.includes('colour')) {
      schemaProperties.color = option.value;
      return;
    }

    if (name.includes('size')) {
      schemaProperties.size = option.value;
      return;
    }

    if (name.includes('material')) {
      schemaProperties.material = option.value;
      return;
    }

    if (name.includes('pattern')) {
      schemaProperties.pattern = option.value;
      return;
    }

    additionalProperty.push({
      '@type': 'PropertyValue',
      name: option.name,
      value: option.value,
    });
  });

  return {schemaProperties, additionalProperty};
}

function getOfferJsonLd({
  variant,
  canonicalUrl,
  storeUrl,
}: {
  variant?: ProductVariantJsonLdInput | null;
  canonicalUrl: string;
  storeUrl: string;
}) {
  return {
    '@type': 'Offer',
    '@id': `${canonicalUrl}#offer-${getSchemaId(variant?.sku || variant?.id)}`,
    url: canonicalUrl,
    price: variant?.price?.amount ?? '0',
    priceCurrency: variant?.price?.currencyCode ?? 'CAD',
    availability: variant?.availableForSale
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: {
      '@id': `${getCanonicalUrl('/', storeUrl)}#organization`,
    },
  };
}

function getVariantJsonLd({
  productTitle,
  variant,
  description,
  canonicalUrl,
  storeUrl,
  fallbackImage,
  productGroupID,
}: {
  productTitle: string;
  variant: ProductVariantJsonLdInput;
  description: string;
  canonicalUrl: string;
  storeUrl: string;
  fallbackImage?: string | null;
  productGroupID: string;
}) {
  const variantTitle =
    variant.title && variant.title !== 'Default Title'
      ? `${productTitle} - ${variant.title}`
      : productTitle;
  const {schemaProperties, additionalProperty} = getOptionJsonLd(
    variant.selectedOptions,
  );
  const image = variant.image?.url || fallbackImage;

  return {
    '@type': 'Product',
    '@id': `${canonicalUrl}#variant-${getSchemaId(
      variant.sku || variant.id || variant.title,
    )}`,
    name: variantTitle,
    description,
    sku: variant.sku || variant.id,
    inProductGroupWithID: productGroupID,
    ...(image ? {image: [image]} : {}),
    ...schemaProperties,
    additionalProperty: [
      ...additionalProperty,
      {
        '@type': 'PropertyValue',
        name: 'Shopping region',
        value: 'Canada and United States',
      },
    ],
    offers: getOfferJsonLd({variant, canonicalUrl, storeUrl}),
  };
}

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  const storeUrl = data?.storeUrl ?? DEFAULT_STORE_URL;
  const title = product?.seo?.title || product?.title || 'Aromaz product';
  const fullTitle = title.includes('Aromaz') ? title : `${title} | Aromaz`;
  const description = getSeoDescription(
    product?.seo?.description || product?.description,
    'Shop Aromaz natural deodorant, refillable scent care, botanical cosmetics, loofah soap, and lip care.',
  );
  const canonicalUrl = getCanonicalUrl(
    `/products/${product ? getPublicProductHandle(product.handle) : ''}`,
    storeUrl,
  );
  const selectedVariant = product?.selectedOrFirstAvailableVariant;
  const image = selectedVariant?.image?.url;
  const productGroupID = product?.id ?? product?.handle ?? canonicalUrl;
  const variants = product?.variants.nodes ?? [];
  const productSchema =
    product && variants.length > 1
      ? {
          '@context': 'https://schema.org',
          '@type': 'ProductGroup',
          '@id': `${canonicalUrl}#product-group`,
          name: product.title,
          description,
          url: canonicalUrl,
          productGroupID,
          category: getProductCategory(product.title),
          brand: {
            '@type': 'Brand',
            name: SITE_NAME,
          },
          manufacturer: {
            '@id': `${getCanonicalUrl('/', storeUrl)}#organization`,
          },
          hasVariant: variants
            .slice(0, 50)
            .map((variant: ProductVariantJsonLdInput) =>
              getVariantJsonLd({
                productTitle: product.title,
                variant,
                description,
                canonicalUrl,
                storeUrl,
                fallbackImage: image,
                productGroupID,
              }),
            ),
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Product focus',
              value: 'Refillable natural personal care',
            },
          ],
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `${canonicalUrl}#product`,
          name: product?.title ?? 'Aromaz product',
          description,
          sku: selectedVariant?.sku || product?.handle,
          url: canonicalUrl,
          category: getProductCategory(product?.title),
          ...(image ? {image: [image]} : {}),
          brand: {
            '@type': 'Brand',
            name: SITE_NAME,
          },
          manufacturer: {
            '@id': `${getCanonicalUrl('/', storeUrl)}#organization`,
          },
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Shopping region',
              value: 'Canada and United States',
            },
          ],
          offers: getOfferJsonLd({
            variant: selectedVariant,
            canonicalUrl,
            storeUrl,
          }),
        };

  return [
    {title: fullTitle},
    {name: 'description', content: description},
    {name: 'keywords', content: SEO_KEYWORDS},
    {property: 'og:type', content: 'product'},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: fullTitle},
    {property: 'og:description', content: description},
    {property: 'og:url', content: canonicalUrl},
    ...(image ? [{property: 'og:image', content: image}] : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: fullTitle},
    {name: 'twitter:description', content: description},
    ...(image ? [{name: 'twitter:image', content: image}] : []),
    {
      tagName: 'link',
      rel: 'canonical',
      href: canonicalUrl,
    },
    {
      'script:ld+json': productSchema,
    },
    {
      'script:ld+json': getBreadcrumbJsonLd(
        [
          {name: 'Home', path: '/'},
          {name: 'Shop', path: '/collections/all'},
          {
            name: product?.title ?? 'Product',
            path: `/products/${product ? getPublicProductHandle(product.handle) : ''}`,
          },
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
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const storefrontHandle = getShopifyProductHandle(handle);

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: storefrontHandle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const publicHandle = getPublicProductHandle(product.handle);

  if (handle === product.handle && publicHandle !== product.handle) {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(handle, publicHandle);
    throw redirect(url.toString());
  }

  // The API handle might be localized, so redirect to the localized handle.
  // Public Aromaz aliases intentionally stay on the customer-facing URL.
  if (handle === storefrontHandle) {
    redirectIfHandleIsLocalized(request, {handle, data: product});
  }

  return {
    product,
    storeUrl: getStoreUrl(request, context.env.PUBLIC_STORE_DOMAIN),
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
