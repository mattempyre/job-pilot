import { Building2 } from "lucide-react";

import { MatchScore } from "@/components/find-jobs/MatchScore";
import { SourceBadge } from "@/components/find-jobs/SourceBadge";
import type { MockJob } from "@/components/find-jobs/types";

type Props = {
  jobs: MockJob[];
};

export function JobsTable({ jobs }: Props) {
  return (
    <div className="hidden overflow-hidden rounded-t-xl border-b border-border lg:block">
      <table className="w-full border-collapse">
        <thead className="bg-surface-secondary">
          <tr className="border-b border-border">
            {["Company", "Role", "Match Score", "Salary Est.", "Source", "Date Found"].map(
              (heading) => (
                <th
                  className="px-6 py-4 text-left text-[12px] font-semibold uppercase leading-4 text-text-secondary"
                  key={heading}
                  scope="col"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              className="border-b border-border bg-surface transition-colors hover:bg-surface-secondary"
              key={job.id}
            >
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted">
                    <Building2
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="text-[14px] font-semibold leading-5 text-text-primary">
                    {job.company}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 text-[14px] font-medium leading-5 text-text-dark">
                {job.role}
              </td>
              <td className="px-6 py-5">
                <MatchScore score={job.matchScore} />
              </td>
              <td className="px-6 py-5 text-[14px] font-medium leading-5 text-text-secondary">
                {job.salary}
              </td>
              <td className="px-6 py-5">
                <SourceBadge source={job.source} />
              </td>
              <td className="px-6 py-5 text-[14px] font-medium leading-5 text-text-secondary">
                {job.foundAtLabel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
