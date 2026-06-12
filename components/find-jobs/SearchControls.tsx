"use client";

import { Search, Sparkles } from "lucide-react";

type Props = {
  jobTitle: string;
  location: string;
  strongMatches: number;
  totalJobs: number;
  onJobTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: () => void;
};

export function SearchControls({
  jobTitle,
  location,
  strongMatches,
  totalJobs,
  onJobTitleChange,
  onLocationChange,
  onSubmit,
}: Props) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm md:p-6">
      <form
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="grid gap-2">
          <span className="text-[12px] font-semibold uppercase leading-4 text-text-secondary">
            Job Title
          </span>
          <span className="flex h-12 items-center gap-3 rounded-md border border-border bg-surface px-4 shadow-sm transition-[border-color,box-shadow] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <Search
              aria-hidden="true"
              className="size-5 shrink-0 text-text-muted"
              strokeWidth={2}
            />
            <input
              className="min-w-0 flex-1 bg-transparent text-[15px] font-medium leading-5 text-text-primary outline-none placeholder:text-text-muted"
              onChange={(event) => onJobTitleChange(event.target.value)}
              placeholder="Frontend Engineer"
              type="text"
              value={jobTitle}
            />
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-[12px] font-semibold uppercase leading-4 text-text-secondary">
            Location
          </span>
          <input
            className="h-12 rounded-md border border-border bg-surface px-4 text-[15px] font-medium leading-5 text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent"
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="Remote, New York..."
            type="text"
            value={location}
          />
        </label>

        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-[14px] font-semibold leading-5 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
          type="submit"
        >
          <Search aria-hidden="true" className="size-5" strokeWidth={2} />
          Find Jobs
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3 rounded-md border border-success-light bg-success-lightest px-4 py-3 text-success-foreground">
        <Sparkles aria-hidden="true" className="size-5 shrink-0" strokeWidth={2} />
        <p className="text-[14px] font-semibold leading-5">
          Found {totalJobs} jobs and saved {strongMatches} strong matches.
        </p>
      </div>
    </section>
  );
}
