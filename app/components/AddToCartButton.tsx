import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';

interface MetaContentItem {
  id: string;
  item_group_id?: string;
  quantity: number;
  item_price: number;
}

interface MetaAddToCartPayload {
  content_ids: string[];
  content_type: 'product';
  contents: MetaContentItem[];
  currency: string;
  num_items: number;
  value: number;
}

function extractShopifyId(gid?: string): string {
  if (!gid) return '';
  const parts = gid.split('/');
  return parts[parts.length - 1] || gid;
}

function getMetaAddToCartPayload(lines: Array<OptimisticCartLineInput>) {
  let value = 0;
  let numItems = 0;
  let currency = 'CAD';
  const contents: MetaContentItem[] = [];

  for (const line of lines as any[]) {
    const id = extractShopifyId(line.merchandiseId);
    if (!id) continue;

    const quantity = line.quantity || 1;
    const itemPrice = Number(line.selectedVariant?.price?.amount || 0) || 0;
    const itemGroupId = extractShopifyId(line.selectedVariant?.product?.id);

    currency = line.selectedVariant?.price?.currencyCode || currency;
    value += itemPrice * quantity;
    numItems += quantity;
    contents.push({
      id,
      item_group_id: itemGroupId || undefined,
      quantity,
      item_price: itemPrice,
    });
  }

  if (contents.length === 0) return null;

  return {
    content_ids: contents.map((item) => item.id),
    content_type: 'product',
    contents,
    currency,
    num_items: numItems,
    value: Math.round(value * 100) / 100,
  } satisfies MetaAddToCartPayload;
}

function fireDirectMetaAddToCart(payload: MetaAddToCartPayload) {
  window.setTimeout(() => {
    console.log('[ATC DEBUG] before direct window.fbq', {
      hasWindow: typeof window !== 'undefined',
      typeofFbq: typeof window.fbq,
      fbqLoaded: window.fbq?.loaded,
      state: window.fbq?.getState?.(),
      payload,
    });

    window.fbq?.('track', 'AddToCart', payload);

    console.log('[ATC DEBUG] after direct window.fbq');
  }, 100);
}

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
        const payload = getMetaAddToCartPayload(lines);
        if (payload) {
          console.log('[ATC DEBUG] firing fbq AddToCart');
          console.log('[ATC DEBUG] payload', payload);
          fireDirectMetaAddToCart(payload);
        }
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
