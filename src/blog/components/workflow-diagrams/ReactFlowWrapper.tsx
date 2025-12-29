/**
 * ReactFlowWrapper - Reusable container for React Flow diagrams
 * Configured for interactive workflow visualizations with pan/zoom controls
 */
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './reactflow-theme.css';

interface WorkflowDiagramProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
}

export function WorkflowDiagram({
  nodes,
  edges,
  nodeTypes,
}: WorkflowDiagramProps) {
  return (
    <div className="h-96 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        minZoom={0.5}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#aaa" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
