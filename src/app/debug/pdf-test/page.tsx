/**
 * PDF Test Page
 * A dedicated page for testing PDF parsing functionality
 */

import ImprovedPDFTestComponent from '@/components/debug/ImprovedPDFTestComponent';

export default function PDFTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <ImprovedPDFTestComponent />
      </div>
    </div>
  );
}