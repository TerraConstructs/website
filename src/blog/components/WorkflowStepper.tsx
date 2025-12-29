/**
 * WorkflowStepper - Interactive step-through component for visualizing multi-phase workflows.
 * Features: prev/next navigation, clickable progress dots, keyboard navigation, dark mode.
 */
import { useState, useCallback, useEffect, ReactNode } from 'react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  diagram: ReactNode;
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  caption?: string;
}

export function WorkflowStepper({ steps, caption }: WorkflowStepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentIndex(index);
      }
    },
    [steps.length]
  );

  const goNext = useCallback(() => {
    goToStep(currentIndex + 1);
  }, [currentIndex, goToStep]);

  const goPrev = useCallback(() => {
    goToStep(currentIndex - 1);
  }, [currentIndex, goToStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  const currentStep = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  return (
    <div className="not-prose my-8">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden">
        {/* Progress header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-purple-600 scale-110'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-purple-400 dark:hover:bg-purple-500'
                }`}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                aria-current={index === currentIndex ? 'step' : undefined}
              />
            ))}
          </div>

          {/* Phase label */}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Phase {currentIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Diagram container */}
        <div className="relative p-4 min-h-[300px] flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/30">
          <div className="w-full transition-opacity duration-300">
            {currentStep.diagram}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              isFirst
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label="Previous step"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <button
            onClick={goNext}
            disabled={isLast}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              isLast
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'
            }`}
            aria-label="Next step"
          >
            Next
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Title and description */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {currentStep.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentStep.description}
          </p>
        </div>

        {/* Optional caption */}
        {caption && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
            <p className="text-xs text-gray-500 dark:text-gray-500 italic text-center">
              {caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
