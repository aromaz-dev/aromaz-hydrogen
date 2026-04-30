'use client';

import {useNavigate, useSearchParams} from 'react-router';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {StrengthSelector} from './StrengthSelector';
import {ScentGrid, type ScentOption} from './ScentGrid';
import {
  STRENGTH_OPTIONS,
  getScentName,
  getStrength,
  filterByStrength,
  findVariant,
  type Strength,
} from '~/lib/scent-utils';
import type {ProductFragment} from 'storefrontapi.generated';

/**
 * ScentProductForm - Specialized form for scent products with grouped selection
 *
 * Uses URL as source of truth for variant selection. The parent component uses
 * useOptimisticVariant to provide instant UI updates, so we derive all state
 * from the selectedVariant prop rather than maintaining separate useState.
 */

interface ScentProductFormProps {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}

export function ScentProductForm({
  product,
  selectedVariant,
}: ScentProductFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {open} = useAside();

  // Get ALL variants for the scent grid (not just adjacent ones)
  // adjacentVariants only returns variants that differ by one option,
  // but scent products need access to all variants for the strength filter
  const allVariants = product.variants?.nodes || [];

  // DERIVE strength from selectedVariant (which is already optimistic from parent)
  // This ensures UI stays in sync with the optimistic variant updates
  const selectedStrength: Strength =
    (selectedVariant && getStrength(selectedVariant.title)) || 'Strong';

  // Filter variants by the derived strength
  const filteredScents = filterByStrength(allVariants, selectedStrength);

  // Navigate to a new variant by updating URL search params
  const navigateToVariant = (variant: {
    selectedOptions?: Array<{name: string; value: string}> | null;
  }) => {
    if (!variant.selectedOptions) return;

    const params = new URLSearchParams(searchParams);
    variant.selectedOptions.forEach((opt) => {
      params.set(opt.name, opt.value);
    });

    // Use replace to avoid adding to history for variant changes
    // preventScrollReset keeps the page position stable
    navigate(`?${params.toString()}`, {
      replace: true,
      preventScrollReset: true,
    });
  };

  // Handle strength change - find same scent with new strength
  const handleStrengthChange = (strength: string) => {
    if (!selectedVariant) return;

    const currentScentName = getScentName(selectedVariant.title);
    const newVariant = findVariant(
      allVariants,
      currentScentName,
      strength as Strength,
    );

    if (newVariant) {
      navigateToVariant(newVariant);
    }
  };

  // Handle scent selection - navigate to the selected scent variant
  const handleScentSelect = (scent: ScentOption) => {
    const variant = allVariants.find((v) => v.id === scent.id);
    if (variant) {
      navigateToVariant(variant);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Strength Selector */}
      <StrengthSelector
        options={STRENGTH_OPTIONS}
        selected={selectedStrength}
        onSelect={handleStrengthChange}
      />

      {/* Scent Grid - Mobile: Circular layout */}
      <div className="md:hidden">
        <ScentGrid
          scents={filteredScents as ScentOption[]}
          selectedId={selectedVariant?.id || null}
          onSelect={handleScentSelect}
          layout="circular"
        />
      </div>
      {/* Scent Grid - Desktop: Card layout */}
      <div className="hidden md:block">
        <ScentGrid
          scents={filteredScents as ScentOption[]}
          selectedId={selectedVariant?.id || null}
          onSelect={handleScentSelect}
          layout="card"
        />
      </div>

      {/* Add to Cart */}
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
