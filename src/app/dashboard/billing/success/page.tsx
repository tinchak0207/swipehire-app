import Link from 'next/link';

const SuccessPage = () => {
  return (
    <div className="p-4 text-center">
      <h1 className="mb-4 font-bold text-2xl">Success!</h1>
      <p>You have successfully subscribed to the Pro Tier.</p>
      <div className="mt-4">
        <Link href="/dashboard">
          <a className="btn btn-primary">Go to Dashboard</a>
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
