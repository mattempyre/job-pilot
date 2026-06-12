"use client";

import { useRef, useState, type DragEvent, type JSX } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import type { ExtractedProfileData } from "@/lib/profile";

type ResumeUploadProps = {
  canGenerateResume: boolean;
  fileName: string;
  fileDetails: string;
  hasExtractedProfile: boolean;
  isProfileDirty: boolean;
  isMissing: boolean;
  onApplyExtraction: (
    extractedProfile: ExtractedProfileData,
  ) => void;
};

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";
type ExtractionStatus = "idle" | "extracting" | "applied" | "error";
type GenerationStatus = "idle" | "generating" | "success" | "error";

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

type ExtractionResponse = {
  success: boolean;
  data?: ExtractedProfileData;
  error?: string;
};

type GenerateResponse = {
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
  canGenerateResume,
  fileName,
  fileDetails,
  hasExtractedProfile: initialHasExtractedProfile,
  isProfileDirty,
  isMissing,
  onApplyExtraction,
}: ResumeUploadProps): JSX.Element {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [extractionStatus, setExtractionStatus] =
    useState<ExtractionStatus>("idle");
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const [currentFileDetails, setCurrentFileDetails] = useState(fileDetails);
  const [hasExtractedProfile, setHasExtractedProfile] = useState(
    initialHasExtractedProfile,
  );
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [showGenerateConfirmation, setShowGenerateConfirmation] =
    useState(false);

  function openFilePicker(): void {
    inputRef.current?.click();
  }

  function resetExtraction(): void {
    setExtractionStatus("idle");
    setExtractionError(null);
    setApplyMessage(null);
  }

  function resetGeneration(): void {
    setGenerationStatus("idle");
    setGenerationError(null);
    setGenerationMessage(null);
    setShowGenerateConfirmation(false);
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
    resetExtraction();
    resetGeneration();
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
        setHasExtractedProfile(false);
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

  async function extractResume(): Promise<void> {
    if (!hasResume || extractionStatus === "extracting") {
      return;
    }

    setExtractionStatus("extracting");
    setExtractionError(null);
    setApplyMessage(null);

    try {
      const response = await fetch("/api/resume/extract", {
        method: "POST",
        credentials: "same-origin",
      });
      const parsed: unknown = await response.json();

      if (!isExtractionResponse(parsed)) {
        setExtractionStatus("error");
        setExtractionError("Could not extract profile details. Please try again.");
        return;
      }

      if (!response.ok || !parsed.success || !parsed.data) {
        if (response.status === 409) {
          setHasExtractedProfile(true);
        }
        setExtractionStatus("error");
        setExtractionError(
          parsed.error ?? "Could not extract profile details. Please try again.",
        );
        return;
      }

      onApplyExtraction(parsed.data);
      setExtractionStatus("applied");
      setHasExtractedProfile(true);
      setApplyMessage("Profile fields filled in. Review and save below.");
    } catch (extractError) {
      console.error("[resume/upload] extract resume", extractError);
      setExtractionStatus("error");
      setExtractionError("Could not extract profile details. Please try again.");
    }
  }

  async function generateResume(): Promise<void> {
    if (
      generationStatus === "generating" ||
      status === "uploading" ||
      status === "processing" ||
      isProfileDirty ||
      !canGenerateResume
    ) {
      return;
    }

    setGenerationStatus("generating");
    setGenerationError(null);
    setGenerationMessage(null);

    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        credentials: "same-origin",
      });
      const parsed: unknown = await response.json();

      if (!isGenerateResponse(parsed)) {
        setGenerationStatus("error");
        setGenerationError("Could not generate your resume. Please try again.");
        return;
      }

      if (!response.ok || !parsed.success || !parsed.data) {
        setGenerationStatus("error");
        setGenerationError(
          parsed.error ?? "Could not generate your resume. Please try again.",
        );
        return;
      }

      setCurrentFileName(parsed.data.fileName);
      setCurrentFileDetails(parsed.data.fileDetails);
      setHasExtractedProfile(false);
      setShowGenerateConfirmation(false);
      setGenerationStatus("success");
      setGenerationMessage("Generated resume saved. Review it in a new tab.");
      router.refresh();
    } catch (generateError) {
      console.error("[resume/upload] generate resume", generateError);
      setGenerationStatus("error");
      setGenerationError("Could not generate your resume. Please try again.");
    }
  }

  function handleGenerateClick(): void {
    if (!hasResume) {
      generateResume();
      return;
    }

    setShowGenerateConfirmation(true);
    setGenerationError(null);
    setGenerationMessage(null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    if (file) {
      handleSelectedFile(file);
    }
  }

  const isBusy = status === "uploading" || status === "processing";
  const isExtracting = extractionStatus === "extracting";
  const isGenerating = generationStatus === "generating";
  const hasResume = Boolean(currentFileName);
  const extractionLocked = hasResume && hasExtractedProfile;
  const generationDisabled =
    isBusy || isGenerating || isProfileDirty || !canGenerateResume;
  const generationDisabledMessage = !canGenerateResume
    ? "Complete and save the required profile fields before generating a resume."
    : isProfileDirty
      ? "Save your profile changes before generating a resume."
      : null;

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
                disabled={isGenerating}
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
          disabled={isBusy || isGenerating}
          onClick={openFilePicker}
        >
          {hasResume ? "Replace Resume" : "Select Resume"}
        </button>
      </div>

      {hasResume ? (
        <div className="mt-5 rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
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

            <a
              href="/api/resume/current"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-[12px] font-medium leading-4 text-text-primary shadow-sm transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ExternalLink
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={2}
              />
              Review Current Resume
            </a>
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-xl border border-border bg-surface-secondary p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
              Extract profile details
            </h3>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-secondary">
              Fill the profile form from the active PDF, then review before saving.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-[14px] font-medium leading-5 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              !hasResume ||
              isExtracting ||
              isBusy ||
              isGenerating ||
              extractionLocked
            }
            onClick={extractResume}
          >
            {isExtracting ? (
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin"
                strokeWidth={2}
              />
            ) : (
              <Sparkles aria-hidden="true" className="size-4" strokeWidth={2} />
            )}
            {extractionLocked
              ? "Already Extracted"
              : isExtracting
                ? "Extracting..."
                : "Extract from Resume"}
          </button>
        </div>

        {!hasResume ? (
          <p className="mt-3 text-[12px] font-medium leading-4 text-text-muted">
            Upload a PDF resume before extracting profile details.
          </p>
        ) : null}

        {extractionLocked && !applyMessage ? (
          <p className="mt-3 text-[12px] font-medium leading-4 text-text-muted">
            Profile fields were already filled from this PDF. Upload a new PDF to extract again.
          </p>
        ) : null}

        {extractionError ? (
          <p className="mt-3 text-[14px] font-medium leading-5 text-error">
            {extractionError}
          </p>
        ) : null}

        {applyMessage ? (
          <p className="mt-3 text-[14px] font-medium leading-5 text-success-foreground">
            {applyMessage}
          </p>
        ) : null}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface-secondary p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
              Generate resume
            </h3>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-secondary">
              Create a polished PDF from your saved profile.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={generationDisabled}
            onClick={handleGenerateClick}
          >
            {isGenerating ? (
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin"
                strokeWidth={2}
              />
            ) : (
              <Sparkles aria-hidden="true" className="size-4" strokeWidth={2} />
            )}
            {isGenerating ? "Generating..." : "Generate Resume from Profile"}
          </button>
        </div>

        {generationDisabledMessage ? (
          <p className="mt-3 text-[12px] font-medium leading-4 text-text-muted">
            {generationDisabledMessage}
          </p>
        ) : null}

        {showGenerateConfirmation ? (
          <div className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-[14px] font-semibold leading-5 text-text-primary">
              Replace current resume?
            </p>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-secondary">
              JobPilot will generate a new PDF and make it the active resume.
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-[12px] font-medium leading-4 text-text-primary shadow-sm transition-[background-color,border-color,color,box-shadow] hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => setShowGenerateConfirmation(false)}
              >
                Keep current
              </button>
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center rounded-md bg-accent px-3 text-[12px] font-medium leading-4 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                disabled={generationDisabled}
                onClick={generateResume}
              >
                Generate new resume
              </button>
            </div>
          </div>
        ) : null}

        {generationError ? (
          <p className="mt-3 text-[14px] font-medium leading-5 text-error">
            {generationError}
          </p>
        ) : null}

        {generationMessage ? (
          <p className="mt-3 text-[14px] font-medium leading-5 text-success-foreground">
            {generationMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function isUploadResponse(value: unknown): value is UploadResponse {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.success === "boolean";
}

function isExtractionResponse(value: unknown): value is ExtractionResponse {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.success === "boolean";
}

function isGenerateResponse(value: unknown): value is GenerateResponse {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.success === "boolean";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
