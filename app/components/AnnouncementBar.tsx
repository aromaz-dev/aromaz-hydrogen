import {Suspense} from 'react';
import {Await, useAsyncValue} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

const FREE_SHIPPING_THRESHOLD = 50;

type AnnouncementCart = {
  cost?: {
    subtotalAmount?: {
      amount?: string | number | null;
      currencyCode?: string | null;
    } | null;
  } | null;
} | null;

function formatMoney(amount: number, currencyCode = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

function getAnnouncementMessage(cart: AnnouncementCart) {
  const subtotal = Number(cart?.cost?.subtotalAmount?.amount || 0);
  const currencyCode = cart?.cost?.subtotalAmount?.currencyCode || 'CAD';

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return '🎉 You Qualify for Free Shipping!';
  }

  if (subtotal > 0) {
    const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
    return `🚚 Add ${formatMoney(remaining, currencyCode)} more for Free Shipping`;
  }

  return '🚚 Free Shipping on Orders Over $50';
}

function AnnouncementBarContent() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);

  return (
    <div className="announcement-bar" role="status" aria-live="polite">
      <p>{getAnnouncementMessage(cart)}</p>
    </div>
  );
}

export function AnnouncementBar({
  cart,
}: {
  cart: Promise<CartApiQueryFragment | null>;
}) {
  return (
    <Suspense
      fallback={
        <div className="announcement-bar" role="status">
          <p>🚚 Free Shipping on Orders Over $50</p>
        </div>
      }
    >
      <Await resolve={cart}>
        <AnnouncementBarContent />
      </Await>
    </Suspense>
  );
}
