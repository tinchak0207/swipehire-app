'use client';

import { useState } from 'react';
import EmbeddedTextEditor from '@/components/resume-optimizer/EmbeddedTextEditor';
import type { EditorState } from '@/lib/types/resume-optimizer';

export default function TestEditorPage() {
  const [content, setContent] = useState(
    '<h1>Test Resume</h1><p>This is a test resume content.</p>'
  );
  const [editorState, setEditorState] = useState<EditorState>({
    content,
    isDirty: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-3xl">Editor Test</h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 font-semibold text-xl">Status</h2>
          <p>Content Length: {content.length}</p>
          <p>Is Dirty: {editorState.isDirty ? 'Yes' : 'No'}</p>
        </div>

        <EmbeddedTextEditor
          initialContent={content}
          onContentChange={(newContent) => {
            setContent(newContent);
            console.log('Content changed:', newContent.length);
          }}
          onEditorStateChange={(newState) => {
            setEditorState(newState);
            console.log('State changed:', newState);
          }}
          placeholder="Start editing..."
          height="400px"
          showToolbar={true}
          showControls={true}
          autoSave={false}
        />
      </div>
    </div>
  );
}
