'use client';

import {Money} from '@shopify/hydrogen';
import {getScentName} from '~/lib/scent-utils';

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
    amount: string;
    currencyCode: string;
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

        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(variant)}
            className={`group cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 transform ${
              isSelected
                ? 'scale-105 z-10'
                : 'opacity-80 scale-95 hover:opacity-100'
            }`}
          >
            <div
              className={`p-1 rounded-full transition-all ${
                isSelected
                  ? 'border-2 border-terracotta shadow-md'
                  : 'border-2 border-transparent'
              }`}
            >
              {variant.image ? (
                <div className="aspect-square w-20 h-20 rounded-full overflow-hidden bg-white/50 backdrop-blur-sm">
                  <img
                    src={variant.image.url}
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
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ${className}`}>
      {scents.map((variant) => {
        const isSelected = selectedId === variant.id;
        const scentName = getScentName(variant.title);

        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(variant)}
            className={`p-4 md:p-6 rounded-lg border-2 transition-all text-left ${
              isSelected
                ? 'border-terracotta bg-terracotta/5'
                : 'border-charcoal/20 hover:border-terracotta/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <h3 className="font-serif text-lg md:text-xl text-charcoal">
                {scentName}
              </h3>
              {isSelected && (
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-terracotta flex items-center justify-center text-cream flex-shrink-0">
                  ✓
                </div>
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
