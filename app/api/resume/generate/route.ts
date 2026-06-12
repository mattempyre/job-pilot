import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import {
  createFallbackResumeContentFromProfile,
  generateResumeContentFromProfile,
} from "@/agent/resume-generation";
import {
  E2E_AUTH_COOKIE,
  E2E_PROFILE_COOKIE,
  getE2ESessionFromCookieValues,
} from "@/lib/e2e-auth";
import {
  getE2EProfileRecord,
  saveE2EGeneratedResumeReference,
} from "@/lib/e2e-profile";
import { createInsforgeServer } from "@/lib/insforge-server";
import { captureProfileCompletedEvent } from "@/lib/posthog-server";
import {
  calculateCompletion,
  mapProfileRecordToViewModel,
  parseProfileRecord,
} from "@/lib/profile";
import { renderResumePdfBuffer } from "@/lib/resume-renderer";
import {
  enforceRateLimit,
  forbiddenResponse,
  isSameOriginRequest,
  rateLimitResponse,
} from "@/lib/security";

export const runtime = "nodejs";

const RESUME_GENERATE_RATE_LIMIT = 4;
const RESUME_GENERATE_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RESUME_NOT_READY_ERROR =
  "Complete and save the required profile fields before generating a resume.";
const RESUME_CHANGED_ERROR =
  "Your active resume changed while generation was running. Refresh and try again.";

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isUserResumeKey(key: string, userId: string): boolean {
  return key.startsWith(`resumes/${userId}/`);
}

async function removeGeneratedResumeAfterFailedSave({
  insforge,
  resumeKey,
}: {
  insforge: Awaited<ReturnType<typeof createInsforgeServer>>;
  resumeKey: string;
}): Promise<void> {
  const { error } = await insforge.storage.from("resumes").remove(resumeKey);

  if (error) {
    console.error(
      "[resume/generate] remove generated resume after failed save",
      error,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return forbiddenResponse();
    }

    const rateLimit = enforceRateLimit(
      request,
      "resume:generate",
      RESUME_GENERATE_RATE_LIMIT,
      RESUME_GENERATE_RATE_LIMIT_WINDOW_MS,
    );

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const e2eSession = getE2ESessionFromCookieValues(
      request.cookies.get(E2E_AUTH_COOKIE)?.value,
      request.cookies.get(E2E_PROFILE_COOKIE)?.value,
    );

    if (e2eSession) {
      const existingProfile = getE2EProfileRecord(e2eSession);
      const profile = mapProfileRecordToViewModel(
        existingProfile,
        e2eSession.user.email,
      );
      const completion = calculateCompletion(profile, true);

      if (!completion.isComplete) {
        return NextResponse.json(
          { success: false, error: RESUME_NOT_READY_ERROR },
          { status: 400 },
        );
      }

      const timestamp = Date.now();
      const resumeKey = `resumes/${e2eSession.user.id}/generated-resume-${timestamp}.pdf`;
      saveE2EGeneratedResumeReference(e2eSession, {
        key: resumeKey,
        url: `/e2e/generated-resume-${timestamp}.pdf`,
      });

      revalidatePath("/profile");

      return NextResponse.json({
        success: true,
        data: {
          fileDetails: "Generated just now",
          fileName: "Generated resume.pdf",
          key: resumeKey,
          url: `/e2e/generated-resume-${timestamp}.pdf`,
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
        { success: false, error: "Please sign in again before generating." },
        { status: 401 },
      );
    }

    const { data: existingData, error: existingError } =
      await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (existingError) {
      console.error("[resume/generate] load profile", existingError);
      return NextResponse.json(
        { success: false, error: "Could not load your current profile." },
        { status: 500 },
      );
    }

    const existingProfile = parseProfileRecord(existingData);
    const profile = mapProfileRecordToViewModel(
      existingProfile,
      user.email ?? "",
    );
    const completion = calculateCompletion(profile, true);

    if (!existingProfile || !completion.isComplete) {
      return NextResponse.json(
        { success: false, error: RESUME_NOT_READY_ERROR },
        { status: 400 },
      );
    }

    const generation = await generateResumeContentFromProfile(profile);
    const generatedResume = generation.success
      ? generation.data
      : createFallbackResumeContentFromProfile(profile);

    if (!generation.success) {
      console.error("[resume/generate] using deterministic fallback", {
        error: generation.error,
        status: generation.status,
      });
    }

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderResumePdfBuffer({
        generatedResume,
        profile,
      });
    } catch (error) {
      console.error("[resume/generate] render pdf", error);
      return NextResponse.json(
        { success: false, error: "Could not render your resume. Please try again." },
        { status: 500 },
      );
    }

    const timestamp = Date.now();
    const resumeKey = `resumes/${user.id}/generated-resume-${timestamp}.pdf`;
    const resumeBlob = new Blob([new Uint8Array(pdfBuffer)], {
      type: "application/pdf",
    });
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(resumeKey, resumeBlob);

    if (uploadError || !uploadData) {
      console.error("[resume/generate] storage upload", uploadError);
      return NextResponse.json(
        { success: false, error: "Could not save your generated resume." },
        { status: 500 },
      );
    }

    const saveMutation = insforge.database
      .from("profiles")
      .update({
        is_complete: completion.isComplete,
        resume_extracted_at: null,
        resume_extracted_pdf_key: null,
        resume_pdf_key: uploadData.key,
        resume_pdf_url: uploadData.url,
      })
      .eq("id", user.id);
    const saveQuery = existingProfile.resume_pdf_key
      ? saveMutation.eq("resume_pdf_key", existingProfile.resume_pdf_key)
      : saveMutation.is("resume_pdf_key", null);
    const { data: savedData, error: saveError } = await saveQuery
      .select("*")
      .maybeSingle();

    if (saveError) {
      console.error("[resume/generate] save resume reference", saveError);
      await removeGeneratedResumeAfterFailedSave({
        insforge,
        resumeKey: uploadData.key,
      });

      return NextResponse.json(
        { success: false, error: "Could not save your generated resume." },
        { status: 500 },
      );
    }

    if (!savedData) {
      await removeGeneratedResumeAfterFailedSave({
        insforge,
        resumeKey: uploadData.key,
      });

      return NextResponse.json(
        { success: false, error: RESUME_CHANGED_ERROR },
        { status: 409 },
      );
    }

    if (
      existingProfile.resume_pdf_key &&
      existingProfile.resume_pdf_key !== uploadData.key &&
      isUserResumeKey(existingProfile.resume_pdf_key, user.id)
    ) {
      const { error: removePreviousError } = await insforge.storage
        .from("resumes")
        .remove(existingProfile.resume_pdf_key);

      if (removePreviousError) {
        console.error(
          "[resume/generate] remove previous resume",
          removePreviousError,
        );
      }
    }

    if (!existingProfile.is_complete && completion.isComplete) {
      await captureProfileCompletedEvent({ userId: user.id });
    }

    revalidatePath("/profile");

    return NextResponse.json({
      success: true,
      data: {
        fileDetails: `${formatBytes(uploadData.size)} - Generated just now`,
        fileName: "Generated resume.pdf",
        key: uploadData.key,
        url: uploadData.url,
      },
    });
  } catch (error) {
    console.error("[resume/generate]", error);
    return NextResponse.json(
      { success: false, error: "Could not generate your resume. Please try again." },
      { status: 500 },
    );
  }
}
