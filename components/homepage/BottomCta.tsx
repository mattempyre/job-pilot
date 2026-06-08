import Link from "next/link";

export function BottomCta() {
  return (
    <section className="landing-gradient border-b border-border px-6 py-20 text-center md:px-16 md:py-24">
      <h2 className="mx-auto max-w-[790px] text-[42px] font-bold leading-[1.08] tracking-normal text-text-slate md:text-[56px]">
        Your next job search can feel a lot less overwhelming
      </h2>
      <p className="mx-auto mt-8 max-w-[780px] text-[18px] font-normal leading-8 text-text-slate">
        Set up your profile, upload your resume, and start finding matches in
        minutes.
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
    </section>
  );
}
