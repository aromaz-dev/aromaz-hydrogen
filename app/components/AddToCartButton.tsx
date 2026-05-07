import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

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
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={onClick}
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
      )}
    </CartForm>
  );
}
