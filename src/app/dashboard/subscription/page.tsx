import Link from 'next/link';

interface Subscription {
  tier: string;
}

const SubscriptionPage = async () => {
  const subscription: Subscription = { tier: 'free' };

  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-2xl">Subscription</h1>
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Current Tier: {subscription.tier}</h2>
          <p>Manage your subscription and billing details.</p>
          <div className="card-actions justify-end">
            <Link href="/dashboard/billing" className="btn btn-primary">
              Upgrade or Modify
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
