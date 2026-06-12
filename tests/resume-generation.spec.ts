import { expect, test } from "playwright/test";

import {
  createFallbackResumeContentFromProfile,
  generateResumeContentFromProfile,
  parseGeneratedResumeContent,
} from "../agent/resume-generation";
import type { ProfileViewModel } from "../lib/profile";
import { renderResumePdfBuffer } from "../lib/resume-renderer";

function createProfile(): ProfileViewModel {
  return {
    education: [
      {
        fieldOfStudy: "Computer Science",
        graduationYear: "2018",
        highestDegree: "bachelors",
        id: "education-1",
        institutionName: "State University",
      },
    ],
    jobPreferences: {
      coverLetterTone: "enthusiastic",
      jobTitlesSeeking: ["Senior Frontend Engineer"],
      preferredLocations: ["Remote"],
      remotePreferences: ["remote"],
      salaryExpectation: "$170,000",
    },
    personalInfo: {
      email: "alex@example.test",
      fullName: "Alex Rivera",
      linkedinUrl: "https://www.linkedin.com/in/alex-rivera",
      location: "Austin, TX",
      phone: "555-0199",
      portfolioUrl: "https://alex.example.test",
      workAuthorization: "citizen",
    },
    professionalInfo: {
      currentTitle: "Senior Frontend Engineer",
      experienceLevel: "senior",
      industries: ["SaaS"],
      skills: ["React", "TypeScript", "Next.js", "Accessibility"],
      yearsExperience: "7",
    },
    resume: {
      fileDetails: "",
      fileName: "",
      hasExtractedProfile: false,
      key: "",
      url: "",
    },
    workExperience: [
      {
        companyName: "Launch Labs",
        current: true,
        endDate: "",
        id: "role-1",
        jobTitle: "Senior Frontend Engineer",
        responsibilities:
          "Led frontend architecture for onboarding and analytics workflows.",
        startDate: "2020-04",
      },
    ],
  };
}

test("parses and caps generated resume content", () => {
  const parsed = parseGeneratedResumeContent({
    education: [
      {
        degree: "Bachelor's Degree",
        fieldOfStudy: "Computer Science",
        graduationYear: "2018",
        institutionName: "State University",
      },
    ],
    headline: "Senior Frontend Engineer",
    roles: [
      {
        bullets: [
          "Built onboarding workflows.",
          "Improved accessibility coverage.",
          "Mentored frontend engineers.",
          "This fourth bullet should be removed.",
        ],
        companyName: "Launch Labs",
        endDate: "",
        jobTitle: "Senior Frontend Engineer",
        location: "Austin, TX",
        startDate: "2020-04",
      },
    ],
    skills: Array.from({ length: 30 }, (_, index) => `Skill ${index}`),
    summary: "Builds accessible product workflows with React and TypeScript.",
  });

  expect(parsed).not.toBeNull();
  expect(parsed?.skills).toHaveLength(18);
  expect(parsed?.roles[0]?.bullets).toHaveLength(3);
});

test("rejects invalid generated resume content", () => {
  expect(parseGeneratedResumeContent("not-json")).toBeNull();
});

test("reports missing OpenAI configuration without calling the API", async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const result = await generateResumeContentFromProfile(createProfile());

    expect(result).toEqual({
      error: "Resume generation is not configured.",
      status: 500,
      success: false,
    });
  } finally {
    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  }
});

test("creates deterministic fallback resume content from saved profile data", () => {
  const fallback = createFallbackResumeContentFromProfile(createProfile());

  expect(fallback.headline).toBe("Senior Frontend Engineer");
  expect(fallback.summary).toContain("7 years of experience");
  expect(fallback.skills).toEqual([
    "React",
    "TypeScript",
    "Next.js",
    "Accessibility",
  ]);
  expect(fallback.roles[0]).toMatchObject({
    companyName: "Launch Labs",
    jobTitle: "Senior Frontend Engineer",
    startDate: "2020-04",
  });
  expect(fallback.roles[0]?.bullets[0]).toContain(
    "Led frontend architecture",
  );
  expect(fallback.education[0]).toMatchObject({
    degree: "Bachelor's Degree",
    fieldOfStudy: "Computer Science",
  });
});

test("renders generated resume content to a PDF buffer", async () => {
  const generatedResume = parseGeneratedResumeContent({
    education: [
      {
        degree: "Bachelor's Degree",
        fieldOfStudy: "Computer Science",
        graduationYear: "2018",
        institutionName: "State University",
      },
    ],
    headline: "Senior Frontend Engineer",
    roles: [
      {
        bullets: ["Built accessible product workflows with React."],
        companyName: "Launch Labs",
        endDate: "",
        jobTitle: "Senior Frontend Engineer",
        location: "Austin, TX",
        startDate: "2020-04",
      },
    ],
    skills: ["React", "TypeScript", "Next.js"],
    summary: "Builds accessible product workflows with React and TypeScript.",
  });

  if (!generatedResume) {
    throw new Error("Expected generated resume fixture to parse.");
  }

  const buffer = await renderResumePdfBuffer({
    generatedResume,
    profile: createProfile(),
  });

  expect(buffer.length).toBeGreaterThan(1000);
  expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
});
