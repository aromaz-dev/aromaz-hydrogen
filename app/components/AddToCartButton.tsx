import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {trackMetaAddToCart} from '~/lib/meta-pixel';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <AddToCartButtonInner
          analytics={analytics}
          disabled={disabled}
          fetcher={fetcher}
          lines={lines}
          onClick={onClick}
        >
          {children}
        </AddToCartButtonInner>
      )}
    </CartForm>
  );
}

function AddToCartButtonInner({
  analytics,
  children,
  disabled,
  fetcher,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  fetcher: FetcherWithComponents<any>;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  const pending = useRef(false);
  const eventKey = useRef<string | null>(null);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      pending.current = true;
    }

    if (fetcher.state === 'idle' && pending.current) {
      pending.current = false;
      console.log('[ATC DEBUG] action/fetcher success', {
        data: fetcher.data,
        errors: fetcher.data?.errors,
      });

      const hasErrors =
        Array.isArray(fetcher.data?.errors) && fetcher.data.errors.length > 0;

      if (!hasErrors) {
        const items = lines.map((line: any) => ({
          variantId: line.merchandiseId,
          productId: line.selectedVariant?.product?.id,
          quantity: line.quantity || 1,
          price: line.selectedVariant?.price?.amount,
          currency: line.selectedVariant?.price?.currencyCode,
        }));

        trackMetaAddToCart(items, eventKey.current || undefined);
      }

      eventKey.current = null;
    }
  }, [fetcher.data, fetcher.state, lines]);

  return (
    <>
      <input name="analytics" type="hidden" value={JSON.stringify(analytics)} />
      <button
        type="submit"
        onClick={() => {
          console.log('[ATC DEBUG] clicked');
          console.log('[ATC DEBUG] submitting CartForm');
          eventKey.current = [
            'shared',
            ...lines.map((line: any) => line.merchandiseId),
            Date.now(),
          ].join(':');
          onClick?.();
        }}
        disabled={disabled ?? fetcher.state !== 'idle'}
        className={`
          w-full min-h-12 rounded-md px-6 font-sans text-sm font-semibold
          uppercase tracking-[0.12em] transition-colors
          ${
            disabled
              ? 'bg-charcoal/10 text-charcoal/50 cursor-not-allowed'
              : 'bg-terracotta hover:bg-sage text-cream'
          }
        `}
      >
        {children}
      </button>
    </>
  );
}
