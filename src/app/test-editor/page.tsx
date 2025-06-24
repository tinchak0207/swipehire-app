'use client';

import { useState } from 'react';
import EmbeddedTextEditor from '@/components/resume-optimizer/EmbeddedTextEditor';
import type { EditorState } from '@/lib/types/resume-optimizer';

export default function TestEditorPage() {
  const [content, setContent] = useState('<h1>Test Resume</h1><p>This is a test resume content.</p>');
  const [editorState, setEditorState] = useState<EditorState>({
    content,
    isDirty: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Editor Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
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