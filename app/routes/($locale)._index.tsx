import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Aromaz | Artisanal Natural Cosmetics'}];
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
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
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
      <BrandStory />
      <IngredientsShowcase />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.jpg"
          alt="Natural beauty and wellness with botanical ingredients"
          className="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
        />

        {/* Dark Gradient Overlay for text readability */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal/60"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-8 md:px-16">
        <p className="font-sans text-lg md:text-xl text-cream/90 mb-8 leading-relaxed">
          Experience the luxury of artisanal cosmetics crafted from nature's finest ingredients
        </p>

        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl text-cream mb-12 leading-tight">
          Elevate your beauty
        </h1>

        <a
          href="/products/refillable-deodorant/customize"
          className="inline-block bg-rose-gold hover:bg-rose-gold/90 text-cream px-10 py-4 rounded-full font-sans text-lg transition-all duration-300 hover:scale-105"
        >
          Build Your Deodorant
        </a>
      </div>
    </section>
  );
}

function BrandStory() {
  const stories = [
    {
      title: 'Artisanal Craft',
      description: 'Every product is crafted in small batches of 50-100 units, hand-blended with meticulous attention to detail. We believe luxury is earned through craftsmanship, not marketing.',
      image: '/brand-story/artisanal-craft.jpg',
      imageAlt: 'Hands blending natural ingredients',
      imageLeft: true,
    },
    {
      title: 'Natural Ingredients',
      description: 'Pure essential oils, cold-pressed carrier oils, and natural extracts. No synthetics, no fillers, no compromises. Every ingredient is traceable and responsibly sourced.',
      image: '/brand-story/natural-ingredients.jpg',
      imageAlt: 'Natural ingredients in their pure state',
      imageLeft: false,
    },
    {
      title: 'Responsible Sourcing',
      description: 'We maintain direct relationships with our suppliers, ensuring fair trade practices and sustainable harvest methods. Our ingredients come from communities we support and trust.',
      image: '/brand-story/mediterranean-landscape.jpg',
      imageAlt: 'Mediterranean landscape and sustainable farming',
      imageLeft: true,
    },
  ];

  return (
    <section className="bg-off-white">
      {stories.map((story, index) => (
        <div
          key={story.title}
          className={`py-20 md:py-32 px-8 md:px-16 lg:px-24 ${
            index % 2 === 0 ? 'bg-cream' : 'bg-off-white'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center ${
                story.imageLeft ? '' : 'md:grid-flow-dense'
              }`}
            >
              <div className={story.imageLeft ? 'md:order-1' : 'md:order-2'}>
                <div className="aspect-square rounded-lg overflow-hidden shadow-lg group">
                  <img
                    src={story.image}
                    alt={story.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className={story.imageLeft ? 'md:order-2' : 'md:order-1'}>
                <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-6 leading-tight">
                  {story.title}
                </h2>
                <p className="font-sans text-lg md:text-xl text-charcoal/80 leading-relaxed">
                  {story.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function IngredientsShowcase() {
  const ingredients = [
    {
      name: 'Lavender',
      origin: 'Provence, France',
      benefit: 'Calms and soothes',
      image: '/ingredients/lavender.jpg',
    },
    {
      name: 'Argan Oil',
      origin: 'Morocco',
      benefit: 'Nourishes deeply',
      image: '/ingredients/argan.jpg',
    },
    {
      name: 'Shea Butter',
      origin: 'West Africa',
      benefit: 'Moisturizes intensely',
      image: '/ingredients/shea-butter.jpg',
    },
    {
      name: 'Rose',
      origin: 'Bulgaria',
      benefit: 'Rejuvenates skin',
      image: '/ingredients/rose.jpg',
    },
    {
      name: 'Olive Oil',
      origin: 'Mediterranean',
      benefit: 'Protects and repairs',
      image: '/ingredients/olives.jpg',
    },
    {
      name: 'Chamomile',
      origin: 'Egypt',
      benefit: 'Soothes sensitivity',
      image: '/ingredients/chamomile.jpg',
    },
  ];

  return (
    <section className="bg-cream py-20 md:py-32 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
            Nature's Finest Ingredients
          </h2>
          <p className="font-sans text-lg md:text-xl text-charcoal/70 max-w-2xl mx-auto">
            Sourced from their native regions, each ingredient brings centuries of botanical tradition
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12">
          {ingredients.map((ingredient) => (
            <div key={ingredient.name} className="text-center group">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <img
                  src={ingredient.image}
                  alt={`${ingredient.name} from ${ingredient.origin}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="font-serif text-xl md:text-2xl text-charcoal mb-1">
                {ingredient.name}
              </h3>
              <p className="font-sans text-sm md:text-base text-terracotta italic mb-2">
                {ingredient.origin}
              </p>
              <p className="font-sans text-sm md:text-base text-charcoal/80">
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
  return (
    <section className="bg-off-white py-20 md:py-32 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-olive mb-4">
            Our Artisanal Collection
          </h2>
          <p className="font-sans text-lg text-clay max-w-2xl mx-auto">
            Handcrafted with care, made with nature's finest
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-clay">Loading...</div>}>
          <Await resolve={products}>
            {(response) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {response
                  ? response.products.nodes.map((product) => (
                      <ProductItem key={product.id} product={product} />
                    ))
                  : null}
              </div>
            )}
          </Await>
        </Suspense>
      </div>
    </section>
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
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
