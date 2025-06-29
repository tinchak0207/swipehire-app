
'use client';

import React, { useState, useCallback, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import { addEdge, useNodesState, useEdgesState, Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, ReactFlowInstance } from 'reactflow';
import NewCandidateNode from '@/components/workflow/nodes/NewCandidateNode';
import AnalyzeResumeNode from '@/components/workflow/nodes/AnalyzeResumeNode';
import ConditionNode from '@/components/workflow/nodes/ConditionNode';
import SendCommunicationNode from '@/components/workflow/nodes/SendCommunicationNode';
import DataThresholdAlertNode from '@/components/workflow/nodes/DataThresholdAlertNode';
import InvokeAINode from '@/components/workflow/nodes/InvokeAINode';
import AnalyzeResumeModal from '@/components/workflow/modals/AnalyzeResumeModal';
import SendCommunicationModal from '@/components/workflow/modals/SendCommunicationModal';
import RunWorkflowModal from '@/components/workflow/modals/RunWorkflowModal';
import InvokeAIModal from '@/components/workflow/modals/InvokeAIModal';
import { useSaveWorkflow, SaveWorkflowPayload } from '@/hooks/useSaveWorkflow';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

const queryClient = new QueryClient();

const nodeTypes = {
    newCandidate: NewCandidateNode,
    analyzeResume: AnalyzeResumeNode,
    condition: ConditionNode,
    sendCommunication: SendCommunicationNode,
    dataThresholdAlert: DataThresholdAlertNode,
    invokeAI: InvokeAINode,
};

let id = 2;
const getId = () => `${id++}`;

const WorkflowDashboardPage = () => {
    const searchParams = useSearchParams();
    const workflowId = searchParams.get('id');
    const templateId = searchParams.get('template');
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [workflowName, setWorkflowName] = useState('My Workflow');
    const [isRunModalOpen, setIsRunModalOpen] = useState(false);

    const saveWorkflowMutation = useSaveWorkflow();

    useEffect(() => {
        const workflowToLoad = workflowId || templateId;
        if (workflowToLoad) {
            fetch(`/api/workflows/${workflowToLoad}`)
                .then((res) => res.json())
                .then((data) => {
                    setWorkflowName(templateId ? `${data.name} (Copy)` : data.name);
                    setNodes(data.definition.nodes || []);
                    setEdges(data.definition.edges || []);
                });
        }
    }, [workflowId, templateId, setNodes, setEdges]);

    const onConnect: OnConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type || !reactFlowInstance) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { label: `${type} node`, openModal: (node: Node) => setSelectedNode(node) },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onDragStart = (event: DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onSaveModal = (nodeId: string, data: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    node.data = { ...node.data, ...data };
                }
                return node;
            }),
        );
        setSelectedNode(null);
    };

    const onSaveWorkflow = (isTemplate = false, isPublic = false) => {
        const payload: SaveWorkflowPayload = { name: workflowName, nodes, edges, isTemplate, isPublic };
        saveWorkflowMutation.mutate(payload);
    };

    const onRunWorkflow = async (payload: any) => {
        await fetch(`/api/workflows/${workflowId}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        setIsRunModalOpen(false);
    };

  return (
    <QueryClientProvider client={queryClient}>
        <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center" ref={reactFlowWrapper}>
            <div className="p-4 w-full bg-base-200 flex items-center gap-4">
                <input type="text" placeholder="Workflow Name" className="input input-bordered w-full max-w-xs" value={workflowName} onChange={(e: ChangeEvent<HTMLInputElement>) => setWorkflowName(e.target.value)} />
                <button className="btn btn-primary" onClick={() => onSaveWorkflow()} disabled={saveWorkflowMutation.isPending}>
                    {saveWorkflowMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-secondary">Save as Template</label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a onClick={() => onSaveWorkflow(true, false)}>Save as Private Template</a></li>
                        <li><a onClick={() => onSaveWorkflow(true, true)}>Save as Public Template</a></li>
                    </ul>
                </div>
                <button className="btn btn-accent" onClick={() => setIsRunModalOpen(true)} disabled={!workflowId}>
                    Run
                </button>
            </div>
            <div className="flex-grow w-full bg-base-300" onDrop={onDrop} onDragOver={onDragOver}>
                <WorkflowCanvas 
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange as OnNodesChange}
                    onEdgesChange={onEdgesChange as OnEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onInit={setReactFlowInstance}
                />
            </div>
        </div>
        <div className="drawer-side">
            <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
            <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                <li className="menu-title"><span>Nodes</span></li>
                <li onDragStart={(event: DragEvent) => onDragStart(event, 'newCandidate')} draggable>
                    <a>New Candidate</a>
                </li>
                <li onDragStart={(event: DragEvent) => onDragStart(event, 'dataThresholdAlert')} draggable>
                    <a>Data Threshold Alert</a>
                </li>
                <li onDragStart={(event: DragEvent) => onDragStart(event, 'analyzeResume')} draggable>
                    <a>Analyze Resume</a>
                </li>
                <li onDragStart={(event: DragEvent) => onDragStart(event, 'condition')} draggable>
                    <a>Condition</a>
                </li>
                <li onDragStart={(event: DragEvent) => onDragStart(event, 'sendCommunication')} draggable>
                    <a>Send Communication</a>
                </li>
                <li onDragStart={(event: DragEvent) => onDragStart(event, 'invokeAI')} draggable>
                    <a>Invoke AI</a>
                </li>
            </ul>
        </div>
        {selectedNode && selectedNode.type === 'analyzeResume' && (
            <AnalyzeResumeModal 
                node={selectedNode}
                onSave={onSaveModal}
                onCancel={() => setSelectedNode(null)}
            />
        )}
        {selectedNode && selectedNode.type === 'sendCommunication' && (
            <SendCommunicationModal 
                node={selectedNode}
                onSave={onSaveModal}
                onCancel={() => setSelectedNode(null)}
            />
        )}
        {selectedNode && selectedNode.type === 'invokeAI' && (
            <InvokeAIModal 
                node={selectedNode}
                onSave={onSaveModal}
                onCancel={() => setSelectedNode(null)}
            />
        )}
        {isRunModalOpen && (
            <RunWorkflowModal 
                onRun={onRunWorkflow}
                onCancel={() => setIsRunModalOpen(false)}
            />
        )}
        </div>
    </QueryClientProvider>
  );
};

const WorkflowDashboardPageWrapper = () => (
    <React.Suspense fallback={<div>Loading...</div>}>
        <WorkflowDashboardPage />
    </React.Suspense>
);

export default WorkflowDashboardPageWrapper;
