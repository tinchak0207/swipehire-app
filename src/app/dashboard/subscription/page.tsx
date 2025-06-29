import { sql } from '@vercel/postgres';
import Link from 'next/link';

async function getSubscription(): Promise<Subscription> {
  const userId = 1; // Hardcoded for now
  const { rows } = await sql`SELECT tier FROM users WHERE id = ${userId}`;
  return (rows[0] as Subscription) || { tier: 'free' };
}

interface Subscription {
  tier: string;
}

const SubscriptionPage = async () => {
  const subscription: Subscription = await getSubscription();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Subscription</h1>
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Current Tier: {subscription.tier}</h2>
          <p>Manage your subscription and billing details.</p>
          <div className="card-actions justify-end">
            <Link href="/dashboard/billing">
              <a className="btn btn-primary">Upgrade or Modify</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
