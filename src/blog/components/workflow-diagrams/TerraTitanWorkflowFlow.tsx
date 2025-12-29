/**
 * TerraTitanWorkflowFlow - React Flow implementation of the TerraTitan RAG workflow
 * This component is lazy-loaded to minimize bundle size impact
 */
import { WorkflowStepper } from '../WorkflowStepper';
import {
  PrepareWorkspaceFlow,
  RetrieveContextFlow,
  ConvertSourceFlow,
  ConvertTestsFlow,
} from './index';

interface TerraTitanWorkflowFlowProps {
  caption?: string;
}

const terraTitanSteps = [
  {
    id: 'prepare',
    title: 'Prepare Workspace',
    description:
      'Initialize the upstream aws-cdk source archive and clone the terraconstructs workspace for converted output.',
    diagram: <PrepareWorkspaceFlow />,
  },
  {
    id: 'retrieve',
    title: 'Retrieve Context',
    description:
      'Find source files, extract CFN resource declarations from aws-cdk-lib, and query the vector database for similar Terraform Provider AWS resource declarations.',
    diagram: <RetrieveContextFlow />,
  },
  {
    id: 'convert-source',
    title: 'Convert Source Files',
    description:
      'For each source file: extract CFN declarations, get TF resource mappings with human confirmation, then use LLM with few-shot prompting to convert and write to workspace.',
    diagram: <ConvertSourceFlow />,
  },
  {
    id: 'convert-tests',
    title: 'Convert Unit Tests',
    description:
      'Similar process for unit test files - find tests, build context from converted source, use LLM to convert tests, and write to workspace.',
    diagram: <ConvertTestsFlow />,
  },
];

export default function TerraTitanWorkflowFlow({
  caption = 'TerraTitan RAG workflow for porting AWS CDK L2 constructs to CDKTF',
}: TerraTitanWorkflowFlowProps) {
  return <WorkflowStepper steps={terraTitanSteps} caption={caption} />;
}
