'use client';

/**
 * StrengthSelector - Segmented pill control for scent strength selection
 *
 * Extracted from customize flow for reuse across:
 * - Build Your Deodorant flow (Step 3)
 * - Scent product pages
 */

export interface StrengthSelectorProps {
  options: readonly string[];
  selected: string;
  onSelect: (strength: string) => void;
  className?: string;
}

export function StrengthSelector({
  options,
  selected,
  onSelect,
  className = '',
}: StrengthSelectorProps) {
  return (
    <div
      className={`flex items-center gap-1 p-1 bg-charcoal/5 rounded-full ${className}`}
    >
      {options.map((strength) => (
        <button
          key={strength}
          type="button"
          onClick={() => onSelect(strength)}
          className={`flex-1 py-2 px-3 rounded-full font-sans text-sm font-medium transition-all ${
            selected === strength
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-charcoal/60 hover:text-charcoal'
          }`}
        >
          {strength}
        </button>
      ))}
    </div>
  );
}
