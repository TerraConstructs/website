/**
 * GithubNode - GitHub Octocat icon with label
 */
import { Handle, Position } from '@xyflow/react';

interface GithubNodeProps {
  data: {
    label: string;
  };
}

export function GithubNode({ data }: GithubNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col items-center">
        <svg width="50" height="50" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            className="fill-gray-700 dark:fill-gray-600"
          />
          <path
            d="M50 20 C35 20 23 32 23 47 C23 59 30.5 69 41 72 C42.5 72.3 43 71.3 43 70.5 C43 69.8 43 68 43 66 C35.5 67.8 33.5 62 33.5 62 C32 58.5 30 57.5 29 56.5 C26.5 54.5 29.3 54.8 29.3 54.8 C32 55 33.5 57.5 34.5 59 C37 63 41 61.5 43 60.5 C43.3 58.5 44 57 45 56 C38 55 31 52.5 31 42 C31 38.5 32.5 35.5 34.5 33 C34.3 32.5 33.3 29 34.8 24.5 C34.8 24.5 37.3 23.8 43 27.5 C45 27 47.5 26.8 50 26.8 C52.5 26.8 55 27 57 27.5 C62.7 23.8 65.2 24.5 65.2 24.5 C66.7 29 65.7 32.5 65.5 33 C67.5 35.5 69 38.5 69 42 C69 52.5 62 55 55 56 C56.5 57.3 57.7 59.5 57.7 62.5 C57.7 67 57.7 70.5 57.7 71.5 C57.7 72.3 58.2 73.3 59.7 73 C70.2 69.5 77.7 59.5 77.7 47.5 C77 32 65 20 50 20"
            className="fill-white dark:fill-gray-200"
          />
        </svg>
        <div className="text-xs mt-1 text-center text-amber-700 dark:text-amber-500 font-medium">
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
