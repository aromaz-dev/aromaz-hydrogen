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
    console.log('[JUDGEME DEBUG] productHandle', productHandle);
    console.log('[JUDGEME DEBUG] numericId', numericId);

    const renderWidgets = () => {
      window.setTimeout(() => {
        const hasJdgm = Boolean(window.jdgm);
        const hasRenderWidgets =
          typeof window.jdgm?.renderWidgets === 'function';

        console.log('[JUDGEME DEBUG] window.jdgm exists', hasJdgm);
        console.log(
          '[JUDGEME DEBUG] window.jdgm.renderWidgets exists',
          hasRenderWidgets,
        );

        if (hasRenderWidgets) {
          window.jdgm?.renderWidgets?.();
          console.log('[JUDGEME DEBUG] renderWidgets called', true);
        } else {
          console.log('[JUDGEME DEBUG] renderWidgets called', false);
        }
      }, 0);
    };

    const existingScript = document.getElementById(JUDGEME_SCRIPT_ID);
    if (existingScript) {
      console.log('[JUDGEME DEBUG] script already exists', true);
      renderWidgets();
      return;
    }

    console.log('[JUDGEME DEBUG] script already exists', false);

    const script = document.createElement('script');
    script.id = JUDGEME_SCRIPT_ID;
    script.src = JUDGEME_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      console.log('[JUDGEME DEBUG] script loaded', true);
      renderWidgets();
    };
    script.onerror = () => {
      console.log('[JUDGEME DEBUG] script loaded', false);
    };

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
