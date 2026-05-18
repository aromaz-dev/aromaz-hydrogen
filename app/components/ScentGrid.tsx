'use client';

import {Money} from '@shopify/hydrogen';
import {getScentName} from '~/lib/scent-utils';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {LOCAL_IMAGE_FALLBACKS, isDemoOrPlaceholderImage} from '~/lib/local-images';

/**
 * ScentGrid - Grid of scent options with circular images
 *
 * Extracted from customize flow for reuse across:
 * - Build Your Deodorant flow (Step 3)
 * - Scent product pages
 *
 * Supports two layouts:
 * - circular: 3-column grid with circular images (mobile)
 * - card: 2-column grid with card style and descriptions (desktop)
 */

export interface ScentOption {
  id: string;
  title: string;
  price: {
    amount: MoneyV2['amount'];
    currencyCode: MoneyV2['currencyCode'];
  };
  image?: {
    url: string;
    altText?: string | null;
  } | null;
}

export interface ScentGridProps {
  scents: ScentOption[];
  selectedId: string | null;
  onSelect: (scent: ScentOption) => void;
  layout?: 'circular' | 'card';
  className?: string;
}

export function ScentGrid({
  scents,
  selectedId,
  onSelect,
  layout = 'circular',
  className = '',
}: ScentGridProps) {
  if (layout === 'card') {
    return <ScentCardGrid scents={scents} selectedId={selectedId} onSelect={onSelect} className={className} />;
  }

  return <ScentCircularGrid scents={scents} selectedId={selectedId} onSelect={onSelect} className={className} />;
}

/**
 * Mobile layout: Circular images in 3-column grid
 */
function ScentCircularGrid({
  scents,
  selectedId,
  onSelect,
  className,
}: Omit<ScentGridProps, 'layout'>) {
  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {scents.map((variant) => {
        const isSelected = selectedId === variant.id;
        const scentName = getScentName(variant.title);
        const imageUrl = isDemoOrPlaceholderImage(variant.image?.url)
          ? LOCAL_IMAGE_FALLBACKS.scent
          : variant.image?.url;

        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(variant)}
            className={`group cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 ${
              isSelected
                ? ''
                : 'opacity-80 hover:opacity-100'
            }`}
          >
            <div
              className={`p-1 rounded-full transition-all ${
                isSelected
                  ? 'border-2 border-terracotta shadow-md'
                  : 'border-2 border-transparent'
              }`}
            >
              {imageUrl ? (
                <div className="aspect-square w-20 h-20 rounded-full overflow-hidden bg-off-white">
                  <img
                    src={imageUrl}
                    alt={variant.image.altText || scentName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square w-20 h-20 rounded-full bg-charcoal/10" />
              )}
            </div>
            <div className="text-center">
              <h3
                className={`font-serif text-sm ${
                  isSelected ? 'text-terracotta font-medium' : 'text-charcoal'
                }`}
              >
                {scentName}
              </h3>
              <p className="font-sans text-[10px] text-charcoal/60">
                <Money as="span" data={variant.price} />
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Desktop layout: Card style in 2-column grid
 */
function ScentCardGrid({
  scents,
  selectedId,
  onSelect,
  className,
}: Omit<ScentGridProps, 'layout'>) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 ${className}`}>
      {scents.map((variant) => {
        const isSelected = selectedId === variant.id;
        const scentName = getScentName(variant.title);

        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(variant)}
            className={`rounded-md border p-4 text-left transition-colors md:p-5 ${
              isSelected
                ? 'border-terracotta bg-terracotta/5'
                : 'border-charcoal/15 bg-off-white hover:border-olive'
            }`}
          >
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <h3 className="font-serif text-lg md:text-xl text-charcoal">
                {scentName}
              </h3>
              {isSelected && (
                <div
                  className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#566d37] flex-shrink-0"
                  aria-label="Selected"
                />
              )}
            </div>
            <p className="font-sans text-xs md:text-sm text-charcoal/70 mb-2">
              Natural botanical fragrance
            </p>
            <p className="font-sans text-sm md:text-base text-terracotta font-medium">
              <Money as="span" data={variant.price} />
            </p>
          </button>
        );
      })}
    </div>
  );
}
