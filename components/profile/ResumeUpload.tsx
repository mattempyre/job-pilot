import type { JSX } from "react";
import { FileText, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";

type ResumeUploadProps = {
  fileName: string;
  fileDetails: string;
};

export function ResumeUpload({
  fileName,
  fileDetails,
}: ResumeUploadProps): JSX.Element {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
            Resume
          </h2>
          <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">
            Keep one active PDF attached to your profile.
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-info-lightest text-info-foreground">
          <FileText aria-hidden="true" className="size-5" strokeWidth={2} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-surface-secondary px-6 py-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface text-accent shadow-sm">
          <UploadCloud aria-hidden="true" className="size-5" strokeWidth={2} />
        </div>
        <p className="mt-4 text-[14px] font-medium leading-5 text-text-primary">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
          PDF only. One active resume per profile.
        </p>

        <button
          type="button"
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 text-[14px] font-medium leading-5 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
        >
          Select Resume
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-success-lightest text-success-foreground">
            <ShieldCheck aria-hidden="true" className="size-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium leading-5 text-text-primary">
              {fileName}
            </p>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
              {fileDetails}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
      >
        <Sparkles aria-hidden="true" className="size-4" strokeWidth={2} />
        Generate Resume from Profile
      </button>
    </section>
  );
}
