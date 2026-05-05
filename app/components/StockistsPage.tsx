const STOCKIST_CATEGORIES = ['All', 'Retail', 'Refill', 'Wholesale'];

const PREVIEW_LOCATIONS = [
  {
    name: 'Aromaz Stockist Network',
    type: 'Retail',
    city: 'Coming soon',
    detail: 'Retail partner list will be added when locations are confirmed.',
  },
  {
    name: 'Refill Partners',
    type: 'Refill',
    city: 'Coming soon',
    detail: 'Future refill points for deodorant cases and scent refills.',
  },
  {
    name: 'Wholesale Inquiries',
    type: 'Wholesale',
    city: 'Open now',
    detail: 'Email for brochure access, product catalog, and retail terms.',
  },
];

export function StockistsPage() {
  return (
    <main className="stockists-page">
      <section className="stockists-hero">
        <div className="stockists-hero-copy">
          <p>Find a Store</p>
          <h1>Aromaz stockists and refill partners.</h1>
          <span>
            A store locator for boutiques, wellness shops, refill bars, and
            wholesale partners carrying Aromaz natural personal care.
          </span>
          <a href="mailto:info@aromazco.com?subject=Aromaz%20Stockist%20Inquiry">
            Become a stockist
          </a>
        </div>
        <div className="stockists-map-card" aria-label="Interactive Aromaz stockist map">
          <iframe
            title="Aromaz stockists map"
            src="https://www.google.com/maps?q=Canada%20wellness%20beauty%20stores&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="stockists-map-caption">
            <strong>Interactive map</strong>
            <small>Store pins will be added when locations are confirmed.</small>
          </div>
        </div>
      </section>

      <section className="stockists-directory">
        <div className="stockists-directory-heading">
          <div>
            <p>Locate Aromaz</p>
            <h2>Retail list ready for your store data.</h2>
          </div>
          <span>
            Send the store names, addresses, phone numbers, and categories when
            ready, and this page can become the live locator.
          </span>
        </div>

        <div className="stockists-filters" aria-label="Stockist categories">
          {STOCKIST_CATEGORIES.map((category) => (
            <button key={category} type="button">
              {category}
            </button>
          ))}
        </div>

        <div className="stockists-list">
          {PREVIEW_LOCATIONS.map((location) => (
            <article key={location.name}>
              <span>{location.type}</span>
              <h3>{location.name}</h3>
              <strong>{location.city}</strong>
              <p>{location.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
