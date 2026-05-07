import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  if (layout === 'aside') {
    return (
      <div className="flex flex-col h-full">
        {/* Scrollable cart items + summary */}
        <div className="flex-1 overflow-y-auto px-4">
          <CartEmpty hidden={linesCount} layout={layout} />
          {cartHasItems && (
            <>
              <ul className="divide-y divide-charcoal/10">
                {(cart?.lines?.nodes ?? []).map((line) => (
                  <CartLineItem key={line.id} line={line} layout={layout} />
                ))}
              </ul>
              <CartSummary cart={cart} layout={layout} />
            </>
          )}
        </div>

        {/* Fixed bottom checkout bar */}
        {cartHasItems && (
          <div
            className="border-t border-charcoal/10 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
            style={{paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'}}
          >
            <a
              href={cart?.checkoutUrl}
              className="block w-full h-12 rounded-md bg-terracotta font-sans text-sm font-semibold uppercase tracking-[0.12em] text-cream text-center leading-[3rem] transition-colors hover:bg-sage"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    );
  }

  // Page layout (unchanged for now)
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="cart-details">
        <div aria-labelledby="cart-lines">
          <ul>
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();

  if (layout === 'aside') {
    return (
      <div hidden={hidden} className="py-8 text-center">
        <p className="font-sans text-charcoal/70 mb-4">Your cart is empty</p>
        <Link
          to="/collections/all"
          onClick={close}
          prefetch="viewport"
          className="cart-empty-action"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link
        to="/collections/all"
        onClick={close}
        prefetch="viewport"
        className="cart-empty-action"
      >
        Continue shopping
      </Link>
    </div>
  );
}
