const TRUST_SIGNALS = [
  '100% Natural Ingredients',
  'Baking Soda Free',
  'Full Body Deodorant',
  'Sensitive Skin Friendly',
  'Helps with Heat Rash',
  'Made in Canada',
] as const;

export function ProductBenefits() {
  return (
    <section className="product-benefits px-6 pt-6 pb-0 md:max-w-6xl md:mx-auto md:px-8 md:pt-8">
      <ul className="product-benefits-list">
        {TRUST_SIGNALS.map((signal) => (
          <li key={signal} className="product-benefits-item">
            <span className="product-benefits-check" aria-hidden="true">✓</span>
            <strong className="product-benefits-label">{signal}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
