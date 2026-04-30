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
              w-full py-4 rounded-full font-sans font-medium text-lg
              transition-all active:scale-[0.98] shadow-md hover:shadow-lg
              ${
                disabled
                  ? 'bg-charcoal/10 text-charcoal/50 cursor-not-allowed'
                  : 'bg-seafoam hover:bg-seafoam/90 text-white'
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
