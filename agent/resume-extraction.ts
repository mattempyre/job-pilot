import OpenAI from "openai";

import {
  parseExtractedProfileData,
  type ExtractedProfileData,
} from "@/lib/profile";

type ResumeProfileExtractionResult =
  | {
      data: ExtractedProfileData;
      success: true;
    }
  | {
      error: string;
      status: number;
      success: false;
    };

const GENERIC_EXTRACTION_ERROR =
  "Could not extract profile details. Please try again.";

function parseJsonContent(content: string): unknown | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function createSystemPrompt(): string {
  return `You extract structured profile data from developer resumes for JobPilot.

Return ONLY valid JSON. Do not include markdown, explanations, confidence scores, or null values.
Use empty strings or empty arrays when a field is not present.
Keep text concise and directly supported by the resume.
Role dates must use YYYY-MM. If only a year is available for a role date, use an empty string. Graduation year should use YYYY.
Return at most 3 workExperience entries, ordered newest first.
Keep responsibilities under 450 characters per role.
Return at most 50 items for any list field.
Populate jobTitlesSeeking with target roles stated in the resume. If none are stated, seed it from currentTitle and the newest few workExperience jobTitle values.
Use remotePreferences as an array. If the resume indicates both remote and hybrid, return ["remote", "hybrid"]. If any location style is acceptable, return ["any"] by itself.

Allowed enum values:
- experienceLevel: "", "junior", "mid", "senior", "lead"
- workAuthorization: "", "citizen", "permanent_resident", "visa_required"
- highestDegree: "", "bachelors", "masters", "phd", "bootcamp", "self_taught"
- remotePreferences items: "remote", "onsite", "hybrid", "any"
- coverLetterTone: "", "formal", "casual", "enthusiastic"

Return this exact object shape:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedinUrl": "",
    "portfolioUrl": "",
    "workAuthorization": ""
  },
  "professionalInfo": {
    "currentTitle": "",
    "experienceLevel": "",
    "yearsExperience": "",
    "skills": [],
    "industries": []
  },
  "workExperience": [
    {
      "companyName": "",
      "jobTitle": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "responsibilities": ""
    }
  ],
  "education": [
    {
      "highestDegree": "",
      "fieldOfStudy": "",
      "institutionName": "",
      "graduationYear": ""
    }
  ],
  "jobPreferences": {
    "jobTitlesSeeking": [],
    "remotePreferences": [],
    "salaryExpectation": "",
    "preferredLocations": [],
    "coverLetterTone": ""
  }
}`;
}

function createUserPrompt(resumeText: string): string {
  return `Extract JobPilot profile fields from this resume text:

${resumeText}`;
}

export async function extractProfileDataFromResumeText(
  resumeText: string,
): Promise<ResumeProfileExtractionResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("[agent/resume-extraction] missing OPENAI_API_KEY");
      return {
        error: "Resume extraction is not configured.",
        status: 500,
        success: false,
      };
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      max_tokens: 1600,
      messages: [
        { content: createSystemPrompt(), role: "system" },
        { content: createUserPrompt(resumeText), role: "user" },
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const choice = response.choices[0];
    const content = choice?.message.content;
    if (!content) {
      console.error("[agent/resume-extraction] empty OpenAI response", {
        finishReason: choice?.finish_reason,
      });
      return {
        error: GENERIC_EXTRACTION_ERROR,
        status: 500,
        success: false,
      };
    }

    const parsedContent = parseJsonContent(content);
    if (!parsedContent) {
      console.error("[agent/resume-extraction] invalid OpenAI JSON", {
        contentLength: content.length,
        finishReason: choice.finish_reason,
      });
      return {
        error: GENERIC_EXTRACTION_ERROR,
        status: 500,
        success: false,
      };
    }

    const extractedProfile = parseExtractedProfileData(parsedContent);
    if (!extractedProfile) {
      console.error("[agent/resume-extraction] invalid extracted profile", {
        contentLength: content.length,
        finishReason: choice.finish_reason,
      });
      return {
        error: GENERIC_EXTRACTION_ERROR,
        status: 500,
        success: false,
      };
    }

    return {
      data: extractedProfile,
      success: true,
    };
  } catch (error) {
    console.error("[agent/resume-extraction]", error);
    return {
      error: GENERIC_EXTRACTION_ERROR,
      status: 500,
      success: false,
    };
  }
}
