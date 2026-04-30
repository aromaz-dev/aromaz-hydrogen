// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/subscriptionContractCancel
export const SUBSCRIPTION_CANCEL_MUTATION = `#graphql
  mutation subscriptionContractCancel($subscriptionContractId: ID!) {
    subscriptionContractCancel(subscriptionContractId: $subscriptionContractId) {
      contract {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/subscriptionContractPause
export const SUBSCRIPTION_PAUSE_MUTATION = `#graphql
  mutation subscriptionContractPause($subscriptionContractId: ID!) {
    subscriptionContractPause(subscriptionContractId: $subscriptionContractId) {
      contract {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/subscriptionContractActivate
export const SUBSCRIPTION_ACTIVATE_MUTATION = `#graphql
  mutation subscriptionContractActivate($subscriptionContractId: ID!) {
    subscriptionContractActivate(subscriptionContractId: $subscriptionContractId) {
      contract {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;
