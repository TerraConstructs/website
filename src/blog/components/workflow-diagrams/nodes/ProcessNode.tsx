/**
 * ProcessNode - Rounded rectangle node for workflow process steps
 */
import { Handle, Position } from '@xyflow/react';

interface ProcessNodeProps {
  data: {
    label: string;
    color?:
      | 'amber'
      | 'purple'
      | 'blue'
      | 'cyan'
      | 'green'
      | 'fuchsia'
      | 'gray';
  };
}

export function ProcessNode({ data }: ProcessNodeProps) {
  const colorMap = {
    amber:
      'border-amber-700 dark:border-amber-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    purple:
      'border-purple-400 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200',
    blue: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200',
    cyan: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-200',
    green:
      'border-green-500 dark:border-green-400 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400',
    fuchsia:
      'border-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-900 dark:text-fuchsia-200',
    gray: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        className={`px-4 py-2 rounded-lg border-2 ${colorMap[data.color || 'amber']}`}
      >
        <div className="text-sm font-medium whitespace-nowrap">
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
