'use client';

const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

export default function ComponentLibrary() {
  return (
    <aside className="p-4 bg-base-200 h-screen overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Component Library</h2>
        <div 
            className="p-2 mb-2 rounded-lg shadow-sm cursor-grab hover:bg-primary hover:text-primary-content"
            onDragStart={(event) => onDragStart(event, 'AnalyzeResume')}
            draggable
        >
            Analyze Resume
        </div>
        <div 
            className="p-2 mb-2 rounded-lg shadow-sm cursor-grab hover:bg-primary hover:text-primary-content"
            onDragStart={(event) => onDragStart(event, 'Condition')}
            draggable
        >
            Condition
        </div>
        <div 
            className="p-2 mb-2 rounded-lg shadow-sm cursor-grab hover:bg-primary hover:text-primary-content"
            onDragStart={(event) => onDragStart(event, 'SendInvite')}
            draggable
        >
            Send Invite
        </div>
    </aside>
  );
}
