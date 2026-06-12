import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { extractProfileDataFromResumeText } from "@/agent/resume-extraction";
import {
  E2E_AUTH_COOKIE,
  E2E_PROFILE_COOKIE,
  getE2ESessionFromCookieValues,
} from "@/lib/e2e-auth";
import {
  getE2EExtractedProfileData,
  getE2EProfileRecord,
  hasE2EResumeBeenExtracted,
  markE2EResumeExtracted,
} from "@/lib/e2e-profile";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parseProfileRecord } from "@/lib/profile";
import { extractPdfTextFromBlob } from "@/lib/resume-pdf";
import {
  enforceRateLimit,
  forbiddenResponse,
  isSameOriginRequest,
  rateLimitResponse,
} from "@/lib/security";

export const runtime = "nodejs";

const RESUME_EXTRACT_RATE_LIMIT = 6;
const RESUME_EXTRACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MIN_RESUME_TEXT_LENGTH = 180;
const UNREADABLE_PDF_ERROR =
  "Could not extract text from this PDF. Please try a different file.";
const PDF_PARSER_UNAVAILABLE_ERROR =
  "Resume extraction is temporarily unavailable. Please try again later.";
const RESUME_ALREADY_EXTRACTED_ERROR =
  "This resume has already been extracted. Upload a new PDF to extract again.";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isPdfParserInfrastructureError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("setting up fake worker failed") ||
    message.includes("pdf.worker") ||
    message.includes("cannot find module") ||
    message.includes("module not found") ||
    message.includes("@napi-rs/canvas")
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
      "resume:extract",
      RESUME_EXTRACT_RATE_LIMIT,
      RESUME_EXTRACT_RATE_LIMIT_WINDOW_MS,
    );

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const e2eSession = getE2ESessionFromCookieValues(
      request.cookies.get(E2E_AUTH_COOKIE)?.value,
      request.cookies.get(E2E_PROFILE_COOKIE)?.value,
    );

    if (e2eSession) {
      const profile = getE2EProfileRecord(e2eSession);

      if (!profile.resume_pdf_key) {
        return NextResponse.json(
          { success: false, error: "Upload a resume before extracting profile details." },
          { status: 400 },
        );
      }

      if (hasE2EResumeBeenExtracted(e2eSession)) {
        return NextResponse.json(
          { success: false, error: RESUME_ALREADY_EXTRACTED_ERROR },
          { status: 409 },
        );
      }

      markE2EResumeExtracted(e2eSession);
      revalidatePath("/profile");

      return NextResponse.json({
        success: true,
        data: getE2EExtractedProfileData(),
      });
    }

    const insforge = await createInsforgeServer();
    const {
      data: { user },
      error: userError,
    } = await insforge.auth.getCurrentUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Please sign in again before extracting." },
        { status: 401 },
      );
    }

    const { data: profileData, error: profileError } =
      await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error("[resume/extract] load profile", profileError);
      return NextResponse.json(
        { success: false, error: "Could not load your current profile." },
        { status: 500 },
      );
    }

    const profile = parseProfileRecord(profileData);
    const resumeKey = profile?.resume_pdf_key ?? "";
    const extractionMarkerKey = profile?.resume_extracted_pdf_key ?? null;

    if (!resumeKey) {
      return NextResponse.json(
        { success: false, error: "Upload a resume before extracting profile details." },
        { status: 400 },
      );
    }

    if (!isUserResumeKey(resumeKey, user.id)) {
      console.error("[resume/extract] resume key outside user prefix");
      return NextResponse.json(
        { success: false, error: "Could not read your resume." },
        { status: 403 },
      );
    }

    if (extractionMarkerKey === resumeKey) {
      return NextResponse.json(
        { success: false, error: RESUME_ALREADY_EXTRACTED_ERROR },
        { status: 409 },
      );
    }

    const { data: resumeBlob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(resumeKey);

    if (downloadError || !resumeBlob) {
      console.error("[resume/extract] download resume", downloadError);
      return NextResponse.json(
        { success: false, error: "Could not read your resume." },
        { status: 500 },
      );
    }

    let resumeText = "";
    try {
      resumeText = await extractPdfTextFromBlob(resumeBlob);
    } catch (error) {
      console.error("[resume/extract] parse pdf", error);
      if (isPdfParserInfrastructureError(error)) {
        return NextResponse.json(
          { success: false, error: PDF_PARSER_UNAVAILABLE_ERROR },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { success: false, error: UNREADABLE_PDF_ERROR },
        { status: 400 },
      );
    }

    if (resumeText.length < MIN_RESUME_TEXT_LENGTH) {
      return NextResponse.json(
        { success: false, error: UNREADABLE_PDF_ERROR },
        { status: 400 },
      );
    }

    if (
      extractionMarkerKey &&
      extractionMarkerKey !== resumeKey
    ) {
      const { error: staleMarkerError } = await insforge.database
        .from("profiles")
        .update({
          resume_extracted_at: null,
          resume_extracted_pdf_key: null,
        })
        .eq("id", user.id)
        .eq("resume_pdf_key", resumeKey)
        .eq("resume_extracted_pdf_key", extractionMarkerKey);

      if (staleMarkerError) {
        console.error("[resume/extract] clear stale extraction marker", staleMarkerError);
      }
    }

    const { data: reservationData, error: reservationError } =
      await insforge.database
        .from("profiles")
        .update({
          resume_extracted_at: new Date().toISOString(),
          resume_extracted_pdf_key: resumeKey,
        })
        .eq("id", user.id)
        .eq("resume_pdf_key", resumeKey)
        .is("resume_extracted_pdf_key", null)
        .select("id")
        .maybeSingle();

    if (reservationError) {
      console.error("[resume/extract] reserve extraction marker", reservationError);
      return NextResponse.json(
        { success: false, error: "Could not save extraction status. Please try again." },
        { status: 500 },
      );
    }

    if (!reservationData) {
      return NextResponse.json(
        { success: false, error: RESUME_ALREADY_EXTRACTED_ERROR },
        { status: 409 },
      );
    }

    const extraction = await extractProfileDataFromResumeText(resumeText);
    if (!extraction.success) {
      const { error: clearMarkerError } = await insforge.database
        .from("profiles")
        .update({
          resume_extracted_at: null,
          resume_extracted_pdf_key: null,
        })
        .eq("id", user.id)
        .eq("resume_pdf_key", resumeKey)
        .eq("resume_extracted_pdf_key", resumeKey);

      if (clearMarkerError) {
        console.error("[resume/extract] clear failed extraction marker", clearMarkerError);
      }

      return NextResponse.json(
        { success: false, error: extraction.error },
        { status: extraction.status },
      );
    }

    revalidatePath("/profile");

    return NextResponse.json({
      success: true,
      data: extraction.data,
    });
  } catch (error) {
    console.error("[resume/extract]", error);
    return NextResponse.json(
      { success: false, error: "Could not extract profile details. Please try again." },
      { status: 500 },
    );
  }
}
