import Link from 'next/link';

const BillingPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Billing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Pro Tier</h2>
            <p>$20/month</p>
            <div className="card-actions justify-end">
              <Link href="/dashboard/billing/success">
                <a className="btn btn-primary">Subscribe</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
