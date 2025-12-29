/**
 * Callout - Styled callout box for highlighting content in blog posts.
 * Supports different types: note, tip, warning, danger, info.
 */
import { ReactNode } from 'react';

type CalloutType = 'note' | 'tip' | 'warning' | 'danger' | 'info';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const iconMap: Record<CalloutType, JSX.Element> = {
  note: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  tip: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  ),
  warning: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  danger: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  ),
  info: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
};

const titleMap: Record<CalloutType, string> = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Danger',
  info: 'Info',
};

const styleMap: Record<
  CalloutType,
  { border: string; bg: string; icon: string; title: string }
> = {
  note: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'text-blue-500',
    title: 'text-blue-700 dark:text-blue-400',
  },
  tip: {
    border: 'border-l-green-500',
    bg: 'bg-green-50 dark:bg-green-950/30',
    icon: 'text-green-500',
    title: 'text-green-700 dark:text-green-400',
  },
  warning: {
    border: 'border-l-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    icon: 'text-yellow-500',
    title: 'text-yellow-700 dark:text-yellow-400',
  },
  danger: {
    border: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: 'text-red-500',
    title: 'text-red-700 dark:text-red-400',
  },
  info: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'text-purple-500',
    title: 'text-purple-700 dark:text-purple-400',
  },
};

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const styles = styleMap[type];
  const Icon = iconMap[type];
  const displayTitle = title || titleMap[type];

  return (
    <div
      className={`not-prose my-6 rounded-r-lg border-l-4 ${styles.border} ${styles.bg} p-4`}
    >
      <div className={`flex items-center gap-2 ${styles.icon} mb-2`}>
        {Icon}
        <span className={`font-semibold ${styles.title}`}>{displayTitle}</span>
      </div>
      <div className="text-gray-700 dark:text-gray-300 text-sm">{children}</div>
    </div>
  );
}
