import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, Money, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  if (layout === 'aside') {
    return (
      <li key={id} className="flex gap-4 py-4">
        {image && (
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={close}
            className="flex-shrink-0"
          >
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={80}
              width={80}
              loading="lazy"
              className="rounded-lg bg-off-white"
            />
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={close}
            className="block"
          >
            <h4 className="font-serif text-base text-charcoal truncate">
              {product.title}
            </h4>
          </Link>

          {selectedOptions.length > 0 && (
            <p className="font-sans text-xs text-charcoal/60 mt-0.5">
              {selectedOptions.map((o) => o.value).join(' / ')}
            </p>
          )}

          <div className="font-sans text-sm text-terracotta font-medium mt-1">
            {line?.cost?.totalAmount && <Money data={line.cost.totalAmount} />}
          </div>

          <CartLineQuantityAside line={line} />
        </div>
      </li>
    );
  }

  // Page layout (unchanged)
  return (
    <li key={id} className="cart-line">
      {image && (
        <Image
          alt={title}
          aspectRatio="1/1"
          data={image}
          height={100}
          loading="lazy"
          width={100}
        />
      )}

      <div>
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={close}
        >
          <p>
            <strong>{product.title}</strong>
          </p>
        </Link>
        <div className="font-sans">
          {line?.cost?.totalAmount && <Money data={line.cost.totalAmount} />}
        </div>
        <ul>
          {selectedOptions.map((option) => (
            <li key={option.name}>
              <small>
                {option.name}: {option.value}
              </small>
            </li>
          ))}
        </ul>
        <CartLineQuantity line={line} />
      </div>
    </li>
  );
}

/**
 * Styled quantity controls for aside layout
 */
function CartLineQuantityAside({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex items-center border border-charcoal/20 rounded-full">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="w-8 h-8 flex items-center justify-center text-charcoal disabled:text-charcoal/30 hover:bg-charcoal/5 rounded-l-full transition-colors"
          >
            -
          </button>
        </CartLineUpdateButton>
        <span className="w-8 text-center font-sans text-sm text-charcoal">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="w-8 h-8 flex items-center justify-center text-charcoal disabled:text-charcoal/30 hover:bg-charcoal/5 rounded-r-full transition-colors"
          >
            +
          </button>
        </CartLineUpdateButton>
      </div>

      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} aside />
    </div>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantity">
      <small>Quantity: {quantity} &nbsp;&nbsp;</small>
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          <span>&#8722; </span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          <span>&#43;</span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
  aside,
}: {
  lineIds: string[];
  disabled: boolean;
  aside?: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className={
          aside
            ? 'font-sans text-xs text-charcoal/50 hover:text-charcoal transition-colors'
            : undefined
        }
      >
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
