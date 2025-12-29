/**
 * ConvertTests - React Flow diagram for Phase 4: Convert Unit Tests
 * Shows: Similar to ConvertSource but for unit test files
 */
import { Node, Edge } from '@xyflow/react';
import { WorkflowDiagram } from './ReactFlowWrapper';
import {
  ProcessNode,
  ResourceNode,
  GithubNode,
  LLMNode,
} from './nodes';

const nodeTypes = {
  process: ProcessNode,
  resource: ResourceNode,
  github: GithubNode,
  llm: LLMNode,
};

const nodes: Node[] = [
  // Left column - upstream source
  {
    id: 'upstream-folder',
    type: 'resource',
    position: { x: 0, y: 0 },
    data: {
      label: 'upstream',
      sublabel: 'aws-sns',
      type: 'folder',
      color: 'amber',
    },
  },
  {
    id: 'find-unit-tests',
    type: 'process',
    position: { x: 120, y: 110 },
    data: { label: 'find unit tests', color: 'gray' },
  },
  {
    id: 'sample-conversions',
    type: 'resource',
    position: { x: 0, y: 380 },
    data: {
      label: 'sample',
      sublabel: 'conversions',
      type: 'folder',
      color: 'gray',
    },
  },
  // Center column - LLM processing
  {
    id: 'llm',
    type: 'llm',
    position: { x: 280, y: 340 },
    data: { label: 'LLM' },
  },
  {
    id: 'convert-test',
    type: 'process',
    position: { x: 400, y: 350 },
    data: { label: 'convert Unit Test\nfile', color: 'blue' },
  },
  // Right column - workspace output
  {
    id: 'ensure-workspace',
    type: 'process',
    position: { x: 560, y: 0 },
    data: { label: 'Ensure workspace', color: 'amber' },
  },
  {
    id: 'terraconstructs-github',
    type: 'github',
    position: { x: 690, y: 120 },
    data: { label: 'terraconstructs' },
  },
  {
    id: 'workspace-folder',
    type: 'resource',
    position: { x: 580, y: 200 },
    data: {
      label: 'workspace',
      sublabel: 'sns-conv',
      type: 'folder',
      color: 'amber',
    },
  },
  {
    id: 'write-workspace',
    type: 'process',
    position: { x: 540, y: 450 },
    data: { label: 'write to workspace', color: 'cyan' },
  },
];

const edges: Edge[] = [
  // Left column flow
  {
    id: 'e1',
    source: 'upstream-folder',
    target: 'find-unit-tests',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
  },
  {
    id: 'e2',
    source: 'find-unit-tests',
    target: 'llm',
    label: 'Context',
    type: 'step',
    animated: false,
    labelStyle: { fill: '#9ca3af', fontSize: 10 },
  },
  // Context to LLM
  {
    id: 'e3',
    source: 'sample-conversions',
    target: 'llm',
    label: 'few shot\nprompting',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
    labelStyle: { fill: '#d97706', fontSize: 10 },
  },
  // LLM to convert
  {
    id: 'e4',
    source: 'llm',
    target: 'convert-test',
    type: 'step',
    animated: false,
  },
  // Right column flow
  {
    id: 'e5',
    source: 'ensure-workspace',
    target: 'workspace-folder',
    label: 'prepare',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
    labelStyle: { fill: '#9ca3af', fontSize: 10 },
  },
  {
    id: 'e6',
    source: 'terraconstructs-github',
    target: 'workspace-folder',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
  },
  {
    id: 'e7',
    source: 'workspace-folder',
    target: 'write-workspace',
    label: 'write',
    type: 'step',
    animated: false,
    labelStyle: { fill: '#9ca3af', fontSize: 10 },
  },
  // Convert to write
  {
    id: 'e8',
    source: 'convert-test',
    target: 'write-workspace',
    type: 'step',
    animated: false,
  },
];

export function ConvertTestsFlow() {
  return <WorkflowDiagram nodes={nodes} edges={edges} nodeTypes={nodeTypes} />;
}
