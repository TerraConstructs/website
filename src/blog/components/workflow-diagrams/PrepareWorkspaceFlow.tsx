/**
 * PrepareWorkspace - React Flow diagram for Phase 1: Prepare Workspace
 * Shows: Start → Ensure upstream (aws-cdk archive) + Ensure workspace (clone terraconstructs)
 */
import { Node, Edge } from '@xyflow/react';
import { WorkflowDiagram } from './ReactFlowWrapper';
import { ProcessNode, ResourceNode, GithubNode } from './nodes';

const nodeTypes = {
  process: ProcessNode,
  resource: ResourceNode,
  github: GithubNode,
};

const nodes: Node[] = [
  // Start node
  {
    id: 'start',
    type: 'process',
    position: { x: 325, y: 0 },
    data: { label: 'start', color: 'green' },
  },
  // Process boxes
  {
    id: 'ensure-upstream',
    type: 'process',
    position: { x: 40, y: 100 },
    data: { label: 'Ensure upstream', color: 'amber' },
  },
  {
    id: 'ensure-workspace',
    type: 'process',
    position: { x: 500, y: 100 },
    data: { label: 'Ensure workspace', color: 'amber' },
  },
  // Left side: GitHub → Archive → Folder
  {
    id: 'aws-cdk-github',
    type: 'github',
    position: { x: 0, y: 230 },
    data: { label: 'aws-cdk' },
  },
  {
    id: 'archive',
    type: 'resource',
    position: { x: 120, y: 230 },
    data: { label: 'archive', type: 'archive', color: 'gray' },
  },
  {
    id: 'upstream-folder',
    type: 'resource',
    position: { x: 220, y: 230 },
    data: { label: 'upstream', sublabel: 'aws-sns', type: 'folder', color: 'amber' },
  },
  // Right side: GitHub → Folder
  {
    id: 'terraconstructs-github',
    type: 'github',
    position: { x: 670, y: 230 },
    data: { label: 'terraconstructs' },
  },
  {
    id: 'workspace-folder',
    type: 'resource',
    position: { x: 480, y: 230 },
    data: { label: 'workspace', sublabel: 'sns-conv', type: 'folder', color: 'amber' },
  },
];

const edges: Edge[] = [
  // Start to both processes
  {
    id: 'e1',
    source: 'start',
    target: 'ensure-upstream',
    type: 'step',
    animated: false,
  },
  {
    id: 'e2',
    source: 'start',
    target: 'ensure-workspace',
    type: 'step',
    animated: false,
  },
  // Left side flow
  {
    id: 'e3',
    source: 'aws-cdk-github',
    target: 'archive',
    label: 'unzip',
    type: 'default',
    animated: false,
    style: { strokeDasharray: '5 5' },
    labelStyle: { fill: '#9ca3af', fontSize: 10 },
    markerEnd: 'arrow',
  },
  {
    id: 'e4',
    source: 'archive',
    target: 'upstream-folder',
    type: 'default',
    animated: false,
    style: { strokeDasharray: '5 5' },
    markerEnd: 'arrow',
  },
  {
    id: 'e5',
    source: 'ensure-upstream',
    target: 'archive',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
  },
  // Right side flow
  {
    id: 'e6',
    source: 'terraconstructs-github',
    target: 'workspace-folder',
    label: 'clone',
    type: 'default',
    animated: false,
    style: { strokeDasharray: '5 5' },
    labelStyle: { fill: '#9ca3af', fontSize: 10 },
    markerEnd: 'arrow',
  },
  {
    id: 'e7',
    source: 'ensure-workspace',
    target: 'workspace-folder',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
  },
];

export function PrepareWorkspaceFlow() {
  return <WorkflowDiagram nodes={nodes} edges={edges} nodeTypes={nodeTypes} />;
}
