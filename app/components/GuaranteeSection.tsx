'use client';

export function GuaranteeSection() {
  const scrollToPurchase = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <section className="guarantee-section">
      <div className="guarantee-inner">
        <div className="guarantee-badge" aria-hidden="true">
          🤝
        </div>
        <h2 className="guarantee-heading">Our Feel-Good Guarantee</h2>
        <p className="guarantee-body">
          Try your first Aromaz.
        </p>
        <p className="guarantee-body">
          If you don&apos;t love the scent, the feel, or the results,
          we&apos;ll refund your first order.
        </p>
        <p className="guarantee-body guarantee-body--emphasis">
          No return needed. Just send us a quick email or DM.
        </p>
        <p className="guarantee-body">
          We believe finding a deodorant you truly love should feel exciting,
          not risky.
        </p>
        <button
          type="button"
          className="guarantee-cta"
          onClick={scrollToPurchase}
        >
          Choose My Scent
        </button>
      </div>
    </section>
  );
}
