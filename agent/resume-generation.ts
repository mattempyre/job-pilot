import OpenAI from "openai";
import { z } from "zod";

import type { ProfileViewModel } from "@/lib/profile";

export type GeneratedResumeRole = {
  companyName: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type GeneratedResumeEducation = {
  degree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
};

export type GeneratedResumeContent = {
  headline: string;
  summary: string;
  skills: string[];
  roles: GeneratedResumeRole[];
  education: GeneratedResumeEducation[];
};

type ResumeGenerationResult =
  | {
      data: GeneratedResumeContent;
      success: true;
    }
  | {
      error: string;
      status: number;
      success: false;
    };

const GENERIC_GENERATION_ERROR =
  "Could not generate your resume. Please try again.";
const MAX_HEADLINE_LENGTH = 120;
const MAX_SUMMARY_LENGTH = 700;
const MAX_SHORT_TEXT_LENGTH = 140;
const MAX_BULLET_LENGTH = 220;
const MAX_SKILLS = 18;
const MAX_ROLES = 3;
const MAX_BULLETS_PER_ROLE = 3;
const MAX_EDUCATION_ENTRIES = 4;

const shortTextSchema = z.preprocess(
  (value) => normalizeText(value, MAX_SHORT_TEXT_LENGTH),
  z.string(),
);

const generatedRoleSchema = z.object({
  companyName: shortTextSchema,
  jobTitle: shortTextSchema,
  location: shortTextSchema,
  startDate: shortTextSchema,
  endDate: shortTextSchema,
  bullets: z.preprocess(
    (value) => normalizeTextArray(value, MAX_BULLET_LENGTH, MAX_BULLETS_PER_ROLE),
    z.array(z.string()),
  ),
});

const generatedEducationSchema = z.object({
  degree: shortTextSchema,
  fieldOfStudy: shortTextSchema,
  institutionName: shortTextSchema,
  graduationYear: shortTextSchema,
});

const generatedResumeContentSchema = z.object({
  headline: z.preprocess(
    (value) => normalizeText(value, MAX_HEADLINE_LENGTH),
    z.string(),
  ),
  summary: z.preprocess(
    (value) => normalizeText(value, MAX_SUMMARY_LENGTH),
    z.string(),
  ),
  skills: z.preprocess(
    (value) => normalizeTextArray(value, MAX_SHORT_TEXT_LENGTH, MAX_SKILLS),
    z.array(z.string()),
  ),
  roles: z.preprocess(
    (value) => normalizeObjectArray(value, MAX_ROLES),
    z.array(generatedRoleSchema),
  ),
  education: z.preprocess(
    (value) => normalizeObjectArray(value, MAX_EDUCATION_ENTRIES),
    z.array(generatedEducationSchema),
  ),
});

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value).slice(0, maxLength);
  }

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeTextArray(
  value: unknown,
  maxLength: number,
  maxItems: number,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => normalizeText(item, maxLength))
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
}

function normalizeObjectArray(value: unknown, maxItems: number): unknown[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, maxItems);
}

function parseJsonContent(content: string): unknown | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function degreeLabel(value: string): string {
  const labels: Record<string, string> = {
    bachelors: "Bachelor's Degree",
    bootcamp: "Bootcamp",
    masters: "Master's Degree",
    phd: "PhD",
    self_taught: "Self-taught",
  };

  return labels[value] ?? value;
}

function createFallbackSummary(profile: ProfileViewModel): string {
  const title = profile.professionalInfo.currentTitle;
  const years = profile.professionalInfo.yearsExperience;
  const skills = profile.professionalInfo.skills.slice(0, 4).join(", ");
  const industries = profile.professionalInfo.industries.slice(0, 2).join(" and ");
  const experienceText = years ? ` with ${years} years of experience` : "";
  const industryText = industries ? ` across ${industries}` : "";
  const skillsText = skills ? ` Skilled in ${skills}.` : "";

  return normalizeText(
    `${title}${experienceText}${industryText}.${skillsText}`,
    MAX_SUMMARY_LENGTH,
  );
}

function createFallbackBullets(responsibilities: string): string[] {
  const normalized = normalizeText(responsibilities, MAX_SUMMARY_LENGTH);
  if (!normalized) {
    return [];
  }

  const sentenceMatches = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];

  return normalizeTextArray(
    sentenceMatches.map((sentence) => sentence.replace(/^[-•]\s*/, "")),
    MAX_BULLET_LENGTH,
    MAX_BULLETS_PER_ROLE,
  );
}

function compactProfileForPrompt(profile: ProfileViewModel): string {
  const roles = profile.workExperience
    .filter((role) => role.companyName || role.jobTitle || role.responsibilities)
    .slice(0, MAX_ROLES)
    .map((role) => ({
      companyName: role.companyName,
      current: role.current,
      endDate: role.endDate,
      jobTitle: role.jobTitle,
      responsibilities: role.responsibilities,
      startDate: role.startDate,
    }));
  const education = profile.education
    .filter(
      (entry) =>
        entry.highestDegree ||
        entry.fieldOfStudy ||
        entry.institutionName ||
        entry.graduationYear,
    )
    .slice(0, MAX_EDUCATION_ENTRIES)
    .map((entry) => ({
      degree: degreeLabel(entry.highestDegree),
      fieldOfStudy: entry.fieldOfStudy,
      graduationYear: entry.graduationYear,
      institutionName: entry.institutionName,
    }));

  return JSON.stringify({
    currentTitle: profile.professionalInfo.currentTitle,
    education,
    email: profile.personalInfo.email,
    experienceLevel: profile.professionalInfo.experienceLevel,
    fullName: profile.personalInfo.fullName,
    industries: profile.professionalInfo.industries,
    jobTitlesSeeking: profile.jobPreferences.jobTitlesSeeking,
    linkedinUrl: profile.personalInfo.linkedinUrl,
    location: profile.personalInfo.location,
    phone: profile.personalInfo.phone,
    portfolioUrl: profile.personalInfo.portfolioUrl,
    preferredLocations: profile.jobPreferences.preferredLocations,
    roles,
    skills: profile.professionalInfo.skills,
    yearsExperience: profile.professionalInfo.yearsExperience,
  });
}

function createSystemPrompt(): string {
  return `You generate polished developer resumes for JobPilot.

Return ONLY valid JSON. Do not include markdown, comments, null values, or invented facts.
Use only the provided profile data. Do not invent employers, degrees, metrics, technologies, credentials, links, or dates.
Write confident, concrete resume language grounded in the user's actual profile.
Prefer impact-focused bullets, but do not invent numeric impact.
Keep output concise enough for a controlled one to two page PDF.

Limits:
- headline: one short resume title, at most 120 characters
- summary: one paragraph, at most 700 characters
- skills: at most 18
- roles: at most 3, newest first
- bullets: at most 3 per role, each at most 220 characters
- education: at most 4 complete-looking entries

Return this exact JSON shape:
{
  "headline": "",
  "summary": "",
  "skills": [],
  "roles": [
    {
      "companyName": "",
      "jobTitle": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "bullets": []
    }
  ],
  "education": [
    {
      "degree": "",
      "fieldOfStudy": "",
      "institutionName": "",
      "graduationYear": ""
    }
  ]
}`;
}

function createUserPrompt(profile: ProfileViewModel): string {
  return `Generate resume content from this saved JobPilot profile:

${compactProfileForPrompt(profile)}`;
}

export function parseGeneratedResumeContent(
  value: unknown,
): GeneratedResumeContent | null {
  const result = generatedResumeContentSchema.safeParse(value);
  if (!result.success) {
    return null;
  }

  return result.data;
}

export function createFallbackResumeContentFromProfile(
  profile: ProfileViewModel,
): GeneratedResumeContent {
  return {
    education: profile.education
      .filter(
        (entry) =>
          entry.highestDegree ||
          entry.fieldOfStudy ||
          entry.institutionName ||
          entry.graduationYear,
      )
      .slice(0, MAX_EDUCATION_ENTRIES)
      .map((entry) => ({
        degree: degreeLabel(entry.highestDegree),
        fieldOfStudy: normalizeText(entry.fieldOfStudy, MAX_SHORT_TEXT_LENGTH),
        graduationYear: normalizeText(
          entry.graduationYear,
          MAX_SHORT_TEXT_LENGTH,
        ),
        institutionName: normalizeText(
          entry.institutionName,
          MAX_SHORT_TEXT_LENGTH,
        ),
      })),
    headline: normalizeText(
      profile.professionalInfo.currentTitle,
      MAX_HEADLINE_LENGTH,
    ),
    roles: profile.workExperience
      .filter((role) => role.companyName || role.jobTitle || role.responsibilities)
      .slice(0, MAX_ROLES)
      .map((role) => ({
        bullets: createFallbackBullets(role.responsibilities),
        companyName: normalizeText(role.companyName, MAX_SHORT_TEXT_LENGTH),
        endDate: normalizeText(role.current ? "" : role.endDate, MAX_SHORT_TEXT_LENGTH),
        jobTitle: normalizeText(role.jobTitle, MAX_SHORT_TEXT_LENGTH),
        location: normalizeText(profile.personalInfo.location, MAX_SHORT_TEXT_LENGTH),
        startDate: normalizeText(role.startDate, MAX_SHORT_TEXT_LENGTH),
      })),
    skills: normalizeTextArray(
      profile.professionalInfo.skills,
      MAX_SHORT_TEXT_LENGTH,
      MAX_SKILLS,
    ),
    summary: createFallbackSummary(profile),
  };
}

export async function generateResumeContentFromProfile(
  profile: ProfileViewModel,
): Promise<ResumeGenerationResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("[agent/resume-generation] missing OPENAI_API_KEY");
      return {
        error: "Resume generation is not configured.",
        status: 500,
        success: false,
      };
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      max_tokens: 1000,
      messages: [
        { content: createSystemPrompt(), role: "system" },
        { content: createUserPrompt(profile), role: "user" },
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const choice = response.choices[0];
    const content = choice?.message.content;
    if (!content) {
      console.error("[agent/resume-generation] empty OpenAI response", {
        finishReason: choice?.finish_reason,
      });
      return {
        error: GENERIC_GENERATION_ERROR,
        status: 500,
        success: false,
      };
    }

    const parsedContent = parseJsonContent(content);
    if (!parsedContent) {
      console.error("[agent/resume-generation] invalid OpenAI JSON", {
        contentLength: content.length,
        finishReason: choice.finish_reason,
      });
      return {
        error: GENERIC_GENERATION_ERROR,
        status: 500,
        success: false,
      };
    }

    const generatedResume = parseGeneratedResumeContent(parsedContent);
    if (!generatedResume) {
      console.error("[agent/resume-generation] invalid generated resume", {
        contentLength: content.length,
        finishReason: choice.finish_reason,
      });
      return {
        error: GENERIC_GENERATION_ERROR,
        status: 500,
        success: false,
      };
    }

    return {
      data: generatedResume,
      success: true,
    };
  } catch (error) {
    console.error("[agent/resume-generation]", error);
    return {
      error: GENERIC_GENERATION_ERROR,
      status: 500,
      success: false,
    };
  }
}
