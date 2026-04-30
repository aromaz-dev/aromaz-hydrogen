/**
 * GraphQL Queries for Refillable Deodorant Customization Flow
 */

/**
 * Fragment for product variant data needed in customize flow
 */
const CUSTOMIZE_VARIANT_FRAGMENT = `#graphql
  fragment CustomizeVariant on ProductVariant {
    id
    title
    availableForSale
    price {
      amount
      currencyCode
    }
    image {
      id
      url
      altText
      width
      height
    }
    selectedOptions {
      name
      value
    }
  }
` as const;

/**
 * Fragment for selling plan data (subscriptions)
 */
const SELLING_PLAN_FRAGMENT = `#graphql
  fragment SellingPlanFields on SellingPlan {
    id
    name
    description
    recurringDeliveries
    options {
      name
      value
    }
    priceAdjustments {
      adjustmentValue {
        __typename
        ... on SellingPlanPercentagePriceAdjustment {
          adjustmentPercentage
        }
        ... on SellingPlanFixedAmountPriceAdjustment {
          adjustmentAmount {
            amount
            currencyCode
          }
        }
        ... on SellingPlanFixedPriceAdjustment {
          price {
            amount
            currencyCode
          }
        }
      }
      orderCount
    }
  }
` as const;

/**
 * Fragment for product metafields
 */
const PRODUCT_METAFIELDS_FRAGMENT = `#graphql
  fragment ProductMetafields on Product {
    metafields(identifiers: [
      { namespace: "custom", key: "material" }
      { namespace: "custom", key: "sustainability_note" }
      { namespace: "custom", key: "origin_region" }
      { namespace: "custom", key: "key_ingredients" }
      { namespace: "custom", key: "benefits" }
      { namespace: "custom", key: "scent_profile" }
      { namespace: "custom", key: "scent_intensity" }
      { namespace: "custom", key: "best_for" }
      { namespace: "custom", key: "natural_percentage" }
      { namespace: "custom", key: "vegan" }
      { namespace: "custom", key: "cruelty_free" }
    ]) {
      key
      value
      type
    }
  }
` as const;

/**
 * Combined query to fetch both products at once (more efficient)
 */
export const CUSTOMIZE_FLOW_DATA_QUERY = `#graphql
  query CustomizeFlowData($caseHandle: String!, $refillHandle: String!) {
    caseProduct: product(handle: $caseHandle) {
      id
      title
      description
      handle
      ...ProductMetafields
      variants(first: 20) {
        nodes {
          ...CustomizeVariant
        }
      }
    }
    refillProduct: product(handle: $refillHandle) {
      id
      title
      description
      handle
      ...ProductMetafields
      variants(first: 30) {
        nodes {
          ...CustomizeVariant
          metafields(identifiers: [
            { namespace: "custom", key: "origin_region" }
            { namespace: "custom", key: "key_ingredients" }
            { namespace: "custom", key: "benefits" }
            { namespace: "custom", key: "scent_profile" }
            { namespace: "custom", key: "scent_intensity" }
            { namespace: "custom", key: "best_for" }
          ]) {
            key
            value
            type
          }
        }
      }
      sellingPlanGroups(first: 10) {
        nodes {
          name
          appName
          options {
            name
            values
          }
          sellingPlans(first: 10) {
            nodes {
              ...SellingPlanFields
            }
          }
        }
      }
    }
  }
  ${PRODUCT_METAFIELDS_FRAGMENT}
  ${CUSTOMIZE_VARIANT_FRAGMENT}
  ${SELLING_PLAN_FRAGMENT}
` as const;
