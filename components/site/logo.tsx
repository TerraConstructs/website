import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * The real TerraConstructs triangle mark, inlined from
 * `public/logos/terraconstructs_triangle_logo.svg` (geometry and colors kept
 * exact — only the SVG 1.0 `style="..."` strings were converted to JSX
 * presentation attributes). The palette (#B382D9 / #995CE3 fill, #5C2BA3
 * stroke) has enough contrast against both the light and dark `--background`
 * to render as-is in either theme, so there is no dark: variant.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      className={cn('size-6', className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="scale(1,-1) translate(0,-256)">
        <polygon
          points="128 238, 32.73721 183, 32.73721 73, 128 18, 223.2628 73, 223.2628 183"
          fill="#B382D9"
          stroke="#5C2BA3"
          strokeWidth={8}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="128 128, 32.73721 73, 128 18, 223.2628 73"
          fill="#B382D9"
          stroke="#5C2BA3"
          strokeWidth={1}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="128 128, 128 238, 32.73721 183, 32.73721 73"
          fill="#B382D9"
          stroke="#5C2BA3"
          strokeWidth={1}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="128 128, 223.2628 73, 223.2628 183, 128 238"
          fill="#995CE3"
          stroke="#5C2BA3"
          strokeWidth={1}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <path d="M 128,238 L 128,128 Z" stroke="#5C2BA3" strokeWidth={2} strokeLinecap="butt" />
        <path
          d="M 223.262794,73 L 128,128 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <path
          d="M 32.737206,73 L 128,128 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <polygon
          points="128 128, 128 172, 89.89488 194, 89.89488 150"
          fill="#995CE3"
          strokeWidth={0}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="128 128, 166.1051 150, 166.1051 194, 128 172"
          fill="#B382D9"
          strokeWidth={0}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="128 172, 166.1051 194, 128 216, 89.89488 194"
          fill="#B382D9"
          strokeWidth={0}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="89.89488 62, 89.89488 106, 51.78976 128, 51.78976 84"
          fill="#995CE3"
          strokeWidth={0}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="89.89488 62, 128 84, 128 128, 89.89488 106"
          fill="#B382D9"
          strokeWidth={0}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="89.89488 106, 128 128, 89.89488 150, 51.78976 128"
          fill="#B382D9"
          strokeWidth={0}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="166.1051 62, 166.1051 106, 128 128, 128 84"
          fill="#995CE3"
          strokeWidth={0}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="166.1051 62, 204.2102 84, 204.2102 128, 166.1051 106"
          fill="#B382D9"
          strokeWidth={0}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="166.1051 106, 204.2102 128, 166.1051 150, 128 128"
          fill="#B382D9"
          strokeWidth={0}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <polygon
          points="128 216.0891, 89.8177 194.0446, 89.8177 149.9554, 128 127.9109, 166.1823 149.9554, 166.1823 194.0446"
          fill="none"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <path d="M 128,172 L 128,127.910882 Z" stroke="#5C2BA3" strokeWidth={2} strokeLinecap="butt" />
        <path
          d="M 128,172 L 166.182296,194.044559 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <path
          d="M 128,172 L 89.817704,194.044559 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <polygon
          points="89.89488 150.0891, 51.71259 128.0446, 51.71259 83.95544, 89.89488 61.91088, 128.0772 83.95544, 128.0772 128.0446"
          fill="none"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <path
          d="M 89.894882,106 L 89.894882,61.910882 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <path
          d="M 89.894882,106 L 128.077178,128.044559 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <path
          d="M 89.894882,106 L 51.712586,128.044559 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <polygon
          points="166.1051 150.0891, 127.9228 128.0446, 127.9228 83.95544, 166.1051 61.91088, 204.2874 83.95544, 204.2874 128.0446"
          fill="none"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
          fillRule="evenodd"
        />
        <path
          d="M 166.105118,106 L 166.105118,61.910882 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <path
          d="M 166.105118,106 L 204.287414,128.044559 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <path
          d="M 166.105118,106 L 127.922822,128.044559 Z"
          stroke="#5C2BA3"
          strokeWidth={2}
          strokeLinecap="butt"
        />
      </g>
    </svg>
  )
}

/**
 * Full wordmark + mark lockup. Served from `public/logos/*.svg` as plain
 * `<img>` (not `next/image` — `images.unoptimized` is on for the static
 * export, so it buys nothing) and swapped with `dark:`/`hidden` classes
 * rather than a JS theme check, so there's no hydration flash.
 *
 * The two source files are named by the *color of their wordmark text*, not
 * the background they suit: `_dark` renders black text (for light
 * backgrounds), `_light` renders white text (for dark backgrounds) — verified
 * by reading the SVGs directly.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="TerraConstructs — home"
      className={cn(
        'group flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <img
        src="/logos/terraconstructs_horizontal_dark.svg"
        alt=""
        aria-hidden
        width={1261}
        height={256}
        className="block h-6 w-auto transition-transform duration-300 group-hover:-translate-y-0.5 dark:hidden"
      />
      <img
        src="/logos/terraconstructs_horizontal_light.svg"
        alt=""
        aria-hidden
        width={1261}
        height={256}
        className="hidden h-6 w-auto transition-transform duration-300 group-hover:-translate-y-0.5 dark:block"
      />
    </Link>
  )
}
