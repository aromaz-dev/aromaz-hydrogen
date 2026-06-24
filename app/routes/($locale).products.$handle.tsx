import React from 'react';
import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).products.$handle';
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
import {
  JudgeMeReviews,
  type JudgeMeReview,
} from '~/components/JudgeMeReviews';
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
  PRODUCT_HANDLES,
} from '~/config/products';
import {ProductVideoSection} from '~/components/ProductVideoSection';

const DEODORANT_HANDLES = new Set([
  PRODUCT_HANDLES.REFILLABLE_NATURAL_DEODORANT,
]);

const PRODUCT_SHOWCASE_VIDEOS: Record<string, {src: string; poster?: string}> =
  {
    [PRODUCT_HANDLES.REFILLABLE_NATURAL_DEODORANT]: {
      src: '/videos/video-7.mp4',
      poster: '/images/video-7-poster.jpg',
    },
  };

type ProductVariantJsonLdInput = {
  id?: string | null;
  title?: string | null;
  sku?: string | null;
  availableForSale?: boolean | null;
  image?: {url?: string | null} | null;
  price?: {amount?: string | null; currencyCode?: string | null} | null;
  selectedOptions?: Array<{name?: string | null; value?: string | null}> | null;
};

const DEFAULT_JUDGEME_SHOP_DOMAIN = 'w1sxd0-di.myshopify.com';
const JUDGEME_REFILLABLE_DEODORANT_REVIEW_HANDLES = [
  'refillable-and-natural-deodorant',
  'deodorant-refill',
  'beauty-example-product-3',
  'beauty-example-product-4',
];
const JUDGEME_MINI_DEODORANT_REVIEW_HANDLES = [
  'mini-deodorant',
  'mini-natural-deodorant',
  'beauty-example-product-2',
];
const JUDGEME_LIP_BALM_REVIEW_HANDLES = [
  'refresh-renew-bundle',
  'lip-balm',
];
const JUDGEME_LOOFAH_SOAP_REVIEW_HANDLES = [
  'natural-loofah-soap',
  'beauty-example-product-1',
];

type JudgeMeApiReview = {
  id?: number | string;
  rating?: number | string;
  title?: string | null;
  body?: string | null;
  product_external_id?: number | string | null;
  product_handle?: string | null;
  published?: boolean | null;
  hidden?: boolean | null;
  reviewer_name?: string | null;
  name?: string | null;
  reviewer?: {
    name?: string | null;
  } | null;
  created_at?: string | null;
};

type JudgeMeApiResponse =
  | {
      reviews?: JudgeMeApiReview[];
      data?: {reviews?: JudgeMeApiReview[]};
    }
  | JudgeMeApiReview[];

function getNumericShopifyId(gid: string) {
  return gid.split('/').pop() || gid;
}

function getJudgeMeResponseReviews(response: JudgeMeApiResponse) {
  if (Array.isArray(response)) return response;
  return response.reviews || response.data?.reviews || [];
}

function getJudgeMeShopDomains(shopDomain?: string) {
  return Array.from(
    new Set(
      [shopDomain, DEFAULT_JUDGEME_SHOP_DOMAIN].filter(Boolean) as string[],
    ),
  );
}

function getJudgeMeProductHandles(productHandle: string) {
  if (JUDGEME_REFILLABLE_DEODORANT_REVIEW_HANDLES.includes(productHandle)) {
    return JUDGEME_REFILLABLE_DEODORANT_REVIEW_HANDLES;
  }

  if (JUDGEME_MINI_DEODORANT_REVIEW_HANDLES.includes(productHandle)) {
    return JUDGEME_MINI_DEODORANT_REVIEW_HANDLES;
  }

  if (JUDGEME_LIP_BALM_REVIEW_HANDLES.includes(productHandle)) {
    return JUDGEME_LIP_BALM_REVIEW_HANDLES;
  }

  if (JUDGEME_LOOFAH_SOAP_REVIEW_HANDLES.includes(productHandle)) {
    return JUDGEME_LOOFAH_SOAP_REVIEW_HANDLES;
  }

  return [productHandle];
}

function dedupeJudgeMeReviews(reviews: JudgeMeReview[]) {
  return Array.from(
    new Map(reviews.map((review) => [review.id, review])).values(),
  );
}

function normalizeJudgeMeReview(
  review: JudgeMeApiReview,
  index: number,
): JudgeMeReview | null {
  const rating = Number(review.rating || 0);
  if (!rating) return null;

  return {
    id: String(review.id || `review-${index}`),
    rating,
    title: review.title || undefined,
    body: review.body || undefined,
    reviewerName:
      review.reviewer_name || review.name || review.reviewer?.name || undefined,
    createdAt: review.created_at || undefined,
  };
}

async function loadJudgeMeReviews({
  productId,
  productHandle,
  apiToken,
  shopDomain,
}: {
  productId: string;
  productHandle: string;
  apiToken?: string;
  shopDomain?: string;
}) {
  if (!apiToken) return [];

  const numericId = getNumericShopifyId(productId);
  const productHandles = getJudgeMeProductHandles(productHandle);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    for (const domain of getJudgeMeShopDomains(shopDomain)) {
      const url = new URL('https://judge.me/api/v1/reviews');
      url.searchParams.set('api_token', apiToken);
      url.searchParams.set('shop_domain', domain);
      url.searchParams.set('per_page', '100');

      const response = await fetch(url, {
        headers: {accept: 'application/json'},
        signal: controller.signal,
      });

      if (!response.ok) continue;

      const data = (await response.json()) as JudgeMeApiResponse;
      const reviews = getJudgeMeResponseReviews(data)
        .filter((review) => {
          const reviewProductId =
            review.product_external_id == null
              ? ''
              : String(review.product_external_id);

          return (
            review.published !== false &&
            review.hidden !== true &&
            (reviewProductId === numericId ||
              productHandles.includes(review.product_handle || ''))
          );
        })
        .map(normalizeJudgeMeReview)
        .filter(Boolean) as JudgeMeReview[];

      return dedupeJudgeMeReviews(reviews);
    }

    return [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

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
    judgeMeReviews: await loadJudgeMeReviews({
      productId: product.id,
      productHandle: product.handle,
      apiToken: context.env.JUDGEME_API_TOKEN,
      shopDomain: context.env.JUDGEME_SHOP_DOMAIN,
    }),
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
  const {product, judgeMeReviews} = useLoaderData<typeof loader>();

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

  const showcaseVideo = DEODORANT_HANDLES.has(product.handle)
    ? PRODUCT_SHOWCASE_VIDEOS[product.handle]
    : null;

  return (
    <div className="product-page min-h-screen bg-cream">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <ProductImage image={selectedVariant?.image} />
        <div className="product-mobile-details px-6 pt-4 pb-6">
          <h1 className="font-serif text-3xl text-charcoal">{title}</h1>
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
              <h1 className="font-serif text-5xl leading-tight text-charcoal">
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

      <div className="px-6 pb-12 md:max-w-6xl md:mx-auto md:px-8">
        <JudgeMeReviews reviews={judgeMeReviews} />
      </div>

      {showcaseVideo && (
        <ProductVideoSection src={showcaseVideo.src} poster={showcaseVideo.poster} />
      )}

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              currency: selectedVariant?.price.currencyCode || 'CAD',
              vendor: product.vendor || 'Aromaz',
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

const TRUST_BADGES = [
  {icon: '🍃', label: 'Natural Scent'},
  {icon: '♻️', label: 'Refill Minded'},
  {icon: '🇨🇦', label: 'Canadian'},
] as const;

function ProductTrustNotes() {
  return (
    <div className="mt-8 border-y border-charcoal/10 py-4">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          flexWrap: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {TRUST_BADGES.map((badge, i) => (
          <React.Fragment key={badge.label}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3em',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 'clamp(9px, 2.4vw, 11px)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--color-olive)',
                flexShrink: 0,
              }}
            >
              <span style={{fontSize: '1.1em'}}>{badge.icon}</span>
              {badge.label}
            </span>
            {i < TRUST_BADGES.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  color: 'var(--color-olive)',
                  opacity: 0.35,
                  fontSize: 'clamp(9px, 2.4vw, 11px)',
                  padding: '0 0.6em',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                •
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
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
