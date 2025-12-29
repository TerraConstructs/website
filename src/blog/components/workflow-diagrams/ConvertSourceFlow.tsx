/**
 * ConvertSource - React Flow diagram for Phase 3: Convert Source Files
 * Shows: Per source file → CFN declarations → TF mappings → human confirm → LLM convert → write
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
    id: 'find-source',
    type: 'process',
    position: { x: 0, y: 110 },
    data: { label: 'find source files', color: 'gray' },
  },
  {
    id: 'find-cfn',
    type: 'process',
    position: { x: 0, y: 200 },
    data: { label: 'find CFN resource\ndeclarations', color: 'fuchsia' },
  },
  {
    id: 'similar-tf',
    type: 'process',
    position: { x: 0, y: 280 },
    data: { label: 'similar TF resource(s)\ndeclarations', color: 'fuchsia' },
  },
  {
    id: 'human-confirm',
    type: 'process',
    position: { x: 0, y: 360 },
    data: { label: 'human confirmation', color: 'fuchsia' },
  },
  {
    id: 'sample-conversions',
    type: 'resource',
    position: { x: 0, y: 450 },
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
    position: { x: 280, y: 370 },
    data: { label: 'LLM' },
  },
  {
    id: 'convert-source',
    type: 'process',
    position: { x: 400, y: 380 },
    data: { label: 'convert source file', color: 'blue' },
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
    position: { x: 540, y: 470 },
    data: { label: 'write to workspace', color: 'cyan' },
  },
];

const edges: Edge[] = [
  // Left column flow
  {
    id: 'e1',
    source: 'upstream-folder',
    target: 'find-source',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
  },
  {
    id: 'e2',
    source: 'find-source',
    target: 'find-cfn',
    type: 'step',
    animated: false,
  },
  {
    id: 'e3',
    source: 'find-cfn',
    target: 'similar-tf',
    type: 'step',
    animated: false,
  },
  {
    id: 'e4',
    source: 'similar-tf',
    target: 'human-confirm',
    type: 'step',
    animated: false,
  },
  // Context to LLM
  {
    id: 'e5',
    source: 'sample-conversions',
    target: 'llm',
    label: 'few shot\nprompting',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
    labelStyle: { fill: '#d97706', fontSize: 10 },
  },
  {
    id: 'e6',
    source: 'human-confirm',
    target: 'llm',
    label: 'reviewed Refs',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
    labelStyle: { fill: '#d97706', fontSize: 10 },
  },
  // LLM to convert
  {
    id: 'e7',
    source: 'llm',
    target: 'convert-source',
    type: 'step',
    animated: false,
  },
  // Right column flow
  {
    id: 'e8',
    source: 'ensure-workspace',
    target: 'workspace-folder',
    label: 'prepare',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
    labelStyle: { fill: '#9ca3af', fontSize: 10 },
  },
  {
    id: 'e9',
    source: 'terraconstructs-github',
    target: 'workspace-folder',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
  },
  {
    id: 'e10',
    source: 'workspace-folder',
    target: 'write-workspace',
    label: 'write',
    type: 'step',
    animated: false,
    labelStyle: { fill: '#9ca3af', fontSize: 10 },
  },
  // Convert to write
  {
    id: 'e11',
    source: 'convert-source',
    target: 'write-workspace',
    type: 'step',
    animated: false,
  },
];

export function ConvertSourceFlow() {
  return <WorkflowDiagram nodes={nodes} edges={edges} nodeTypes={nodeTypes} />;
}
