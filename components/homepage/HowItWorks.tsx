import Image from "next/image";

const manageFeatures = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you’ve found, tailored. Your activity and progress all stay in one simple place.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-surface">
      <div className="h-20 border-b border-border landing-stripes" />
      <div className="grid border-b border-border lg:grid-cols-2">
        <div className="border-b border-border bg-surface lg:border-b-0 lg:border-r">
          <div className="px-8 py-16 md:px-16 md:py-20">
            <h2 className="max-w-[520px] text-[42px] font-bold leading-[1.08] tracking-normal text-text-slate md:text-[52px]">
              Manage Your Job Search With Ease
            </h2>
          </div>

          <div className="divide-y divide-border border-t border-border">
            {manageFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="relative px-8 py-10 md:px-16 md:py-12"
              >
                {index === 0 ? (
                  <span className="absolute bottom-0 left-12 top-0 w-px bg-accent md:left-12" />
                ) : null}
                <div className="relative max-w-[560px] pl-0 md:pl-2">
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

        <div className="flex items-center justify-center bg-surface-muted px-8 py-16 md:px-12">
          <Image
            src="/images/jobs-lists.png"
            alt="Matched jobs list preview"
            width={710}
            height={534}
            loading="eager"
            className="w-full max-w-[610px] rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
