import { Building2 } from "lucide-react";

import { MatchScore } from "@/components/find-jobs/MatchScore";
import { SourceBadge } from "@/components/find-jobs/SourceBadge";
import type { MockJob } from "@/components/find-jobs/types";

type Props = {
  jobs: MockJob[];
};

export function JobsMobileList({ jobs }: Props) {
  return (
    <div className="grid gap-3 p-4 lg:hidden">
      {jobs.map((job) => (
        <article
          className="rounded-xl border border-border bg-surface-secondary p-4"
          key={job.id}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text-muted">
              <Building2 aria-hidden="true" className="size-5" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[14px] font-semibold leading-5 text-text-primary">
                  {job.company}
                </h2>
                <SourceBadge source={job.source} />
              </div>
              <p className="mt-1 text-[14px] font-medium leading-5 text-text-dark">
                {job.role}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <MatchScore score={job.matchScore} />
            <div className="grid grid-cols-2 gap-3 text-[12px] leading-4">
              <div>
                <p className="font-medium uppercase text-text-muted">
                  Salary Est.
                </p>
                <p className="mt-1 font-semibold text-text-secondary">
                  {job.salary}
                </p>
              </div>
              <div>
                <p className="font-medium uppercase text-text-muted">
                  Date Found
                </p>
                <p className="mt-1 font-semibold text-text-secondary">
                  {job.foundAtLabel}
                </p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
