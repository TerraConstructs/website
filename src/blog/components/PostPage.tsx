/**
 * PostPage - Main blog post page component.
 * Renders MDX content with TOC, metadata, and layout.
 */
import { ReactNode, useState } from "react";
import { BlogLayout } from "./BlogLayout";
import { TOC } from "./TOC";
import { TOCDrawer } from "./TOCDrawer";
import { SeriesNav } from "./SeriesNav";
import { Milestones } from "./Milestones";
import { Callout } from "./Callout";
import { Stats } from "./Stats";
import { WorkflowStepper } from "./WorkflowStepper";
import { TerraTitanWorkflow } from "./TerraTitanWorkflow";
import { AudioPlayer } from "./AudioPlayer";
import { useScrollSpy } from "../hooks/useScrollSpy";
import type { TOCEntry, Frontmatter, ReadingTime } from "../types";

interface PostPageProps {
  frontmatter: Frontmatter;
  toc: TOCEntry[];
  readingTime?: ReadingTime;
  slug: string;
  /** Whether audio is available (build-time detected from CDN) */
  hasAudio?: boolean;
  children: ReactNode;
}

export function PostPage({
  frontmatter,
  toc,
  readingTime,
  slug,
  hasAudio = false,
  children,
}: PostPageProps) {
  const [tocOpen, setTocOpen] = useState(false);

  // Get all heading IDs for scroll spy
  const headingIds = flattenTOC(toc).map(entry => entry.id);
  const activeId = useScrollSpy(headingIds);

  const { title, date, author } = frontmatter;
  const audioUrl = `/blog/${slug}/audio.mp3`;

  // hasAudio is now determined at build-time via CDN check
  // No runtime HEAD request needed

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <BlogLayout>
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Main content */}
            <div className="lg:col-span-9">
              {/* Header */}
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>By {author}</span>
                  <span>•</span>
                  <time dateTime={date}>{formattedDate}</time>
                  {readingTime && (
                    <>
                      <span>•</span>
                      <span>{Math.ceil(readingTime.minutes)} min read</span>
                    </>
                  )}
                  {hasAudio && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <HeadphonesIcon className="w-4 h-4" />
                        Audio available
                      </span>
                    </>
                  )}
                </div>
              </header>

              {/* Article content */}
              <div className="prose dark:prose-invert max-w-none">
                {children}
              </div>
            </div>

            {/* TOC sidebar (desktop) */}
            <aside className="hidden lg:block lg:col-span-3">
              <TOC entries={toc} activeId={activeId} />
            </aside>
          </div>
        </div>
      </article>

      {/* TOC drawer (mobile) */}
      <TOCDrawer
        entries={toc}
        activeId={activeId}
        isOpen={tocOpen}
        onToggle={() => setTocOpen(!tocOpen)}
      />

      {/* Floating audio player */}
      {hasAudio && <AudioPlayer audioUrl={audioUrl} slug={slug} />}
    </BlogLayout>
  );
}

/**
 * Flatten TOC hierarchy to get all entry IDs.
 */
function flattenTOC(entries: TOCEntry[]): TOCEntry[] {
  const result: TOCEntry[] = [];
  for (const entry of entries) {
    result.push(entry);
    if (entry.children) {
      result.push(...flattenTOC(entry.children));
    }
  }
  return result;
}

/**
 * MDX component mappings for custom rendering.
 * Note: Code blocks are handled by rehype-expressive-code (no custom component needed).
 */
export const mdxComponents = {
  SeriesNav, // Make SeriesNav available in MDX without imports
  Milestones, // Make Milestones available in MDX without imports
  Callout, // Make Callout available in MDX without imports
  Stats, // Make Stats available in MDX without imports
  WorkflowStepper, // Make WorkflowStepper available in MDX without imports
  TerraTitanWorkflow, // Pre-configured TerraTitan RAG workflow stepper
};

// Inline icon for header
function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
