import Link from 'next/link';

const templates = [
  {
    id: 1,
    name: 'Software Engineer Screening',
    description: 'A standard screening workflow for software engineers.',
    category: 'Engineering',
  },
  {
    id: 2,
    name: 'Sales Development Rep Outreach',
    description: 'Automated outreach for SDRs.',
    category: 'Sales',
  },
  {
    id: 3,
    name: 'Marketing Campaign Follow-up',
    description: 'Follow up with leads from marketing campaigns.',
    category: 'Marketing',
  },
];

const TemplatesPage = () => {
  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-2xl">Template Marketplace</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <div key={template.id} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{template.name}</h2>
              <p>{template.description}</p>
              <div className="card-actions justify-end">
                <Link href={`/dashboard/workflows?template=${template.id}`}>
                  <a className="btn btn-primary">Use Template</a>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;
