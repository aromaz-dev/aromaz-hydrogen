function getNumericShopifyId(gid: string) {
  return gid.split('/').pop() || gid;
}

export function JudgeMeReviews({
  productHandle,
  productId,
}: {
  productHandle: string;
  productId: string;
}) {
  const numericId = getNumericShopifyId(productId);

  return (
    <section
      className="mt-12 border-t border-charcoal/10 pt-10"
      aria-labelledby="judgeme-reviews-heading"
    >
      <h2
        id="judgeme-reviews-heading"
        className="font-serif text-xl text-charcoal mb-6"
      >
        Customer reviews
      </h2>
      <div
        id="judgeme_product_reviews"
        className="jdgm-widget jdgm-review-widget"
        data-id={numericId}
        data-product-handle={productHandle}
        data-handle={productHandle}
      />
    </section>
  );
}
