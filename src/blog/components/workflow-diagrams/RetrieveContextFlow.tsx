/**
 * RetrieveContext - React Flow diagram for Phase 2: Retrieve Context
 * Shows: Find source files → CFN declarations → VectorDB → Similar TF resources
 */
import { Node, Edge } from '@xyflow/react';
import { WorkflowDiagram } from './ReactFlowWrapper';
import {
  ProcessNode,
  ResourceNode,
  GithubNode,
  DatabaseNode,
  NPMNode,
} from './nodes';

const nodeTypes = {
  process: ProcessNode,
  resource: ResourceNode,
  github: GithubNode,
  database: DatabaseNode,
  npm: NPMNode,
};

const nodes: Node[] = [
  // Top process
  {
    id: 'ensure-upstream',
    type: 'process',
    position: { x: 280, y: 0 },
    data: { label: 'Ensure upstream', color: 'amber' },
  },
  // Upstream folder (left)
  {
    id: 'upstream-folder',
    type: 'resource',
    position: { x: 0, y: 60 },
    data: {
      label: 'upstream',
      sublabel: 'aws-sns',
      type: 'folder',
      color: 'amber',
    },
  },
  // Find source files
  {
    id: 'find-source',
    type: 'process',
    position: { x: 260, y: 80 },
    data: { label: 'find source files', color: 'gray' },
  },
  // NPM aws-cdk-lib (left middle)
  {
    id: 'npm-cdk',
    type: 'npm',
    position: { x: 0, y: 160 },
    data: { label: 'aws-cdk-lib' },
  },
  // Find CFN resource declarations
  {
    id: 'find-cfn',
    type: 'process',
    position: { x: 230, y: 180 },
    data: { label: 'find CFN resource\ndeclaration files', color: 'fuchsia' },
  },
  // terraform-provider-aws GitHub
  {
    id: 'tf-provider-github',
    type: 'github',
    position: { x: 0, y: 280 },
    data: { label: 'terraform-\nprovider-aws' },
  },
  // VectorDb
  {
    id: 'vectordb',
    type: 'database',
    position: { x: 120, y: 340 },
    data: { label: 'VectorDb' },
  },
  // Similar TF resources
  {
    id: 'similar-tf',
    type: 'process',
    position: { x: 230, y: 290 },
    data: {
      label: 'similar TF resource(s)\ndeclarations',
      color: 'fuchsia',
    },
  },
];

const edges: Edge[] = [
  // Ensure upstream to find source
  {
    id: 'e1',
    source: 'ensure-upstream',
    target: 'find-source',
    type: 'step',
    animated: false,
  },
  // Upstream folder to find source
  {
    id: 'e2',
    source: 'upstream-folder',
    target: 'find-source',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
  },
  // Find source to find CFN
  {
    id: 'e3',
    source: 'find-source',
    target: 'find-cfn',
    type: 'step',
    animated: false,
  },
  // NPM to find CFN
  {
    id: 'e4',
    source: 'npm-cdk',
    target: 'find-cfn',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
  },
  // Find CFN to similar TF
  {
    id: 'e5',
    source: 'find-cfn',
    target: 'similar-tf',
    type: 'step',
    animated: false,
  },
  // GitHub to VectorDb
  {
    id: 'e6',
    source: 'tf-provider-github',
    target: 'vectordb',
    type: 'step',
    animated: false,
  },
  // VectorDb to similar TF
  {
    id: 'e7',
    source: 'vectordb',
    target: 'similar-tf',
    type: 'step',
    animated: false,
    style: { strokeDasharray: '5 5' },
  },
];

export function RetrieveContextFlow() {
  return <WorkflowDiagram nodes={nodes} edges={edges} nodeTypes={nodeTypes} />;
}
