'use client';

import type { NextPage } from 'next';
import { useState } from 'react';
import EmbeddedTextEditor from '@/components/resume-optimizer/EmbeddedTextEditor';
import type { EditorState } from '@/lib/types/resume-optimizer';

/**
 * Test page for the Embedded Text Editor component
 * Accessible at /resume-optimizer/editor-test
 */
const EditorTestPage: NextPage = () => {
  const [content, setContent] = useState<string>(
    `
<h1>John Doe</h1>
<p><strong>Software Engineer</strong></p>
<p>Email: john.doe@email.com | Phone: (555) 123-4567</p>

<h2>Professional Summary</h2>
<p>Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable web applications and leading cross-functional teams.</p>

<h2>Experience</h2>
<h3>Senior Software Engineer - Tech Corp (2021-Present)</h3>
<ul>
<li>Led development of microservices architecture serving 1M+ users</li>
<li>Improved application performance by 40% through code optimization</li>
<li>Mentored 3 junior developers and conducted code reviews</li>
</ul>

<h3>Software Engineer - StartupXYZ (2019-2021)</h3>
<ul>
<li>Built responsive web applications using React and TypeScript</li>
<li>Implemented CI/CD pipelines reducing deployment time by 60%</li>
<li>Collaborated with design team to improve user experience</li>
</ul>

<h2>Education</h2>
<p><strong>Bachelor of Science in Computer Science</strong><br>
University of Technology (2015-2019)</p>

<h2>Skills</h2>
<ul>
<li>Programming Languages: JavaScript, TypeScript, Python, Java</li>
<li>Frontend: React, Next.js, HTML5, CSS3, Tailwind CSS</li>
<li>Backend: Node.js, Express, PostgreSQL, MongoDB</li>
<li>Cloud: AWS, Docker, Kubernetes</li>
</ul>
  `.trim()
  );

  const [editorState, setEditorState] = useState<EditorState>({
    content,
    isDirty: false,
  });

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log('Content changed:', newContent.length, 'characters');
  };

  const handleEditorStateChange = (newState: EditorState) => {
    setEditorState(newState);
    console.log('Editor state changed:', newState);
  };

  const handleAutoSave = async (contentToSave: string): Promise<void> => {
    console.log('Auto-saving content...', contentToSave.length, 'characters');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Content auto-saved successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Embedded Text Editor Test</h1>
            <p className="text-slate-600">
              Test the embedded real-time text editor component with sample resume content
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-6 py-8">
        <div className="space-y-8">
          {/* Editor Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Editor Status</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="stat bg-slate-50 rounded-lg">
                <div className="stat-title">Content Length</div>
                <div className="stat-value text-primary">{content.length}</div>
                <div className="stat-desc">characters</div>
              </div>

              <div className="stat bg-slate-50 rounded-lg">
                <div className="stat-title">Editor State</div>
                <div
                  className={`stat-value ${editorState.isDirty ? 'text-warning' : 'text-success'}`}
                >
                  {editorState.isDirty ? 'Modified' : 'Saved'}
                </div>
                <div className="stat-desc">
                  {editorState.lastSaved ? `Last saved: ${editorState.lastSaved}` : 'No saves yet'}
                </div>
              </div>

              <div className="stat bg-slate-50 rounded-lg">
                <div className="stat-title">Word Count</div>
                <div className="stat-value text-info">
                  {
                    content
                      .replace(/<[^>]*>/g, '')
                      .trim()
                      .split(/\s+/).length
                  }
                </div>
                <div className="stat-desc">words</div>
              </div>
            </div>
          </div>

          {/* Embedded Text Editor */}
          <EmbeddedTextEditor
            initialContent={content}
            onContentChange={handleContentChange}
            onEditorStateChange={handleEditorStateChange}
            placeholder="Start editing your resume content here..."
            height="600px"
            showToolbar={true}
            showControls={true}
            autoSave={true}
            autoSaveInterval={5000} // 5 seconds for testing
            onAutoSave={handleAutoSave}
            className="w-full"
          />

          {/* Testing Instructions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Testing Instructions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Features to Test:</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Rich text formatting (bold, italic, headers, lists)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Preview mode toggle</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Word and character count updates</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Auto-save functionality (every 5 seconds)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Manual save button</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Reset to original content</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Expected Behavior:</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-success">✓</span>
                    <span>Editor loads with sample resume content</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-success">✓</span>
                    <span>Toolbar provides formatting options</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-success">✓</span>
                    <span>Real-time content and state updates</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-success">✓</span>
                    <span>Auto-save indicator shows progress</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-success">✓</span>
                    <span>Preview mode renders formatted content</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-success">✓</span>
                    <span>Responsive design works on mobile</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-300 mb-2">Current Editor State:</h3>
                <pre className="bg-slate-800 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(editorState, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-slate-300 mb-2">
                  Content Preview (first 200 chars):
                </h3>
                <pre className="bg-slate-800 p-3 rounded text-xs overflow-auto">
                  {content.substring(0, 200)}...
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorTestPage;
