"use client";

import { useRef, useState, type DragEvent, type JSX } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

type ResumeUploadProps = {
  fileName: string;
  fileDetails: string;
  isMissing: boolean;
};

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

type UploadResponse = {
  success: boolean;
  data?: {
    fileName: string;
    fileDetails: string;
    key: string;
    url: string;
  };
  error?: string;
};

export function ResumeUpload({
  fileName,
  fileDetails,
  isMissing,
}: ResumeUploadProps): JSX.Element {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const [currentFileDetails, setCurrentFileDetails] = useState(fileDetails);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);

  function openFilePicker(): void {
    inputRef.current?.click();
  }

  function validateFile(file: File): string | null {
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return "Resume upload supports PDF files only.";
    }

    if (file.size > 10 * 1024 * 1024) {
      return "Resume PDF must be 10 MB or smaller.";
    }

    return null;
  }

  function handleSelectedFile(file: File): void {
    const validationError = validateFile(file);
    if (validationError) {
      setStatus("error");
      setError(validationError);
      return;
    }

    if (hasResume) {
      setReplacementFile(file);
      setStatus("idle");
      setError(null);
      return;
    }

    uploadFile(file);
  }

  function uploadFile(file: File): void {
    const formData = new FormData();
    formData.append("resume", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/resume/upload");
    xhr.withCredentials = true;

    setStatus("uploading");
    setProgress(0);
    setError(null);
    setReplacementFile(null);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      setProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      setProgress(100);
      setStatus("processing");

      let response: UploadResponse | null = null;
      try {
        const parsed: unknown = JSON.parse(xhr.responseText);
        if (isUploadResponse(parsed)) {
          response = parsed;
        }
      } catch {
        response = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && response?.success) {
        setCurrentFileName(response.data?.fileName ?? file.name);
        setCurrentFileDetails(
          response.data?.fileDetails ?? "Uploaded just now",
        );
        setStatus("success");
        router.refresh();
        return;
      }

      setStatus("error");
      setError(response?.error ?? "Could not upload your resume. Please try again.");
    };

    xhr.onerror = () => {
      setStatus("error");
      setError("Could not upload your resume. Please try again.");
    };

    xhr.send(formData);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    if (file) {
      handleSelectedFile(file);
    }
  }

  const isBusy = status === "uploading" || status === "processing";
  const hasResume = Boolean(currentFileName);

  return (
    <section
      id="profile-resume"
      className={`scroll-mt-24 rounded-xl border bg-surface p-6 shadow-sm ${
        isMissing ? "border-accent ring-1 ring-accent/30" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-info-lightest text-info-foreground">
          <FileText aria-hidden="true" className="size-5" strokeWidth={2} />
        </div>

        <div>
          <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
            Resume
          </h2>
        <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">
          Keep one active PDF attached to your profile.
        </p>
        {isMissing ? (
          <p className="mt-2 text-[12px] font-medium leading-4 text-accent">
            Required for profile completion.
          </p>
        ) : null}
      </div>
      </div>

      <div
        className="mt-6 rounded-xl border border-dashed border-border bg-surface-secondary px-6 py-8 text-center transition-[border-color,background-color] hover:border-accent hover:bg-surface"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.item(0);
            if (file) {
              handleSelectedFile(file);
            }
            event.target.value = "";
          }}
          type="file"
        />

        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface text-accent shadow-sm">
          {status === "success" ? (
            <CheckCircle2
              aria-hidden="true"
              className="size-5 animate-pulse text-success"
              strokeWidth={2}
            />
          ) : isBusy ? (
            <Loader2
              aria-hidden="true"
              className="size-5 animate-spin"
              strokeWidth={2}
            />
          ) : (
            <UploadCloud aria-hidden="true" className="size-5" strokeWidth={2} />
          )}
        </div>

        <p className="mt-4 text-[14px] font-medium leading-5 text-text-primary">
          {status === "uploading"
            ? `Uploading ${progress}%`
            : status === "processing"
              ? "Saving resume"
              : status === "success"
                ? "Resume uploaded"
                : "Click to upload or drag and drop"}
        </p>
        <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
          PDF only. One active resume per profile.
        </p>

        {isBusy ? (
          <progress
            className="mt-5 h-2 w-full max-w-[420px] overflow-hidden rounded-full"
            max={100}
            value={progress}
            aria-label="Resume upload progress"
          />
        ) : null}

        {error ? (
          <p className="mx-auto mt-4 max-w-[420px] text-[14px] font-medium leading-5 text-error">
            {error}
          </p>
        ) : null}

        {replacementFile ? (
          <div className="mx-auto mt-5 max-w-[420px] rounded-xl border border-border bg-surface p-4 text-left shadow-sm">
            <p className="text-[14px] font-semibold leading-5 text-text-primary">
              Replace current resume?
            </p>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-secondary">
              {replacementFile.name} will become the active resume for matching.
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-[12px] font-medium leading-4 text-text-primary shadow-sm transition-[background-color,border-color,color,box-shadow] hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => setReplacementFile(null)}
              >
                Keep current
              </button>
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center rounded-md bg-accent px-3 text-[12px] font-medium leading-4 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => uploadFile(replacementFile)}
              >
                Replace resume
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 text-[14px] font-medium leading-5 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy}
          onClick={openFilePicker}
        >
          {hasResume ? "Replace Resume" : "Select Resume"}
        </button>
      </div>

      {hasResume ? (
        <div className="mt-5 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-success-lightest text-success-foreground">
              <ShieldCheck
                aria-hidden="true"
                className="size-4"
                strokeWidth={2}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium leading-5 text-text-primary">
                {currentFileName}
              </p>
              <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
                {currentFileDetails}
              </p>
            </div>
          </div>
        </div>
      ) : null}

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

function isUploadResponse(value: unknown): value is UploadResponse {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.success === "boolean";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
