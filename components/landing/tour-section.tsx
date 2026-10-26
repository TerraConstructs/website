import { getDemos } from '@/lib/demos'
import { GuidedTour } from '@/components/tour/guided-tour'

export async function TourSection() {
  const demos = await getDemos()

  return (
    <section id="guided-tour" className="scroll-mt-16 border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <span className="label-mono">Guided tour</span>
          <h2 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            From CDK to HCL.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            The HCL on the right is real synthesized output of the TypeScript on the left.
            Step through it and watch which lines each construct is responsible for.
          </p>
        </div>

        <div className="mt-10">
          <GuidedTour demos={demos} />
        </div>
      </div>
    </section>
  )
}
