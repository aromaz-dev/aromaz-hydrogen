// NOTE: https://shopify.dev/docs/api/customer/latest/objects/SubscriptionContract
export const SUBSCRIPTION_CONTRACT_FRAGMENT = `#graphql
  fragment SubscriptionContractItem on SubscriptionContract {
    id
    status
    createdAt
    nextBillingDate
    currencyCode
    deliveryPrice {
      amount
      currencyCode
    }
    billingPolicy {
      interval
      intervalCount {
        count
      }
    }
    deliveryPolicy {
      interval
      intervalCount {
        count
      }
    }
    lines(first: 10) {
      nodes {
        id
        name
        title
        quantity
        currentPrice {
          amount
          currencyCode
        }
        variantTitle
      }
    }
    discounts(first: 5) {
      nodes {
        id
        title
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/customer/latest/queries/customer
export const CUSTOMER_SUBSCRIPTIONS_QUERY = `#graphql
  ${SUBSCRIPTION_CONTRACT_FRAGMENT}
  query CustomerSubscriptions($language: LanguageCode)
    @inContext(language: $language) {
    customer {
      subscriptionContracts(first: 100) {
        nodes {
          ...SubscriptionContractItem
        }
      }
    }
  }
` as const;
