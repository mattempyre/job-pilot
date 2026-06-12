import { expect, test } from "playwright/test";

import { parseExtractedProfileData } from "../lib/profile";

test("normalizes oversized extracted profile responses instead of rejecting them", () => {
  const parsed = parseExtractedProfileData({
    personalInfo: {
      fullName: "A".repeat(180),
      email: "alex@example.com",
      phone: "555-0100",
      location: "Stockholm",
      linkedinUrl: "",
      portfolioUrl: "",
      workAuthorization: "citizen",
    },
    professionalInfo: {
      currentTitle: "Senior Frontend Engineer",
      experienceLevel: "senior",
      yearsExperience: 8,
      skills: Array.from({ length: 60 }, (_, index) => `Skill ${index + 1}`),
      industries: ["SaaS", "Fintech"],
    },
    workExperience: Array.from({ length: 5 }, (_, index) => ({
      companyName: `${"Company ".repeat(24)}${index + 1}`,
      jobTitle: "Frontend Engineer",
      startDate: "2020-01",
      endDate: "",
      current: index === 0,
      responsibilities: "Built product workflows. ".repeat(160),
    })),
    education: {
      highestDegree: "masters",
      fieldOfStudy: "Computer Science",
      institutionName: "Example University",
      graduationYear: 2020,
    },
    jobPreferences: {
      jobTitlesSeeking: ["Frontend Engineer", "Senior Frontend Engineer"],
      remotePreferences: ["remote", "hybrid"],
      salaryExpectation: 150000,
      preferredLocations: ["Remote"],
      coverLetterTone: "formal",
    },
  });

  expect(parsed).not.toBeNull();
  expect(parsed?.personalInfo.fullName).toHaveLength(120);
  expect(parsed?.professionalInfo.yearsExperience).toBe("8");
  expect(parsed?.professionalInfo.skills).toHaveLength(50);
  expect(parsed?.workExperience).toHaveLength(3);
  expect(parsed?.workExperience[0]?.companyName).toHaveLength(120);
  expect(parsed?.workExperience[0]?.responsibilities).toHaveLength(2000);
  expect(parsed?.education).toHaveLength(1);
  expect(parsed?.education[0]?.graduationYear).toBe("2020");
  expect(parsed?.jobPreferences.remotePreferences).toEqual(["remote", "hybrid"]);
  expect(parsed?.jobPreferences.salaryExpectation).toBe("150000");
});

test("accepts legacy singular extracted remote preference", () => {
  const parsed = parseExtractedProfileData({
    jobPreferences: {
      remotePreference: "hybrid",
    },
  });

  expect(parsed?.jobPreferences.remotePreferences).toEqual(["hybrid"]);
});

test("seeds job titles seeking from current and recent role titles", () => {
  const parsed = parseExtractedProfileData({
    professionalInfo: {
      currentTitle: "Senior Frontend Engineer",
    },
    workExperience: [
      {
        companyName: "Launch Labs",
        jobTitle: "Senior Frontend Engineer",
        startDate: "2022-01",
        endDate: "",
        current: true,
        responsibilities: "Led frontend architecture.",
      },
      {
        companyName: "Product Studio",
        jobTitle: "Frontend Engineer",
        startDate: "2019-01",
        endDate: "2021-12",
        current: false,
        responsibilities: "Built product UI.",
      },
      {
        companyName: "Design Systems Co",
        jobTitle: "UI Engineer",
        startDate: "2017-01",
        endDate: "2018-12",
        current: false,
        responsibilities: "Built component systems.",
      },
    ],
    jobPreferences: {
      jobTitlesSeeking: [],
    },
  });

  expect(parsed?.jobPreferences.jobTitlesSeeking).toEqual([
    "Senior Frontend Engineer",
    "Frontend Engineer",
    "UI Engineer",
  ]);
});
