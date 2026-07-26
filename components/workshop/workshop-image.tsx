import dimensions from '@/public/workshops/aws/image-dimensions.json'

const SIZES = dimensions as Record<string, { width: number; height: number }>

/**
 * Workshop screenshots. Intrinsic dimensions are captured at conversion time
 * (see scripts/convert-workshop.mjs) and baked in here so the ~29 screenshots
 * reserve their space instead of shifting the page as they load.
 *
 * Plain <img>: next/image adds nothing here because images.unoptimized is on.
 */
export function WorkshopImage({ src = '', alt = '' }: { src?: string; alt?: string }) {
  const size = SIZES[src]

  return (
    <img
      src={src}
      alt={alt}
      width={size?.width}
      height={size?.height}
      loading="lazy"
      decoding="async"
      className="mt-6 h-auto max-w-full rounded-lg border bg-surface"
    />
  )
}
