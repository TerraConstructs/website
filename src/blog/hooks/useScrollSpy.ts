/**
 * useScrollSpy - Track which heading is currently visible using Intersection Observer.
 * Returns the ID of the currently active section for TOC highlighting.
 */
import { useEffect, useState } from "react";

export function useScrollSpy(headingIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      entries => {
        // Find the first visible entry
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            return;
          }
        }
      },
      {
        // Trigger slightly before heading reaches top
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    // Observe all headings
    const elements: Element[] = [];
    for (const id of headingIds) {
      const element = document.getElementById(id);
      if (element) {
        elements.push(element);
        observer.observe(element);
      }
    }

    // Cleanup
    return () => {
      for (const element of elements) {
        observer.unobserve(element);
      }
    };
  }, [headingIds]);

  return activeId;
}
