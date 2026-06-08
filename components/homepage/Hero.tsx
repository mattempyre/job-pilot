import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-16">
      <div className="landing-gradient border-y border-border px-6 py-24 text-center md:px-16 md:py-28">
        <h1 className="mx-auto max-w-[840px] text-[48px] font-bold leading-[1.08] tracking-normal text-text-slate md:text-[64px]">
          Job hunting is hard.
          <br />
          Your tools shouldn’t be.
        </h1>
        <p className="mx-auto mt-8 max-w-[690px] text-[18px] font-normal leading-8 text-text-slate-medium">
          Stop applying blind. JobPilot finds the jobs, researches the
          companies, and gives you everything you need to stand out.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center gap-3 rounded-md bg-overlay-dark px-6 text-[18px] font-semibold leading-6 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-overlay hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
          >
            Get Started
            <span className="text-text-muted" aria-hidden="true">
              ▶
            </span>
          </Link>
          <Link
            href="/find-jobs"
            className="inline-flex min-h-12 items-center rounded-md border border-border-muted bg-surface/70 px-7 text-[18px] font-medium leading-6 text-text-slate shadow-sm transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-surface hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
          >
            Find Your First Match
          </Link>
        </div>
      </div>

      <div className="overflow-hidden border-b border-border bg-surface-tertiary px-6 pt-16 md:px-10 md:pt-20">
        <Image
          src="/images/dashboard-demo.png"
          alt="JobPilot dashboard preview"
          width={1197}
          height={604}
          priority
          className="mx-auto -mb-4 w-full max-w-[1180px] rounded-xl"
        />
      </div>
    </section>
  );
}
