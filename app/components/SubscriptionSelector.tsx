import {
  type SellingPlan,
  calculateSubscriptionPrice,
  getDiscountPercentage,
  formatPrice,
  extractFrequency,
} from '~/lib/subscription-utils';

export interface SubscriptionSelectorProps {
  /** Available selling plans from Storefront API */
  sellingPlans: SellingPlan[];
  /** Currently selected plan ID (null = one-time purchase) */
  selectedPlanId: string | null;
  /** Callback when selection changes */
  onSelect: (planId: string | null) => void;
  /** Base price of the product variant */
  basePrice: number;
  /** Currency code (e.g., 'CAD') */
  currencyCode: string;
  /** Optional className for the container */
  className?: string;
}

/**
 * SubscriptionSelector - Dynamic subscription plan selector
 *
 * Displays one-time purchase option alongside dynamic selling plans
 * fetched from Shopify's Storefront API.
 */
export function SubscriptionSelector({
  sellingPlans,
  selectedPlanId,
  onSelect,
  basePrice,
  currencyCode,
  className = '',
}: SubscriptionSelectorProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* One-time purchase option */}
      <SubscriptionOption
        isSelected={selectedPlanId === null}
        onSelect={() => onSelect(null)}
        title="One-Time Purchase"
        description="Best for trying a new scent"
        price={formatPrice(basePrice, currencyCode)}
        discount={null}
      />

      {/* Dynamic selling plans from API */}
      {sellingPlans.map((plan) => {
        const discount = getDiscountPercentage(plan.priceAdjustments);
        const subscriptionPrice = calculateSubscriptionPrice(
          basePrice,
          plan.priceAdjustments,
        );
        const frequency = extractFrequency(plan.name);

        return (
          <SubscriptionOption
            key={plan.id}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => onSelect(plan.id)}
            title={frequency ? `Every ${frequency}` : plan.name}
            description={
              plan.recurringDeliveries
                ? 'Recurring delivery - Cancel anytime'
                : plan.description || ''
            }
            price={formatPrice(subscriptionPrice, currencyCode)}
            discount={discount}
          />
        );
      })}
    </div>
  );
}

interface SubscriptionOptionProps {
  isSelected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  price: string;
  discount: number | null;
}

function SubscriptionOption({
  isSelected,
  onSelect,
  title,
  description,
  price,
  discount,
}: SubscriptionOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative flex items-center justify-between w-full gap-4 rounded-md p-4
        border transition-colors text-left
        ${
          isSelected
            ? 'border-terracotta bg-terracotta/5'
            : 'border-charcoal/10 bg-off-white hover:border-olive'
        }
      `}
    >
      {/* Radio indicator */}
      <div className="flex items-start gap-3">
        <div
          className={`
            mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
            ${isSelected ? 'border-terracotta' : 'border-charcoal/30'}
          `}
        >
          {isSelected && (
            <div className="w-2.5 h-2.5 rounded-full bg-terracotta" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <span className="font-sans font-medium text-charcoal">{title}</span>
          <span className="text-sm text-charcoal/60">{description}</span>
        </div>
      </div>

      {/* Price and discount badge */}
      <div className="flex flex-col items-end gap-1">
        <span className="font-sans font-semibold text-charcoal">{price}</span>
        {discount !== null && discount > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-terracotta/10 text-terracotta rounded-full">
            SAVE {discount}%
          </span>
        )}
      </div>
    </button>
  );
}
