import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {SocialLinks} from '~/components/SocialLinks';
import {STOCKIST_LOCATIONS, StockistsPage} from '~/components/StockistsPage';
import {
  DEFAULT_STORE_URL,
  SEO_KEYWORDS,
  SITE_NAME,
  getCanonicalUrl,
  getSeoDescription,
  getStoreUrl,
} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  const page = data?.page;
  const storeUrl = data?.storeUrl ?? DEFAULT_STORE_URL;
  const title = page?.seo?.title || page?.title || 'Aromaz';
  const fullTitle = title.includes('Aromaz') ? title : `${title} | Aromaz`;
  const description = getSeoDescription(
    page?.seo?.description || page?.body,
    'Explore Aromaz natural deodorant, refillable scent care, natural cosmetics, wholesale information, and Vancouver-area retail partners.',
  );
  const canonicalUrl = getCanonicalUrl(
    `/pages/${page?.handle ?? ''}`,
    storeUrl,
  );
  const isStockists = page?.handle === 'stockists';

  return [
    {title: fullTitle},
    {name: 'description', content: description},
    {name: 'keywords', content: SEO_KEYWORDS},
    {property: 'og:type', content: isStockists ? 'place' : 'website'},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: fullTitle},
    {property: 'og:description', content: description},
    {property: 'og:url', content: canonicalUrl},
    {tagName: 'link', rel: 'canonical', href: canonicalUrl},
    ...(isStockists
      ? [
          {
            'script:ld+json': {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Aromaz Vancouver-area stockists',
              itemListElement: STOCKIST_LOCATIONS.map((location, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Store',
                  name: location.name,
                  address: location.address,
                  url: location.mapUrl,
                  areaServed: location.city,
                },
              })),
            },
          },
        ]
      : []),
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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  if (params.handle === 'contact') {
    return {
      page: {
        handle: 'contact',
        id: 'aromaz-contact',
        title: 'Contact Aromaz',
        body: '',
        seo: {
          description:
            'Contact Aromaz for customer support, wholesale, franchise interest, and brochure requests.',
          title: 'Contact Aromaz',
        },
      },
      storeUrl: getStoreUrl(request, context.env.PUBLIC_STORE_DOMAIN),
    };
  }

  if (params.handle === 'stockists') {
    return {
      page: {
        handle: 'stockists',
        id: 'aromaz-stockists',
        title: 'Find a Store',
        body: '',
        seo: {
          description:
            'Find Aromaz stockists, retail partners, refill locations, and wholesale opportunities.',
          title: 'Find a Store',
        },
      },
      storeUrl: getStoreUrl(request, context.env.PUBLIC_STORE_DOMAIN),
    };
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
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

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  if (page.handle === 'contact') {
    return <ContactPage />;
  }

  if (page.handle === 'stockists') {
    return <StockistsPage />;
  }

  return (
    <div className="page">
      <header>
        <h1>{page.title}</h1>
      </header>
      <main dangerouslySetInnerHTML={{__html: page.body}} />
    </div>
  );
}

function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p>Contact Aromaz</p>
          <h1>Natural scent care support and wholesale partnerships.</h1>
          <span>
            For customer questions, wholesale requests, franchise interest, or
            brochure access, reach the Aromaz team directly.
          </span>
          <a href="mailto:info@aromazco.com">info@aromazco.com</a>
        </div>
        <div className="contact-hero-products" aria-hidden="true">
          <img src="/aromaz-products/deodorant-eco-case.png" alt="" />
          <img src="/brochure/lip-balm-healing.png" alt="" />
          <img src="/brochure/natural-loofah-soap-catalog.png" alt="" />
        </div>
      </section>

      <section className="contact-info-band">
        <article>
          <span>Customer care</span>
          <h2>Questions about your order or products?</h2>
          <p>
            Email Aromaz for help with product selection, scent questions,
            checkout support, or general customer care.
          </p>
          <a href="mailto:info@aromazco.com">Email support</a>
        </article>
        <article>
          <span>Wholesale</span>
          <h2>Carry Aromaz in your shop.</h2>
          <p>
            Ask for the wholesale brochure, product catalog, pricing details,
            and scent assortment guidance for boutiques and wellness retail.
          </p>
          <a href="mailto:info@aromazco.com?subject=Wholesale%20Brochure%20Request">
            Request brochure
          </a>
        </article>
        <article>
          <span>Franchise</span>
          <h2>Explore partnership opportunities.</h2>
          <p>
            For franchise or regional partnership conversations, include your
            location, business background, and preferred timeline.
          </p>
          <a href="mailto:info@aromazco.com?subject=Franchise%20Inquiry">
            Contact partnerships
          </a>
        </article>
      </section>

      <section className="contact-social">
        <div>
          <p>Follow Aromaz</p>
          <h2>New scents, product drops, and retail updates.</h2>
        </div>
        <SocialLinks />
      </section>

      <section className="contact-brochure">
        <div>
          <p>Brochure access</p>
          <h2>Need the Aromaz catalog for buying decisions?</h2>
          <span>
            The digital catalog shows the refill scent family, loofah soap, and
            lip care essentials. Wholesale buyers can email for the brochure and
            current product availability.
          </span>
        </div>
        <Link to="/catalog">View catalog</Link>
      </section>
    </main>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
