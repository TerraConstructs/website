/**
 * useSearch Hook - Client-side fuzzy search with Fuse.js
 *
 * Provides lazy-loaded search functionality for blog posts with:
 * - On-demand loading of search index
 * - Debounced input (~150ms)
 * - Fuzzy matching with configurable weights
 * - Highlighted match snippets
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import Fuse from 'fuse.js';

interface SearchIndexEntry {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  content: string;
  date: string;
  author: string;
}

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  author: string;
  matches?: Fuse.FuseResultMatch[];
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for fuzzy search with lazy-loaded index and debounced input.
 *
 * @param debounceMs - Debounce delay in milliseconds (default: 150ms)
 * @returns Search state and setter function
 */
export function useSearch(debounceMs: number = 150): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fuseRef = useRef<Fuse<SearchIndexEntry> | null>(null);
  const indexLoadedRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);

  // Debounce query input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs]);

  // Lazy-load search index on first search
  const loadSearchIndex = useCallback(async () => {
    if (indexLoadedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/blog/search-index.json');

      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('json')) {
        throw new Error('Search index not available');
      }

      const searchIndex: SearchIndexEntry[] = await response.json();

      // Initialize Fuse with weighted keys
      fuseRef.current = new Fuse(searchIndex, {
        keys: [
          { name: 'title', weight: 2.0 }, // High weight for titles
          { name: 'tags', weight: 1.5 }, // Medium-high weight for tags
          { name: 'excerpt', weight: 1.2 }, // Medium weight for excerpt
          { name: 'content', weight: 0.8 }, // Low weight for content
        ],
        includeMatches: true, // Include match snippets
        includeScore: true,
        threshold: 0.4, // Fuzzy matching threshold (0 = exact, 1 = match anything)
        ignoreLocation: true, // Search anywhere in the field
        minMatchCharLength: 2, // Minimum character length to match
      });

      indexLoadedRef.current = true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load search index';
      setError(errorMessage);
      console.error('Search index loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    async function performSearch() {
      // Empty query = empty results
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      // Load index if not already loaded
      if (!indexLoadedRef.current) {
        await loadSearchIndex();
      }

      // Search with Fuse
      if (fuseRef.current) {
        const fuseResults = fuseRef.current.search(debouncedQuery);

        // Map Fuse results to SearchResult format
        const searchResults: SearchResult[] = fuseResults.map((result) => ({
          slug: result.item.slug,
          title: result.item.title,
          excerpt: result.item.excerpt,
          tags: result.item.tags,
          date: result.item.date,
          author: result.item.author,
          matches: result.matches,
        }));

        setResults(searchResults);
      }
    }

    performSearch();
  }, [debouncedQuery, loadSearchIndex]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
  };
}
