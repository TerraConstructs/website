/**
 * AudioPlayer - Floating audio player component.
 *
 * Features:
 * - Fixed position: bottom-left on mobile, bottom-right on desktop
 * - Minimized state: compact bubble with play/pause and time
 * - Expanded state: full controls (play, skip, progress)
 * - Playback position persistence (localStorage)
 * - Light/dark mode support
 * - Keyboard controls: Space to toggle, arrow keys to skip, M to minimize
 * - Responsive: full-width on mobile, compact on desktop
 */
import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  /** URL to the audio file */
  audioUrl: string;
  /** Post slug for localStorage key */
  slug: string;
}

export function AudioPlayer({ audioUrl, slug }: AudioPlayerProps) {
  const [isMinimized, setIsMinimized] = useState(() => {
    // Restore minimize preference from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('audio-player-minimized') === 'true';
    }
    return false;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const storageKey = `audio-position-${slug}`;

  // Restore playback position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem(storageKey);
    if (savedPosition && audioRef.current) {
      const position = parseFloat(savedPosition);
      if (!isNaN(position) && position > 0) {
        audioRef.current.currentTime = position;
        setCurrentTime(position);
      }
    }
  }, [storageKey]);

  // Save playback position to localStorage periodically
  useEffect(() => {
    if (currentTime > 0) {
      localStorage.setItem(storageKey, currentTime.toString());
    }
  }, [currentTime, storageKey]);

  // Save minimize preference
  useEffect(() => {
    localStorage.setItem('audio-player-minimized', isMinimized.toString());
  }, [isMinimized]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-15);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(15);
          break;
        case 'm':
          e.preventDefault();
          setIsMinimized((prev) => !prev);
          break;
        case 'escape':
          setIsMinimized(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsLoading(true);
      audioRef.current.play().catch((err) => {
        setError('Failed to play audio');
        setIsLoading(false);
        console.error('Audio play error:', err);
      });
    }
  }, [isPlaying]);

  const skip = useCallback(
    (seconds: number) => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(audioRef.current.currentTime + seconds, duration)
      );
    },
    [duration]
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !audioRef.current || duration === 0) return;

      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setIsLoading(false);
  }, []);

  const handlePause = useCallback(() => setIsPlaying(false), []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const handleError = useCallback(() => {
    setError('Failed to load audio');
    setIsLoading(false);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Minimized floating bubble
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-4 z-40 sm:left-auto sm:right-6">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleError}
          preload="metadata"
        />
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
          aria-label="Expand audio player"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="p-1.5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <LoadingIcon className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">
            {formatTime(currentTime)}
          </span>
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }

  // Expanded floating player
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:p-0 sm:max-w-md">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
        {error ? (
          <div className="flex items-center justify-between text-red-600 dark:text-red-400 text-sm">
            <span>{error}</span>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Header with minimize button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <HeadphonesIcon className="w-4 h-4" />
                <span>Listening</span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Minimize player"
              >
                <ChevronDownIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden mb-3"
            >
              <div
                className="h-full bg-gray-800 dark:bg-gray-200 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time display */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {/* Skip back 15s */}
              <button
                onClick={() => skip(-15)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                aria-label="Skip back 15 seconds"
              >
                <SkipBackIcon className="w-6 h-6" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                disabled={isLoading && !isPlaying}
                className="p-4 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-md"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading && !isPlaying ? (
                  <LoadingIcon className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              {/* Skip forward 15s */}
              <button
                onClick={() => skip(15)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                aria-label="Skip forward 15 seconds"
              >
                <SkipForwardIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Keyboard hints */}
            <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                Space
              </kbd>{' '}
              play/pause{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] ml-2">
                ←→
              </kbd>{' '}
              skip{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] ml-2">
                M
              </kbd>{' '}
              minimize
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Icons (inline SVGs for simplicity)
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function SkipBackIcon({ className }: { className?: string }) {
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
      <polygon points="11 19 2 12 11 5 11 19" />
      <polygon points="22 19 13 12 22 5 22 19" />
    </svg>
  );
}

function SkipForwardIcon({ className }: { className?: string }) {
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
      <polygon points="13 19 22 12 13 5 13 19" />
      <polygon points="2 19 11 12 2 5 2 19" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
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
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

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

function ChevronUpIcon({ className }: { className?: string }) {
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
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
