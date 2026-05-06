const STOCKIST_CATEGORIES = ['All', 'Retail', 'Refill', 'Wholesale'];

const STOCKIST_LOCATIONS = [
  {
    name: 'Shop Makers Park Royal',
    type: 'Retail',
    city: 'West Vancouver, BC',
    address: '2002 Park Royal S #967, West Vancouver, BC V7T 2W4',
    detail: 'Aromaz is available at Shop Makers Park Royal.',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2002%20Park%20Royal%20S%20%23967%2C%20West%20Vancouver%2C%20BC%20V7T%202W4',
  },
  {
    name: 'Every Small Objects',
    type: 'Retail',
    city: 'Burnaby, BC',
    address: '420 Grove Ave, Burnaby, BC V5B 4G3',
    detail: 'Aromaz is available at Every Small Objects.',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=420%20Grove%20Ave%2C%20Burnaby%2C%20BC%20V5B%204G3',
  },
  {
    name: 'Daydream Factory',
    type: 'Retail',
    city: 'Vancouver, BC',
    address: '2987 Granville St, Vancouver, BC V6H 3J6',
    detail: 'Aromaz is available at Daydream Factory.',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2987%20Granville%20St%2C%20Vancouver%2C%20BC%20V6H%203J6',
  },
];

const MAP_QUERY =
  'Shop Makers Park Royal Every Small Objects Daydream Factory Vancouver BC Aromaz';

export function StockistsPage() {
  return (
    <main className="stockists-page">
      <section className="stockists-hero">
        <div className="stockists-hero-copy">
          <p>Find a Store</p>
          <h1>Aromaz stockists and refill partners.</h1>
          <span>
            Find Aromaz at current Vancouver-area retail partners carrying our
            natural personal care.
          </span>
          <a href="mailto:info@aromazco.com?subject=Aromaz%20Stockist%20Inquiry">
            Become a stockist
          </a>
        </div>
        <div className="stockists-map-card" aria-label="Interactive Aromaz stockist map">
          <iframe
            title="Aromaz stockists map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              MAP_QUERY,
            )}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="stockists-map-caption">
            <strong>Current stockists</strong>
            <small>West Vancouver, Burnaby, and Vancouver locations.</small>
          </div>
        </div>
      </section>

      <section className="stockists-directory">
        <div className="stockists-directory-heading">
          <div>
            <p>Locate Aromaz</p>
            <h2>Available now at three local shops.</h2>
          </div>
          <span>
            Visit one of the current Aromaz stockists below, or contact us for
            wholesale and partnership inquiries.
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
          {STOCKIST_LOCATIONS.map((location) => (
            <article key={location.name}>
              <span>{location.type}</span>
              <h3>{location.name}</h3>
              <strong>{location.city}</strong>
              <address>{location.address}</address>
              <p>{location.detail}</p>
              <a href={location.mapUrl} rel="noopener noreferrer" target="_blank">
                View on map
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
