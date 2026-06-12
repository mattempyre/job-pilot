import type { JSX } from "react";
import { Link2 } from "lucide-react";

export function ConnectedAccounts(): JSX.Element {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-linkedin-light text-linkedin">
          <Link2 aria-hidden="true" className="size-5" strokeWidth={2} />
        </div>

        <div>
          <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
            Connected Accounts
          </h2>
          <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">
            Connect your LinkedIn to let the agent handle manual apply with
            LinkedIn workflows.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-md bg-linkedin-light text-[18px] font-semibold leading-6 text-linkedin"
          >
            in
          </div>
          <div>
            <p className="text-[16px] font-medium leading-6 text-text-primary">
              LinkedIn
            </p>
            <p className="text-[14px] font-normal leading-5 text-text-muted">
              Not connected
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-linkedin px-6 text-[16px] font-medium leading-6 text-linkedin-foreground shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-linkedin focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
        >
          Connect LinkedIn
        </button>
      </div>
    </section>
  );
}
