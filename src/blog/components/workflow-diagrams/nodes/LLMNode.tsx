/**
 * LLMNode - Neural network visualization for LLM processing
 */
import { Handle, Position } from '@xyflow/react';

interface LLMNodeProps {
  data: {
    label: string;
    sublabel?: string;
  };
}

export function LLMNode({ data }: LLMNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col items-center">
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Simple neural network representation */}
          <g className="stroke-fuchsia-400 dark:stroke-fuchsia-500">
            {/* Input layer (3 nodes) */}
            <circle cx="10" cy="15" r="4" fill="currentColor" />
            <circle cx="10" cy="30" r="4" fill="currentColor" />
            <circle cx="10" cy="45" r="4" fill="currentColor" />

            {/* Hidden layer (4 nodes) */}
            <circle cx="30" cy="10" r="4" fill="currentColor" />
            <circle cx="30" cy="23" r="4" fill="currentColor" />
            <circle cx="30" cy="37" r="4" fill="currentColor" />
            <circle cx="30" cy="50" r="4" fill="currentColor" />

            {/* Output layer (3 nodes) */}
            <circle cx="50" cy="15" r="4" fill="currentColor" />
            <circle cx="50" cy="30" r="4" fill="currentColor" />
            <circle cx="50" cy="45" r="4" fill="currentColor" />

            {/* Connections (simplified) */}
            <g className="opacity-30" strokeWidth="1">
              <line x1="14" y1="15" x2="26" y2="10" />
              <line x1="14" y1="15" x2="26" y2="23" />
              <line x1="14" y1="30" x2="26" y2="23" />
              <line x1="14" y1="30" x2="26" y2="37" />
              <line x1="14" y1="45" x2="26" y2="37" />
              <line x1="14" y1="45" x2="26" y2="50" />

              <line x1="34" y1="10" x2="46" y2="15" />
              <line x1="34" y1="23" x2="46" y2="15" />
              <line x1="34" y1="23" x2="46" y2="30" />
              <line x1="34" y1="37" x2="46" y2="30" />
              <line x1="34" y1="37" x2="46" y2="45" />
              <line x1="34" y1="50" x2="46" y2="45" />
            </g>
          </g>
        </svg>
        <div className="text-xs mt-1 text-center text-fuchsia-700 dark:text-fuchsia-400">
          <div className="font-medium">{data.label}</div>
          {data.sublabel && (
            <div className="text-gray-500 dark:text-gray-400 mt-0.5">
              {data.sublabel}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
