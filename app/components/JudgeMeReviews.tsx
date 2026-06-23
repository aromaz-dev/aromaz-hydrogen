import {useEffect} from 'react';
import {Script} from '@shopify/hydrogen';

declare global {
  interface Window {
    jdgm?: {
      renderWidgets?: () => void;
    };
  }
}

export function JudgeMeReviews({productHandle}: {productHandle: string}) {
  useEffect(() => {
    window.jdgm?.renderWidgets?.();
  }, [productHandle]);

  return (
    <section
      className="mt-12 border-t border-charcoal/10 pt-10"
      aria-labelledby="judgeme-reviews-heading"
    >
      <Script
        id="judgeme-widget-preloader"
        src="https://cdn.judge.me/widget_preloader.js"
        defer
      />
      <h2
        id="judgeme-reviews-heading"
        className="font-serif text-xl text-charcoal mb-6"
      >
        Customer reviews
      </h2>
      <div
        id="judgeme_product_reviews"
        className="jdgm-widget jdgm-review-widget"
        data-product-handle={productHandle}
        data-handle={productHandle}
      />
    </section>
  );
}
