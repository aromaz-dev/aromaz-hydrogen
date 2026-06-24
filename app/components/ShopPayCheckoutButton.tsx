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

  const handleClick = () => {
    window.location.assign(checkoutPath);
  };

  return (
    <button
      aria-label={`Buy ${selectedVariant.title} with Shop Pay`}
      className="shop-pay-checkout-button"
      data-checkout-path={checkoutPath}
      data-variant-id={variantId}
      onClick={handleClick}
      type="button"
    >
      Buy with Shop Pay
    </button>
  );
}
