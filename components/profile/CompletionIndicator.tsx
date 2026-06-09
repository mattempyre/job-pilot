import type { JSX } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type CompletionIndicatorProps = {
  completion: number;
  missingFields: string[];
  completedFields: string[];
};

export function CompletionIndicator({
  completion,
  missingFields,
  completedFields,
}: CompletionIndicatorProps): JSX.Element {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
            <AlertCircle aria-hidden="true" className="size-5" strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
              Profile needs attention
            </h2>
            <p className="mt-2 max-w-[540px] text-[14px] font-normal leading-5 text-text-secondary">
              Complete the highlighted fields so JobPilot can score matches
              against the profile recruiters will actually see.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="rounded-full bg-accent-muted px-3 py-1 text-[12px] font-medium leading-4 text-accent"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div
            className="relative size-28 shrink-0 text-accent"
            aria-label={`${completion}% profile complete`}
            role="img"
          >
            <svg className="size-full" viewBox="0 0 100 100">
              <circle
                className="stroke-border"
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="8"
              />
              <circle
                className="stroke-current"
                cx="50"
                cy="50"
                r="42"
                fill="none"
                pathLength="100"
                strokeDasharray={`${completion} 100`}
                strokeLinecap="round"
                strokeWidth="8"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[24px] font-semibold leading-8 text-text-primary">
                {completion}%
              </span>
              <span className="text-[12px] font-normal leading-4 text-text-muted">
                complete
              </span>
            </div>
          </div>

          <div className="hidden min-w-[180px] flex-col gap-2 xl:flex">
            {completedFields.map((field) => (
              <div key={field} className="flex items-center gap-2">
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 text-success"
                  strokeWidth={2}
                />
                <span className="text-[12px] font-normal leading-4 text-text-secondary">
                  {field}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
