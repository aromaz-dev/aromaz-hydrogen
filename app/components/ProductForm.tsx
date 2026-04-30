import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="mt-8 space-y-6">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div key={option.name}>
            <h5 className="font-sans text-sm font-medium text-charcoal mb-3">
              {option.name}
            </h5>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const baseClasses = `
                  px-4 py-2 rounded-full transition-all font-sans text-sm
                  ${
                    selected
                      ? 'border-2 border-terracotta bg-terracotta/5 text-charcoal font-medium'
                      : 'border border-charcoal/20 text-charcoal/70 hover:border-charcoal/40'
                  }
                  ${!available && 'opacity-40'}
                  ${!exists && 'hidden'}
                `;

                if (isDifferentProduct) {
                  // SEO: When the variant is a combined listing child product
                  // that leads to a different url, render as anchor tag
                  return (
                    <Link
                      className={baseClasses}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO: When the variant is an update to the search param,
                  // render as button with javascript navigation
                  return (
                    <button
                      type="button"
                      className={baseClasses}
                      key={option.name + name}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected && exists) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}

      <div className="mt-8">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  // Text only (no swatch)
  if (!image && !color) return <span>{name}</span>;

  // Color swatch with name
  if (color && !image) {
    return (
      <span className="flex items-center gap-2">
        <span
          className="w-4 h-4 rounded-full border border-charcoal/20"
          style={{backgroundColor: color}}
        />
        {name}
      </span>
    );
  }

  // Image swatch with name
  return (
    <span className="flex items-center gap-2">
      <span className="w-5 h-5 rounded-full overflow-hidden border border-charcoal/10">
        {!!image && (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        )}
      </span>
      {name}
    </span>
  );
}
