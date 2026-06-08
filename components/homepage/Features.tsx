import Image from "next/image";

const confidenceFeatures = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what’s missing.",
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
    active: true,
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export function Features() {
  return (
    <section className="bg-surface">
      <div className="h-20 border-b border-border landing-stripes" />
      <div className="grid border-b border-border lg:grid-cols-2">
        <div className="flex items-center justify-center border-b border-border bg-surface-muted px-8 py-16 md:px-16 lg:border-b-0 lg:border-r">
          <Image
            src="/images/agnet-log.png"
            alt="JobPilot agent log preview"
            width={670}
            height={517}
            loading="eager"
            className="w-full max-w-[560px] rounded-xl"
          />
        </div>

        <div className="bg-surface">
          <div className="px-8 py-16 md:px-16 md:py-20">
            <h2 className="max-w-[620px] text-[42px] font-bold leading-[1.08] tracking-normal text-text-slate md:text-[52px]">
              Apply With More Confidence, Every Time
            </h2>
          </div>

          <div className="divide-y divide-border border-t border-border">
            {confidenceFeatures.map((feature) => (
              <div
                key={feature.title}
                className="relative px-8 py-10 md:px-16 md:py-12"
              >
                {feature.active ? (
                  <span className="absolute bottom-0 left-12 top-0 w-px bg-success md:left-12" />
                ) : null}
                <div className="relative max-w-[600px]">
                  <h3 className="text-[21px] font-bold leading-7 text-text-slate">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-[19px] font-normal leading-8 text-text-slate-medium">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-20 border-b border-border landing-stripes" />
    </section>
  );
}
