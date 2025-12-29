/**
 * NPMNode - NPM package visualization
 */
import { Handle, Position } from '@xyflow/react';

interface NPMNodeProps {
  data: {
    label: string;
    sublabel?: string;
  };
}

export function NPMNode({ data }: NPMNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col items-center">
        <svg width="80" height="70" viewBox="0 0 80 70">
          <rect
            x="10"
            y="10"
            width="60"
            height="50"
            rx="4"
            className="fill-white dark:fill-gray-800 stroke-red-400 dark:stroke-red-500"
            strokeWidth="2"
          />
          <rect
            x="18"
            y="18"
            width="44"
            height="12"
            rx="2"
            className="fill-red-100 dark:fill-red-900/30"
          />
          <text
            x="40"
            y="45"
            textAnchor="middle"
            className="fill-red-500 dark:fill-red-400 text-xs font-medium"
          >
            NPM
          </text>
        </svg>
        <div className="text-xs text-center text-gray-500 dark:text-gray-400 -mt-1">
          <div>{data.label}</div>
          {data.sublabel && <div className="mt-0.5">{data.sublabel}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
