const BENEFITS = [
  {
    emoji: '🌿',
    headline: 'Truly Natural',
    body: 'Made with ingredients you can actually recognize. Zero chemicals, no artificial fragrances, and preservative free.',
  },
  {
    emoji: '🛡️',
    headline: 'Actually Stops Odor',
    body: "Let's be honest — a lot of natural deodorants don't work. Aromaz was created with a new formulation to really block odor without any harsh ingredients.",
  },
  {
    emoji: '✨',
    headline: 'More Than An Underarm Deodorant',
    body: 'Use it anywhere you want to stay fresh. Underarms, inner thighs, feet, chest area, or the back of your neck — anywhere sweat and odor show up.',
  },
  {
    emoji: '☀️',
    headline: 'Helps With Heat Rash & Friction',
    body: 'Natural minerals and botanical ingredients with soothing properties keep skin comfortable in areas where heat, sweat, and rubbing can become annoying.',
  },
] as const;

export function ProductBenefits() {
  return (
    <section className="product-benefits px-6 pt-6 pb-0 md:max-w-6xl md:mx-auto md:px-8 md:pt-8">
      <ul className="product-benefits-list">
        {BENEFITS.map((benefit) => (
          <li key={benefit.headline} className="product-benefits-item">
            <span className="product-benefits-emoji" aria-hidden="true">
              {benefit.emoji}
            </span>
            <div className="product-benefits-text">
              <strong className="product-benefits-headline">
                {benefit.headline}
              </strong>
              <span className="product-benefits-sep"> — </span>
              <span className="product-benefits-body">{benefit.body}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
