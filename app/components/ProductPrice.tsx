import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  return (
    <div className="mt-3">
      {compareAtPrice ? (
        <div className="flex items-center gap-3">
          {price ? (
            <span className="font-sans text-xl md:text-2xl text-terracotta font-medium">
              <Money data={price} />
            </span>
          ) : null}
          <span className="font-sans text-base text-charcoal/40 line-through">
            <Money data={compareAtPrice} />
          </span>
        </div>
      ) : price ? (
        <span className="font-sans text-xl md:text-2xl text-terracotta font-medium">
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
