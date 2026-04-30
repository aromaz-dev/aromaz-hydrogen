/**
 * Subscription/Selling Plan Utilities
 *
 * Helper functions for working with Shopify selling plans (subscriptions)
 */

/**
 * Price adjustment value types from Shopify Storefront API
 */
export interface PercentagePriceAdjustment {
  __typename: 'SellingPlanPercentagePriceAdjustment';
  adjustmentPercentage: number;
}

export interface FixedAmountPriceAdjustment {
  __typename: 'SellingPlanFixedAmountPriceAdjustment';
  adjustmentAmount: {
    amount: string;
    currencyCode: string;
  };
}

export interface FixedPriceAdjustment {
  __typename: 'SellingPlanFixedPriceAdjustment';
  price: {
    amount: string;
    currencyCode: string;
  };
}

export type PriceAdjustmentValue =
  | PercentagePriceAdjustment
  | FixedAmountPriceAdjustment
  | FixedPriceAdjustment;

export interface PriceAdjustment {
  adjustmentValue: PriceAdjustmentValue;
  orderCount: number | null;
}

export interface SellingPlan {
  id: string;
  name: string;
  description: string | null;
  recurringDeliveries: boolean;
  options: Array<{
    name: string;
    value: string;
  }>;
  priceAdjustments: PriceAdjustment[];
}

export interface SellingPlanGroup {
  name: string;
  appName: string;
  options: Array<{
    name: string;
    values: string[];
  }>;
  sellingPlans: {
    nodes: SellingPlan[];
  };
}

/**
 * Calculate the subscription price based on adjustments
 */
export function calculateSubscriptionPrice(
  basePrice: number,
  priceAdjustments: PriceAdjustment[],
): number {
  return priceAdjustments.reduce((price, adjustment) => {
    const value = adjustment.adjustmentValue;
    switch (value.__typename) {
      case 'SellingPlanPercentagePriceAdjustment':
        return price * (1 - value.adjustmentPercentage / 100);
      case 'SellingPlanFixedAmountPriceAdjustment':
        return price - parseFloat(value.adjustmentAmount.amount);
      case 'SellingPlanFixedPriceAdjustment':
        return parseFloat(value.price.amount);
      default:
        return price;
    }
  }, basePrice);
}

/**
 * Get the discount percentage from price adjustments (if applicable)
 */
export function getDiscountPercentage(
  priceAdjustments: PriceAdjustment[],
): number | null {
  const percentageAdjustment = priceAdjustments.find(
    (a) => a.adjustmentValue.__typename === 'SellingPlanPercentagePriceAdjustment',
  );
  if (
    percentageAdjustment &&
    percentageAdjustment.adjustmentValue.__typename ===
      'SellingPlanPercentagePriceAdjustment'
  ) {
    return percentageAdjustment.adjustmentValue.adjustmentPercentage;
  }
  return null;
}

/**
 * Flatten all selling plans from selling plan groups
 */
export function flattenSellingPlans(
  sellingPlanGroups: {nodes: SellingPlanGroup[]} | null | undefined,
): SellingPlan[] {
  if (!sellingPlanGroups?.nodes) return [];
  return sellingPlanGroups.nodes.flatMap((group) => group.sellingPlans.nodes);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/**
 * Extract delivery frequency from selling plan name
 * e.g., "Deliver every 8 weeks, 4% off" -> "8 weeks"
 */
export function extractFrequency(planName: string): string | null {
  const match = planName.match(/every\s+(\d+\s+\w+)/i);
  return match ? match[1] : null;
}
