import type {ProductFragment} from 'storefrontapi.generated';

function extractShopifyId(gid?: string | null): string {
  if (!gid) return '';
  const parts = gid.split('/');
  return parts[parts.length - 1] || gid;
}

export function ShopPayCheckoutButton({
  selectedVariant,
}: {
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  if (!selectedVariant?.availableForSale) return null;

  const variantId = extractShopifyId(selectedVariant.id);
  if (!variantId) return null;
  const checkoutPath = `/cart/${variantId}:1`;

  return (
    <button
      aria-label={`Pay with Shop Pay for ${selectedVariant.title}`}
      className="shop-pay-checkout-button w-full min-h-12 rounded-md px-6 font-sans text-sm font-semibold uppercase tracking-[0.12em] transition-colors"
      data-checkout-path={checkoutPath}
      data-variant-id={variantId}
      onClick={() => window.location.assign(checkoutPath)}
      type="button"
    >
      Pay with Shop
    </button>
  );
}
