import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/lib/site'

/**
 * Google Analytics 4, carried over from the previous site so historical data
 * stays continuous. Unlike the old site — where the tag lived only in the
 * hand-written landing page `index.html` and blog traffic went unmeasured —
 * this sits in the root layout and therefore covers every route.
 *
 * Deliberately not @vercel/analytics: the site is moving to S3 + CloudFront,
 * where that package reports nothing.
 */
export function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  )
}
