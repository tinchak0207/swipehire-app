import MetricsChart from '@/components/workflow/analytics/MetricsChart';

const sampleData = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
  ];

export default function AnalyticsPage() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MetricsChart data={sampleData} />
        <div className="stats shadow">
            <div className="stat">
                <div className="stat-title">Company Reach</div>
                <div className="stat-value">89,400</div>
                <div className="stat-desc">21% more than last month</div>
            </div>
            <div className="stat">
                <div className="stat-title">Resumes Received</div>
                <div className="stat-value">1,200</div>
                <div className="stat-desc">15% more than last month</div>
            </div>
        </div>
      </div>
    </main>
  );
}
