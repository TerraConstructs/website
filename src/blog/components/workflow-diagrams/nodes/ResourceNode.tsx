/**
 * ResourceNode - Folder/file icon node for resources and archives
 */
import { Handle, Position } from '@xyflow/react';

interface ResourceNodeProps {
  data: {
    label: string;
    sublabel?: string;
    type: 'folder' | 'archive';
    color?: 'amber' | 'gray';
  };
}

export function ResourceNode({ data }: ResourceNodeProps) {
  const strokeColor =
    data.color === 'amber'
      ? 'stroke-amber-600 dark:stroke-amber-500'
      : 'stroke-gray-300 dark:stroke-gray-600';

  const fillColor =
    data.color === 'amber'
      ? 'fill-amber-50 dark:fill-amber-950/30'
      : 'fill-white dark:fill-gray-800';

  const textColor =
    data.color === 'amber'
      ? 'text-amber-700 dark:text-amber-500'
      : 'text-gray-500 dark:text-gray-400';

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col items-center">
        {data.type === 'folder' ? (
          <svg width="60" height="48" viewBox="0 0 60 48">
            <path
              d="M0 8 L0 48 L60 48 L60 16 L40 16 L35 8 Z"
              className={`${fillColor} ${strokeColor}`}
              strokeWidth="1.5"
            />
          </svg>
        ) : (
          <svg
            width="60"
            height="48"
            viewBox="0 0 60 48"
            className="fill-white dark:fill-gray-800"
          >
            <rect
              x="10"
              y="8"
              width="40"
              height="32"
              rx="4"
              className="fill-white dark:fill-gray-800 stroke-gray-300 dark:stroke-gray-600"
              strokeWidth="1.5"
            />
            <rect
              x="18"
              y="14"
              width="24"
              height="6"
              rx="2"
              className="fill-gray-200 dark:fill-gray-700"
            />
          </svg>
        )}
        <div className={`text-xs mt-2 text-center ${textColor}`}>
          <div className="font-medium">{data.label}</div>
          {data.sublabel && <div className="mt-0.5">{data.sublabel}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
