/**
 * DatabaseNode - Cylinder shape for database/vector store
 */
import { Handle, Position } from '@xyflow/react';

interface DatabaseNodeProps {
  data: {
    label: string;
    sublabel?: string;
  };
}

export function DatabaseNode({ data }: DatabaseNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col items-center">
        <svg width="80" height="60" viewBox="0 0 80 60">
          {/* Top ellipse */}
          <ellipse
            cx="40"
            cy="15"
            rx="30"
            ry="10"
            className="fill-purple-50 dark:fill-purple-950/30 stroke-purple-400"
            strokeWidth="2"
          />
          {/* Side rectangles */}
          <rect
            x="10"
            y="15"
            width="60"
            height="30"
            className="fill-purple-50 dark:fill-purple-950/30"
          />
          {/* Side lines */}
          <line
            x1="10"
            y1="15"
            x2="10"
            y2="45"
            className="stroke-purple-400"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="15"
            x2="70"
            y2="45"
            className="stroke-purple-400"
            strokeWidth="2"
          />
          {/* Bottom ellipse */}
          <ellipse
            cx="40"
            cy="45"
            rx="30"
            ry="10"
            className="fill-purple-50 dark:fill-purple-950/30 stroke-purple-400"
            strokeWidth="2"
          />
        </svg>
        <div className="text-xs mt-1 text-center text-purple-700 dark:text-purple-400">
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
