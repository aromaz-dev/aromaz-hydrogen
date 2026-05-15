import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useEffect, useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {BROCHURE_PRODUCTS} from '~/lib/brochure-products';
import {
  DEFAULT_STORE_URL,
  SEO_KEYWORDS,
  SITE_NAME,
  getCanonicalUrl,
  getOrganizationJsonLd,
  getStoreUrl,
  getWebSiteJsonLd,
} from '~/lib/seo';

const HOME_TITLE =
  'Natural Deodorant and Clean Cosmetics in Vancouver | Aromaz';
const HOME_DESCRIPTION =
  'Shop Aromaz refillable natural deodorant, botanical scent refills, natural loofah soap, and lip care for sensitive daily routines in Vancouver, Canada, and the United States.';

export const meta: Route.MetaFunction = ({data}) => {
  const storeUrl = data?.storeUrl ?? DEFAULT_STORE_URL;
  const canonicalUrl = getCanonicalUrl('/', storeUrl);
  const imageUrl = getCanonicalUrl('/hero-bg.jpg', storeUrl);

  return [
    {title: HOME_TITLE},
    {name: 'description', content: HOME_DESCRIPTION},
    {name: 'keywords', content: SEO_KEYWORDS},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: HOME_TITLE},
    {property: 'og:description', content: HOME_DESCRIPTION},
    {property: 'og:url', content: canonicalUrl},
    {property: 'og:image', content: imageUrl},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: HOME_TITLE},
    {name: 'twitter:description', content: HOME_DESCRIPTION},
    {name: 'twitter:image', content: imageUrl},
    {tagName: 'link', rel: 'canonical', href: canonicalUrl},
    {
      'script:ld+json': getOrganizationJsonLd(storeUrl),
    },
    {
      'script:ld+json': getWebSiteJsonLd(storeUrl),
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
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
    storeUrl: getStoreUrl(request, context.env.PUBLIC_STORE_DOMAIN),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <Hero />
      <RecommendedProducts products={data.recommendedProducts} />
      <BrandStory />
      <IngredientsShowcase />
    </div>
  );
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const image = imageRef.current;
    const copy = copyRef.current;
    const actions = actionsRef.current;
    const proof = proofRef.current;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (!hero || !image || !copy || !actions || !proof || reduceMotion) {
      return;
    }

    let frame = 0;

    const updateParallax = () => {
      frame = 0;
      const heroTop = hero.offsetTop;
      const heroHeight = hero.offsetHeight || window.innerHeight;
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - heroTop) / heroHeight),
      );
      const isCompact = window.matchMedia('(max-width: 900px)').matches;

      image.style.transform = `translate3d(0, ${-10 + progress * 24}%, 0) scale(${
        1.08 + progress * 0.18
      })`;
      copy.style.transform = `translate3d(0, ${progress * -32}px, 0)`;
      copy.style.opacity = `${1 - progress * 0.12}`;

      const actionsStopY = Math.max(
        0,
        heroHeight -
          copy.offsetTop -
          actions.offsetTop -
          actions.offsetHeight -
          Math.min(220, heroHeight * 0.24),
      );
      const actionY = Math.min(actionsStopY, progress * actionsStopY * 2.1);
      actions.style.transform = `translate3d(0, ${actionY}px, 0)`;
      actions.style.opacity = `${Math.max(0, 1 - Math.max(0, progress - 0.76) / 0.24)}`;

      if (isCompact) {
        proof.style.transform = `translate3d(0, ${actionY}px, 0)`;
        proof.style.opacity = '1';
      } else {
        const proofY = Math.max(-120, progress * -220);
        proof.style.transform = `translate3d(0, ${proofY}px, 0)`;
        proof.style.opacity = `${Math.max(0, 1 - Math.max(0, progress - 0.34) / 0.18)}`;
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', requestUpdate, {passive: true});
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <section className="home-hero home-hero-parallax" ref={heroRef}>
      <div className="home-hero-media absolute inset-0 z-0">
        <img
          ref={imageRef}
          src="/hero-bg.jpg"
          alt="Aromaz refillable natural personal care products"
          className="home-hero-image w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(32,35,34,0.78),rgba(32,35,34,0.42),rgba(249,244,238,0.12))]"
          aria-hidden="true"
        />
      </div>

      <div className="home-hero-content relative z-10 mx-auto flex min-h-[calc(100svh-64px)] max-w-7xl items-center px-6 py-16 md:px-10 lg:px-16">
        <div className="home-hero-copy max-w-2xl" ref={copyRef}>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-clay">
            Natural refillable deodorant
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-[0.98] text-cream md:text-7xl lg:text-8xl">
            Natural deodorant, made cleaner.
          </h1>
          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-cream/85 md:text-xl">
            Build a refillable deodorant ritual with a durable case, botanical
            scents, and flexible refill plans for sensitive daily routines in
            Vancouver, Canada, and across the United States.
          </p>
          <div
            className="home-hero-actions mt-9 flex flex-col gap-3 sm:flex-row"
            ref={actionsRef}
          >
            <Link
              to="/products/refillable-deodorant/customize"
              className="inline-flex min-h-14 items-center justify-center rounded-md bg-cream px-8 font-sans text-sm font-bold uppercase tracking-[0.12em] text-charcoal shadow-xl shadow-charcoal/30 transition-colors hover:bg-terracotta hover:text-cream"
            >
              Build your deodorant
            </Link>
            <Link
              to="/collections/all"
              className="home-hero-secondary-cta inline-flex min-h-14 items-center justify-center rounded-md px-8 font-sans text-sm font-bold uppercase tracking-[0.12em]"
            >
              Shop all
            </Link>
          </div>
        </div>

        <div
          className="home-proof-strip absolute bottom-6 left-6 right-6 z-10 text-cream/90 md:left-auto md:right-10 md:w-[440px]"
          ref={proofRef}
        >
          <div className="home-proof-grid">
            <div className="home-proof">
              <span>Refillable</span>
              <small>Less single-use packaging</small>
            </div>
            <div className="home-proof">
              <span>Botanical</span>
              <small>Scent-forward formulas</small>
            </div>
            <div className="home-proof">
              <span>Flexible</span>
              <small>One-time or subscribe</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  const storySectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = storySectionRef.current;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (!section || reduceMotion) return;

    const rows = Array.from(
      section.querySelectorAll<HTMLElement>('.home-story-row'),
    );
    let frame = 0;

    const updateStoryParallax = () => {
      frame = 0;
      const viewportHeight = window.innerHeight || 1;

      rows.forEach((row) => {
        const copy = row.querySelector<HTMLElement>('.home-story-copy');
        const media = row.querySelector<HTMLElement>('.home-story-media');
        const image = row.querySelector<HTMLImageElement>(
          '.home-story-media img',
        );
        if (!copy || !media || !image) return;

        const rect = row.getBoundingClientRect();
        const progress = Math.min(
          1,
          Math.max(
            0,
            (viewportHeight - rect.top) / (viewportHeight + rect.height),
          ),
        );

        const copyY = -74 + progress * 160;
        const mediaY = 42 - progress * 84;
        const imageScale = 1.02 + progress * 0.1;
        const imageY = -8 + progress * 4;

        copy.style.transform = `translate3d(0, ${copyY}px, 0)`;
        copy.style.opacity = `${0.72 + Math.min(progress, 0.65) * 0.43}`;
        media.style.transform = `translate3d(0, ${mediaY}px, 0)`;
        image.style.transform = `translate3d(0, ${imageY}%, 0) scale(${imageScale})`;
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateStoryParallax);
    };

    updateStoryParallax();
    window.addEventListener('scroll', requestUpdate, {passive: true});
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  const stories = [
    {
      title: 'A refined refill ritual',
      description:
        'Aromaz pairs refillable deodorant cases with botanical scent refills, creating a simple routine that looks polished on the shelf and feels easy to keep using.',
      image: '/brand-story/artisanal-craft.jpg',
      imageAlt: 'Amber bottle with natural personal care ingredients',
      imageLeft: true,
    },
    {
      title: 'Ingredient clarity',
      description:
        'Clear scent notes, natural ingredients, and straightforward product details help you choose confidently without guessing what belongs in your daily care routine.',
      image: '/brand-story/natural-ingredients.jpg',
      imageAlt: 'Natural ingredients in their pure state',
      imageLeft: false,
    },
    {
      title: 'Less waste, more polish',
      description:
        'A durable case and replaceable refills help reduce single-use packaging while keeping the experience refined, practical, and ready for everyday use.',
      image: '/brand-story/mediterranean-landscape.jpg',
      imageAlt: 'Mediterranean landscape and sustainable farming',
      imageLeft: true,
    },
  ];

  return (
    <section className="bg-off-white" ref={storySectionRef}>
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:px-16">
        <div className="mb-12 max-w-2xl">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-olive">
            Clean premium care
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
            Built for the bathroom shelf and the daily routine.
          </h2>
        </div>
      </div>
      <div>
        {stories.map((story, index) => (
          <div
            key={story.title}
            className={`px-6 py-12 md:px-10 md:py-16 lg:px-16 ${
              index % 2 === 0 ? 'bg-cream' : 'bg-off-white'
            }`}
          >
            <div className="mx-auto max-w-7xl">
              <div
                className={`home-story-row grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center ${
                  story.imageLeft ? '' : 'md:grid-flow-dense'
                }`}
              >
                <div className={story.imageLeft ? 'md:order-1' : 'md:order-2'}>
                  <div className="home-story-media aspect-square rounded-lg overflow-hidden shadow-lg group">
                    <img
                      src={story.image}
                      alt={story.imageAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div
                  className={`home-story-copy ${
                    story.imageLeft ? 'md:order-2' : 'md:order-1'
                  }`}
                >
                  <h3 className="font-serif text-3xl md:text-5xl text-charcoal mb-5 leading-tight">
                    {story.title}
                  </h3>
                  <p className="font-sans text-lg md:text-xl text-charcoal/80 leading-relaxed">
                    {story.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function IngredientsShowcase() {
  const ingredients = [
    {
      name: 'Lavender',
      origin: 'Herbal floral',
      benefit: 'Calm, clean, familiar',
      image: '/ingredients/lavender.jpg',
    },
    {
      name: 'Argan Oil',
      origin: 'Soft warmth',
      benefit: 'Comforting and smooth',
      image: '/ingredients/argan.jpg',
    },
    {
      name: 'Shea Butter',
      origin: 'Skin comfort',
      benefit: 'Rich daily care',
      image: '/ingredients/shea-butter.jpg',
    },
    {
      name: 'Rose',
      origin: 'Fresh floral',
      benefit: 'Light and polished',
      image: '/ingredients/rose.jpg',
    },
    {
      name: 'Olive Oil',
      origin: 'Green softness',
      benefit: 'Grounded and clean',
      image: '/ingredients/olives.jpg',
    },
    {
      name: 'Chamomile',
      origin: 'Gentle herbal',
      benefit: 'Quiet and balanced',
      image: '/ingredients/chamomile.jpg',
    },
  ];

  return (
    <section className="bg-cream py-16 md:py-24 px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-olive">
              Scent library
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-charcoal">
              Natural notes with everyday restraint.
            </h2>
          </div>
          <p className="font-sans text-base md:text-lg text-charcoal/70">
            Explore botanical notes chosen for gentle daily freshness, from soft
            florals to herbal comfort and warm, grounded scent families.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
          {ingredients.map((ingredient) => (
            <div key={ingredient.name} className="ingredient-tile group">
              <div className="ingredient-image">
                <img
                  src={ingredient.image}
                  alt={`${ingredient.name} scent inspiration`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="font-serif text-xl text-charcoal">
                {ingredient.name}
              </h3>
              <p className="font-sans text-xs uppercase tracking-[0.16em] text-olive">
                {ingredient.origin}
              </p>
              <p className="font-sans text-sm text-charcoal/70">
                {ingredient.benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  const shopSectionRef = useRef<HTMLElement>(null);
  const shopHeaderRef = useRef<HTMLDivElement>(null);
  const shopGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = shopSectionRef.current;
    const header = shopHeaderRef.current;
    const grid = shopGridRef.current;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (!section || !header || !grid || reduceMotion) return;

    let frame = 0;

    const updateShopParallax = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(
        1,
        Math.max(
          0,
          (viewportHeight - rect.top) / (viewportHeight + rect.height),
        ),
      );
      const entrance = Math.min(1, progress * 1.55);

      header.style.transform = `translate3d(0, ${(1 - entrance) * 48}px, 0)`;
      grid.style.transform = `translate3d(0, ${(1 - entrance) * 92}px, 0)`;
      grid.style.opacity = `${0.72 + entrance * 0.28}`;

      grid
        .querySelectorAll<HTMLImageElement>('.product-card-media img')
        .forEach((image, index) => {
          const delay = Math.min(index * 0.045, 0.18);
          const zoom = Math.min(1, Math.max(0, entrance - delay));
          image.style.transform = `scale(${1 + zoom * 0.075})`;
        });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateShopParallax);
    };

    updateShopParallax();
    window.addEventListener('scroll', requestUpdate, {passive: true});
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <section className="home-shop-overlap" ref={shopSectionRef}>
      <div className="home-shop-shell">
        <div
          className="home-shop-heading mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          ref={shopHeaderRef}
        >
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-olive">
              Shop Aromaz
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-charcoal">
              Start with the refillable system.
            </h2>
          </div>
          <Link
            to="/products/refillable-deodorant/customize"
            className="home-shop-cta"
          >
            Build your deodorant
          </Link>
        </div>
        <Suspense fallback={<HomeShopFallbackGrid />}>
          <Await resolve={products}>
            {(response) => {
              const products = response?.products?.nodes ?? [];
              const soapIndex = products.findIndex((product) => {
                const productName =
                  `${product.title} ${product.handle}`.toLowerCase();
                return (
                  productName.includes('soap') ||
                  productName.includes('loofah') ||
                  product.handle === 'beauty-example-product-1'
                );
              });
              const featuredProducts =
                soapIndex > -1
                  ? [...products.slice(0, 4), products[soapIndex]].filter(
                      (product, index, list) =>
                        product &&
                        list.findIndex((item) => item.id === product.id) ===
                          index,
                    )
                  : products.slice(0, 5);
              const fallbackCards = getHomeShopFallbackCards(featuredProducts);

              return (
                <div
                  className="home-shop-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6"
                  ref={shopGridRef}
                >
                  {featuredProducts.length > 0 ? (
                    <>
                      {featuredProducts.map((product) => (
                        <ProductItem key={product.id} product={product} />
                      ))}
                      {fallbackCards.map((product) => (
                        <HomeShopFallbackCard
                          key={product.name}
                          product={product}
                        />
                      ))}
                    </>
                  ) : (
                    <HomeShopFallbackCards />
                  )}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

type HomeShopFallbackProduct = {
  name: string;
  category: string;
  price: string;
  image: string;
  href: string;
};

const HOME_SHOP_FALLBACK_PRODUCTS = [
  {
    name: 'Deodorant Refill',
    category: 'Refill',
    price: 'CA$16.85',
    image: '/aromaz-products/deodorant-refill.png',
    href: '/products/natural-deodorant-refill',
  },
  {
    name: 'Deodorant Eco-Case',
    category: 'Deodorant',
    price: 'CA$8.64',
    image: '/aromaz-products/deodorant-eco-case.png',
    href: '/products/refillable-deodorant-case',
  },
  {
    name: 'Natural Loofah Soap',
    category: 'Soap',
    price: 'CA$12.00',
    image: BROCHURE_PRODUCTS[5].image,
    href: BROCHURE_PRODUCTS[5].href,
  },
  {
    name: 'Lip Balm',
    category: 'Daily care',
    price: 'CA$5.00',
    image: '/aromaz-products/lip-balm.png',
    href: '/products/refresh-renew-bundle?Ingredient%20origin=Cooling%20Lip%20Balm',
  },
  {
    name: 'Mini Deodorant',
    category: 'Deodorant',
    price: 'CA$12.40',
    image: '/aromaz-products/mini-deodorant.png',
    href: '/products/mini-natural-deodorant',
  },
] satisfies HomeShopFallbackProduct[];

function getHomeShopFallbackCards(products: RecommendedProductFragment[]) {
  const neededCount = Math.max(0, 5 - products.length);

  if (!neededCount) {
    return [];
  }

  return HOME_SHOP_FALLBACK_PRODUCTS.filter(
    (fallbackProduct) =>
      !products.some((product) =>
        isMatchingHomeShopProduct(fallbackProduct.name, product),
      ),
  ).slice(0, neededCount);
}

function isMatchingHomeShopProduct(
  fallbackName: string,
  product: RecommendedProductFragment,
) {
  const fallback = fallbackName.toLowerCase();
  const storefrontProduct = `${product.title} ${product.handle}`.toLowerCase();

  if (fallback.includes('mini')) return storefrontProduct.includes('mini');
  if (fallback.includes('refill')) return storefrontProduct.includes('refill');
  if (fallback.includes('case')) return storefrontProduct.includes('case');
  if (fallback.includes('soap')) {
    return (
      storefrontProduct.includes('soap') ||
      storefrontProduct.includes('loofah') ||
      product.handle === 'beauty-example-product-1'
    );
  }
  if (fallback.includes('balm')) return storefrontProduct.includes('balm');

  return storefrontProduct.includes(fallback);
}

function HomeShopFallbackGrid() {
  return (
    <div className="home-shop-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6">
      <HomeShopFallbackCards />
    </div>
  );
}

function HomeShopFallbackCards() {
  return (
    <>
      {HOME_SHOP_FALLBACK_PRODUCTS.map((product) => (
        <HomeShopFallbackCard key={product.name} product={product} />
      ))}
    </>
  );
}

function HomeShopFallbackCard({
  product,
}: {
  product: (typeof HOME_SHOP_FALLBACK_PRODUCTS)[number];
}) {
  return (
    <Link className="product-card group" to={product.href} prefetch="intent">
      <div className="product-card-media">
        <img
          alt={product.name}
          src={product.image}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>
      <div className="product-card-body">
        <div>
          <p className="product-card-kicker">{product.category}</p>
          <h4>{product.name}</h4>
        </div>
        <div className="product-card-footer">
          <span>{product.price}</span>
          <small>Shop now</small>
        </div>
      </div>
    </Link>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
