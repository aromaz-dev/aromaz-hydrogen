import type {ProductFragment} from 'storefrontapi.generated';

function extractShopifyId(gid?: string | null): string {
  if (!gid) return '';
  const parts = gid.split('/');
  return parts[parts.length - 1] || gid;
}

/* Official Shop Pay wordmark SVG — sourced from Shopify's open-source themes */
function ShopLogo() {
  return (
    <svg
      aria-label="Shop"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 57 16"
      fill="currentColor"
      style={{height: '1em', width: 'auto', display: 'inline-block', verticalAlign: 'middle'}}
    >
      <path d="M4.04 0C1.81 0 .22 1.37.22 3.22c0 1.62 1.01 2.57 2.66 3.09l1.22.38c1.08.34 1.6.8 1.6 1.56 0 .86-.76 1.44-1.9 1.44-1.18 0-2.06-.6-2.22-1.54H0c.18 1.88 1.6 3.04 3.8 3.04 2.28 0 3.84-1.26 3.84-3.14 0-1.64-1-2.6-2.78-3.14L3.66 4.5C2.62 4.18 2.1 3.7 2.1 2.98c0-.8.68-1.36 1.74-1.36 1.08 0 1.84.54 2 1.42h1.54C7.2 1.24 5.84 0 4.04 0zm7.48 0v3.76A2.84 2.84 0 009.4 3c-1.8 0-3.04 1.4-3.04 3.5 0 2.12 1.22 3.5 3.04 3.5a2.84 2.84 0 002.12-.76V10h1.52V0h-1.52zm-1.8 8.58c-1.06 0-1.74-.9-1.74-2.08 0-1.18.68-2.08 1.74-2.08s1.8.92 1.8 2.08c0 1.16-.74 2.08-1.8 2.08zm6.54-5.58a2.84 2.84 0 00-2.12.76V3.1h-1.52V13h1.52V9.24c.44.5 1.2.76 2.12.76 1.8 0 3.04-1.38 3.04-3.5 0-2.1-1.24-3.5-3.04-3.5zm-.28 5.58c-1.06 0-1.8-.92-1.8-2.08 0-1.16.74-2.08 1.8-2.08 1.06 0 1.74.9 1.74 2.08 0 1.18-.68 2.08-1.74 2.08zM20.22 3c-1.88 0-3.18 1.38-3.18 3.5 0 2.14 1.28 3.5 3.38 3.5 1.4 0 2.44-.66 2.92-1.82h-1.6c-.28.48-.76.74-1.34.74-.96 0-1.64-.66-1.76-1.74h4.84V6.7c0-2.2-1.22-3.7-3.26-3.7zm-1.56 2.84c.18-.96.8-1.54 1.6-1.54.84 0 1.44.58 1.56 1.54h-3.16z" />
    </svg>
  );
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
      <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.35em'}}>
        Buy with <ShopLogo />
      </span>
    </button>
  );
}
