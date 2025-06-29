export default function TemplatesPage() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">Template Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Placeholder for template cards */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Tech Role Template</h2>
            <p>A comprehensive template for screening technical candidates.</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Use Template</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
