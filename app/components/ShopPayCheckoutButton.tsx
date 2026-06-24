'use client';

import {ShopPayButton} from '@shopify/hydrogen';
import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import type {ProductFragment} from 'storefrontapi.generated';

export function ShopPayCheckoutButton({
  selectedVariant,
}: {
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const root = useRouteLoaderData<RootLoader>('root');
  const storeDomain = root?.publicStoreDomain;

  if (!selectedVariant?.availableForSale || !storeDomain) return null;

  return (
    <ShopPayButton
      variantIds={[selectedVariant.id]}
      storeDomain={storeDomain}
      channel="hydrogen"
      className="shop-pay-checkout-button-wrapper"
      width="100%"
    />
  );
}
