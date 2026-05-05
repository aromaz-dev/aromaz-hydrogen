import {data as remixData, Form, useActionData, useLoaderData} from 'react-router';
import type {Route} from './+types/account.subscriptions';
import {CUSTOMER_SUBSCRIPTIONS_QUERY} from '~/graphql/customer-account/CustomerSubscriptionsQuery';
import {
  SUBSCRIPTION_CANCEL_MUTATION,
  SUBSCRIPTION_PAUSE_MUTATION,
  SUBSCRIPTION_ACTIVATE_MUTATION,
} from '~/graphql/customer-account/CustomerSubscriptionsMutations';
import type {SubscriptionContractItemFragment} from 'customer-accountapi.generated';

export function shouldRevalidate() {
  return true;
}

export const meta: Route.MetaFunction = () => {
  return [{title: 'Subscriptions'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_SUBSCRIPTIONS_QUERY,
    {
      variables: {
        language: context.customerAccount.i18n.language,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Failed to load subscriptions');
  }

  return remixData(
    {contracts: data.customer.subscriptionContracts.nodes},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  const isLoggedIn = await customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return remixData({error: 'Unauthorized'}, {status: 401});
  }

  const formData = await request.formData();
  const intent = String(formData.get('intent'));
  const contractId = String(formData.get('contractId'));

  if (!contractId) {
    return remixData({error: 'Missing subscription ID'}, {status: 400});
  }

  let mutation: string;
  switch (intent) {
    case 'cancel':
      mutation = SUBSCRIPTION_CANCEL_MUTATION;
      break;
    case 'pause':
      mutation = SUBSCRIPTION_PAUSE_MUTATION;
      break;
    case 'activate':
      mutation = SUBSCRIPTION_ACTIVATE_MUTATION;
      break;
    default:
      return remixData({error: 'Invalid action'}, {status: 400});
  }

  const {data, errors} = await customerAccount.mutate(mutation, {
    variables: {subscriptionContractId: contractId},
  });

  if (errors?.length) {
    return remixData({error: errors[0].message}, {status: 500});
  }

  // Check for user errors from the mutation response
  const mutationResult = Object.values(data || {})[0] as
    | {userErrors?: Array<{message: string}>}
    | undefined;
  if (mutationResult?.userErrors?.length) {
    return remixData(
      {error: mutationResult.userErrors[0].message},
      {status: 400},
    );
  }

  return remixData({success: true, intent});
}

export default function AccountSubscriptions() {
  const {contracts} = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    error?: string;
    success?: boolean;
    intent?: string;
  }>();

  const activeContracts = contracts.filter(
    (c: SubscriptionContractItemFragment) =>
      c.status === 'ACTIVE' || c.status === 'PAUSED' || c.status === 'FAILED',
  );
  const inactiveContracts = contracts.filter(
    (c: SubscriptionContractItemFragment) =>
      c.status === 'CANCELLED' || c.status === 'EXPIRED',
  );

  return (
    <div className="account-subscriptions">
      {actionData?.error && (
        <div className="subscription-error" role="alert">
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="subscription-success" role="status">
          {actionData.intent === 'cancel' && 'Subscription cancelled.'}
          {actionData.intent === 'pause' && 'Subscription paused.'}
          {actionData.intent === 'activate' && 'Subscription resumed.'}
        </div>
      )}

      {contracts.length === 0 ? (
        <EmptySubscriptions />
      ) : (
        <>
          {activeContracts.length > 0 && (
            <section>
              <h2>Active Subscriptions</h2>
              <div className="subscription-list">
                {activeContracts.map(
                  (contract: SubscriptionContractItemFragment) => (
                    <SubscriptionCard key={contract.id} contract={contract} />
                  ),
                )}
              </div>
            </section>
          )}

          {inactiveContracts.length > 0 && (
            <section>
              <h2>Past Subscriptions</h2>
              <div className="subscription-list">
                {inactiveContracts.map(
                  (contract: SubscriptionContractItemFragment) => (
                    <SubscriptionCard key={contract.id} contract={contract} />
                  ),
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EmptySubscriptions() {
  return (
    <div className="subscription-empty">
      <p>You don&apos;t have any subscriptions yet.</p>
      <br />
      <p>
        <a href="/collections/all">Browse products</a>
      </p>
    </div>
  );
}

function SubscriptionCard({
  contract,
}: {
  contract: SubscriptionContractItemFragment;
}) {
  const lines = contract.lines.nodes;
  const isActive = contract.status === 'ACTIVE';
  const isPaused = contract.status === 'PAUSED';
  const isFailed = contract.status === 'FAILED';
  const isCancelled = contract.status === 'CANCELLED';
  const isExpired = contract.status === 'EXPIRED';

  return (
    <div className="subscription-card">
      <div className="subscription-card-header">
        <SubscriptionStatusBadge status={contract.status} />
        {contract.nextBillingDate && (isActive || isFailed) && (
          <span className="subscription-next-date">
            Next: {formatDate(contract.nextBillingDate)}
          </span>
        )}
      </div>

      <div className="subscription-card-body">
        {lines.map((line) => (
          <div key={line.id} className="subscription-line">
            <span className="subscription-line-name">
              {line.title || line.name}
            </span>
            <span className="subscription-line-details">
              {line.quantity > 1 && `${line.quantity} x `}
              {formatMoney(line.currentPrice.amount, line.currentPrice.currencyCode)}
            </span>
          </div>
        ))}

        <div className="subscription-frequency">
          Every {contract.billingPolicy.intervalCount.count}{' '}
          {formatInterval(
            contract.billingPolicy.interval,
            contract.billingPolicy.intervalCount.count,
          )}
        </div>

        {contract.discounts.nodes.length > 0 && (
          <div className="subscription-discounts">
            {contract.discounts.nodes.map((discount) => (
              <span key={discount.id} className="subscription-discount-badge">
                {discount.title}
              </span>
            ))}
          </div>
        )}

        <div className="subscription-meta">
          Subscribed {formatDate(contract.createdAt)}
        </div>
      </div>

      {(isActive || isPaused || isFailed) && (
        <div className="subscription-card-actions">
          {isActive && (
            <Form method="POST">
              <input type="hidden" name="intent" value="pause" />
              <input type="hidden" name="contractId" value={contract.id} />
              <button type="submit" className="subscription-btn subscription-btn-secondary">
                Pause
              </button>
            </Form>
          )}

          {(isPaused || isFailed) && (
            <Form method="POST">
              <input type="hidden" name="intent" value="activate" />
              <input type="hidden" name="contractId" value={contract.id} />
              <button type="submit" className="subscription-btn subscription-btn-primary">
                Resume
              </button>
            </Form>
          )}

          {(isActive || isPaused) && (
            <Form
              method="POST"
              onSubmit={(e) => {
                if (
                  !confirm(
                    'Are you sure you want to cancel this subscription? This cannot be undone.',
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="intent" value="cancel" />
              <input type="hidden" name="contractId" value={contract.id} />
              <button type="submit" className="subscription-btn subscription-btn-danger">
                Cancel
              </button>
            </Form>
          )}
        </div>
      )}

      {(isCancelled || isExpired) && (
        <div className="subscription-card-footer">
          <span className="subscription-ended">
            {isCancelled ? 'Cancelled' : 'Expired'} -{' '}
            {formatDate(contract.createdAt)}
          </span>
        </div>
      )}
    </div>
  );
}

function SubscriptionStatusBadge({status}: {status: string}) {
  const statusMap: Record<string, {label: string; className: string}> = {
    ACTIVE: {label: 'Active', className: 'subscription-status-active'},
    PAUSED: {label: 'Paused', className: 'subscription-status-paused'},
    CANCELLED: {label: 'Cancelled', className: 'subscription-status-cancelled'},
    EXPIRED: {label: 'Expired', className: 'subscription-status-expired'},
    FAILED: {label: 'Payment Failed', className: 'subscription-status-failed'},
  };

  const info = statusMap[status] || {label: status, className: ''};

  return (
    <span className={`subscription-status ${info.className}`}>
      {info.label}
    </span>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMoney(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

function formatInterval(interval: string, count: number): string {
  const singular: Record<string, string> = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
  };
  const plural: Record<string, string> = {
    DAY: 'days',
    WEEK: 'weeks',
    MONTH: 'months',
    YEAR: 'years',
  };

  return count === 1
    ? singular[interval] || interval.toLowerCase()
    : plural[interval] || interval.toLowerCase() + 's';
}
