/**
 * TerraTitanWorkflow - Lazy-loaded React Flow workflow with Intersection Observer
 * Loads React Flow only when component enters viewport to minimize initial bundle size
 */
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { LoadingSkeleton } from './workflow-diagrams/LoadingSkeleton';

const LazyReactFlowWorkflow = lazy(
  () => import('./workflow-diagrams/TerraTitanWorkflowFlow')
);

interface TerraTitanWorkflowProps {
  caption?: string;
}

export function TerraTitanWorkflow({
  caption,
}: TerraTitanWorkflowProps = {}) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before entering viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <Suspense fallback={<LoadingSkeleton />}>
          <LazyReactFlowWorkflow caption={caption} />
        </Suspense>
      ) : (
        <LoadingSkeleton />
      )}
    </div>
  );
}
