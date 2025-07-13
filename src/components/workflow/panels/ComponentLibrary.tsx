'use client';

const onDragStart = (event: React.DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

export default function ComponentLibrary() {
  return (
    <aside className="h-screen overflow-y-auto bg-base-200 p-4">
      <h2 className="mb-4 font-bold text-lg">Component Library</h2>
      <div
        className="mb-2 cursor-grab rounded-lg p-2 shadow-sm hover:bg-primary hover:text-primary-content"
        onDragStart={(event) => onDragStart(event, 'AnalyzeResume')}
        draggable
      >
        Analyze Resume
      </div>
      <div
        className="mb-2 cursor-grab rounded-lg p-2 shadow-sm hover:bg-primary hover:text-primary-content"
        onDragStart={(event) => onDragStart(event, 'Condition')}
        draggable
      >
        Condition
      </div>
      <div
        className="mb-2 cursor-grab rounded-lg p-2 shadow-sm hover:bg-primary hover:text-primary-content"
        onDragStart={(event) => onDragStart(event, 'SendInvite')}
        draggable
      >
        Send Invite
      </div>
    </aside>
  );
}
