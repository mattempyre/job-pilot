import { NextRequest, NextResponse } from "next/server";

import {
  E2E_AUTH_COOKIE,
  E2E_PROFILE_COOKIE,
  getE2ESessionFromCookieValues,
} from "@/lib/e2e-auth";
import { getE2EProfileRecord } from "@/lib/e2e-profile";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parseProfileRecord } from "@/lib/profile";

export const runtime = "nodejs";

const NO_RESUME_ERROR = "No active resume is available to review.";
const FAKE_E2E_PDF = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 72 720 Td (JobPilot Resume) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000202 00000 n 
trailer
<< /Root 1 0 R /Size 5 >>
startxref
296
%%EOF`;

function isUserResumeKey(key: string, userId: string): boolean {
  return key.startsWith(`resumes/${userId}/`);
}

function createInlinePdfResponse(buffer: Buffer): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'inline; filename="jobpilot-resume.pdf"',
      "Content-Length": String(buffer.length),
      "Content-Type": "application/pdf",
    },
    status: 200,
  });
}

export async function GET(request: NextRequest) {
  try {
    const e2eSession = getE2ESessionFromCookieValues(
      request.cookies.get(E2E_AUTH_COOKIE)?.value,
      request.cookies.get(E2E_PROFILE_COOKIE)?.value,
    );

    if (e2eSession) {
      const profile = getE2EProfileRecord(e2eSession);
      if (!profile.resume_pdf_key) {
        return NextResponse.json(
          { success: false, error: NO_RESUME_ERROR },
          { status: 404 },
        );
      }

      return createInlinePdfResponse(Buffer.from(FAKE_E2E_PDF));
    }

    const insforge = await createInsforgeServer();
    const {
      data: { user },
      error: userError,
    } = await insforge.auth.getCurrentUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Please sign in again before reviewing." },
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
      console.error("[resume/current] load profile", profileError);
      return NextResponse.json(
        { success: false, error: "Could not load your current profile." },
        { status: 500 },
      );
    }

    const profile = parseProfileRecord(profileData);
    const resumeKey = profile?.resume_pdf_key ?? "";

    if (!resumeKey) {
      return NextResponse.json(
        { success: false, error: NO_RESUME_ERROR },
        { status: 404 },
      );
    }

    if (!isUserResumeKey(resumeKey, user.id)) {
      console.error("[resume/current] resume key outside user prefix");
      return NextResponse.json(
        { success: false, error: "Could not read your resume." },
        { status: 403 },
      );
    }

    const { data: resumeBlob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(resumeKey);

    if (downloadError || !resumeBlob) {
      console.error("[resume/current] download resume", downloadError);
      return NextResponse.json(
        { success: false, error: "Could not read your resume." },
        { status: 500 },
      );
    }

    const resumeBuffer = Buffer.from(await resumeBlob.arrayBuffer());
    return createInlinePdfResponse(resumeBuffer);
  } catch (error) {
    console.error("[resume/current]", error);
    return NextResponse.json(
      { success: false, error: "Could not review your resume. Please try again." },
      { status: 500 },
    );
  }
}
