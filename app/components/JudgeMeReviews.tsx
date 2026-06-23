import {useEffect} from 'react';

declare global {
  interface Window {
    jdgm?: {
      renderWidgets?: () => void;
    };
  }
}

function getNumericShopifyId(gid: string) {
  return gid.split('/').pop() || gid;
}

const JUDGEME_SCRIPT_ID = 'judgeme-widget-preloader';
const JUDGEME_SCRIPT_SRC = 'https://cdn.judge.me/widget_preloader.js';

export function JudgeMeReviews({
  productHandle,
  productId,
}: {
  productHandle: string;
  productId: string;
}) {
  const numericId = getNumericShopifyId(productId);

  useEffect(() => {
    const renderWidgets = () => {
      window.setTimeout(() => {
        window.jdgm?.renderWidgets?.();
      }, 0);
    };

    const existingScript = document.getElementById(JUDGEME_SCRIPT_ID);
    if (existingScript) {
      renderWidgets();
      return;
    }

    const script = document.createElement('script');
    script.id = JUDGEME_SCRIPT_ID;
    script.src = JUDGEME_SCRIPT_SRC;
    script.async = true;
    script.onload = renderWidgets;

    document.body.appendChild(script);
  }, [productHandle, numericId]);

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
