import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import {
  E2E_AUTH_COOKIE,
  E2E_PROFILE_COOKIE,
  getE2ESessionFromCookieValues,
} from "@/lib/e2e-auth";
import { saveE2EResumeReference } from "@/lib/e2e-profile";
import { createInsforgeServer } from "@/lib/insforge-server";
import { captureProfileCompletedEvent } from "@/lib/posthog-server";
import {
  calculateCompletion,
  mapProfileRecordToViewModel,
  parseProfileRecord,
} from "@/lib/profile";
import {
  enforceRateLimit,
  forbiddenResponse,
  isSameOriginRequest,
  rateLimitResponse,
} from "@/lib/security";

const RESUME_UPLOAD_RATE_LIMIT = 12;
const RESUME_UPLOAD_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024;
const PDF_SIGNATURE = "%PDF-";

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasPdfMetadata(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

async function hasPdfSignature(file: File): Promise<boolean> {
  if (file.size < PDF_SIGNATURE.length) {
    return false;
  }

  const header = new Uint8Array(
    await file.slice(0, PDF_SIGNATURE.length).arrayBuffer(),
  );

  return Array.from(PDF_SIGNATURE).every(
    (character, index) => header[index] === character.charCodeAt(0),
  );
}

function isUserResumeKey(key: string, userId: string): boolean {
  return key.startsWith(`resumes/${userId}/`);
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return forbiddenResponse();
    }

    const rateLimit = enforceRateLimit(
      request,
      "resume:upload",
      RESUME_UPLOAD_RATE_LIMIT,
      RESUME_UPLOAD_RATE_LIMIT_WINDOW_MS,
    );

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const e2eSession = getE2ESessionFromCookieValues(
      request.cookies.get(E2E_AUTH_COOKIE)?.value,
      request.cookies.get(E2E_PROFILE_COOKIE)?.value,
    );

    if (e2eSession) {
      const formData = await request.formData();
      const resume = formData.get("resume");

      if (!(resume instanceof File)) {
        return NextResponse.json(
          { success: false, error: "Choose a PDF resume before uploading." },
          { status: 400 },
        );
      }

      if (!hasPdfMetadata(resume) || !(await hasPdfSignature(resume))) {
        return NextResponse.json(
          { success: false, error: "Resume upload supports PDF files only." },
          { status: 400 },
        );
      }

      if (resume.size > MAX_RESUME_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: "Resume PDF must be 10 MB or smaller." },
          { status: 400 },
        );
      }

      const timestamp = Date.now();
      const resumeKey = `resumes/${e2eSession.user.id}/e2e-resume-${timestamp}.pdf`;
      const profile = saveE2EResumeReference(e2eSession, {
        key: resumeKey,
        url: `/e2e/resume-${timestamp}.pdf`,
      });
      const profileView = mapProfileRecordToViewModel(
        profile,
        e2eSession.user.email,
      );
      const completion = calculateCompletion(profileView, true);

      revalidatePath("/profile");

      return NextResponse.json({
        success: true,
        data: {
          fileName: resume.name,
          fileDetails: `${formatBytes(resume.size)} - Uploaded just now`,
          key: resumeKey,
          url: `/e2e/resume-${timestamp}.pdf`,
          completion,
        },
      });
    }

    const insforge = await createInsforgeServer();
    const {
      data: { user },
      error: userError,
    } = await insforge.auth.getCurrentUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Please sign in again before uploading." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const resume = formData.get("resume");

    if (!(resume instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Choose a PDF resume before uploading." },
        { status: 400 },
      );
    }

    if (!hasPdfMetadata(resume) || !(await hasPdfSignature(resume))) {
      return NextResponse.json(
        { success: false, error: "Resume upload supports PDF files only." },
        { status: 400 },
      );
    }

    if (resume.size > MAX_RESUME_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Resume PDF must be 10 MB or smaller." },
        { status: 400 },
      );
    }

    const { data: existingData, error: existingError } =
      await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (existingError) {
      console.error("[resume/upload] load existing profile", existingError);
      return NextResponse.json(
        { success: false, error: "Could not load your current profile." },
        { status: 500 },
      );
    }

    const existingProfile = parseProfileRecord(existingData);
    const timestamp = Date.now();
    const resumeKey = `resumes/${user.id}/resume-${timestamp}.pdf`;
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(resumeKey, resume);

    if (uploadError || !uploadData) {
      console.error("[resume/upload] storage upload", uploadError);
      return NextResponse.json(
        { success: false, error: "Could not upload your resume. Please try again." },
        { status: 500 },
      );
    }

    const profileView = mapProfileRecordToViewModel(
      existingProfile,
      user.email ?? "",
    );
    const completion = calculateCompletion(profileView, true);

    const { error: saveError } = await insforge.database
      .from("profiles")
      .upsert({
        id: user.id,
        email: existingProfile?.email ?? user.email ?? "",
        resume_pdf_url: uploadData.url,
        resume_pdf_key: uploadData.key,
        resume_extracted_pdf_key: null,
        resume_extracted_at: null,
        is_complete: completion.isComplete,
      })
      .select()
      .single();

    if (saveError) {
      console.error("[resume/upload] save resume reference", saveError);
      return NextResponse.json(
        { success: false, error: "Could not save your resume. Please try again." },
        { status: 500 },
      );
    }

    if (
      existingProfile?.resume_pdf_key &&
      existingProfile.resume_pdf_key !== uploadData.key &&
      isUserResumeKey(existingProfile.resume_pdf_key, user.id)
    ) {
      const { error: removeError } = await insforge.storage
        .from("resumes")
        .remove(existingProfile.resume_pdf_key);

      if (removeError) {
        console.error("[resume/upload] remove previous resume", removeError);
      }
    }

    if (!existingProfile?.is_complete && completion.isComplete) {
      await captureProfileCompletedEvent({ userId: user.id });
    }

    revalidatePath("/profile");

    return NextResponse.json({
      success: true,
      data: {
        fileName: resume.name,
        fileDetails: `${formatBytes(uploadData.size)} - Uploaded just now`,
        key: uploadData.key,
        url: uploadData.url,
        completion,
      },
    });
  } catch (error) {
    console.error("[resume/upload]", error);
    return NextResponse.json(
      { success: false, error: "Could not upload your resume. Please try again." },
      { status: 500 },
    );
  }
}
