import { expect, test } from "playwright/test";

import {
  mapProfileRecordToViewModel,
  parseProfileFormData,
  toProfileDatabasePayload,
  type ProfileRecord,
} from "../lib/profile";

function createProfileRecord(remotePreference: string | null): ProfileRecord {
  return {
    id: "user-1",
    full_name: null,
    email: "user@example.test",
    phone: null,
    location: null,
    current_title: null,
    experience_level: null,
    years_experience: null,
    skills: [],
    industries: [],
    work_experience: [],
    education: { entries: [] },
    job_titles_seeking: [],
    remote_preference: remotePreference,
    preferred_locations: [],
    salary_expectation: null,
    cover_letter_tone: null,
    linkedin_url: null,
    portfolio_url: null,
    work_authorization: null,
    resume_pdf_url: null,
    resume_pdf_key: null,
    resume_extracted_pdf_key: null,
    resume_extracted_at: null,
    is_complete: false,
  };
}

function appendValidProfileFields(formData: FormData): void {
  formData.set("fullName", "Alex Rivera");
  formData.set("email", "alex@example.test");
  formData.set("phone", "555-0100");
  formData.set("location", "Austin, TX");
  formData.set("currentTitle", "Frontend Engineer");
  formData.set("experienceLevel", "senior");
  formData.set("yearsExperience", "7");
  formData.set("skills", JSON.stringify(["React"]));
  formData.set("industries", JSON.stringify([]));
  formData.set(
    "workExperience",
    JSON.stringify([
      {
        id: "role-1",
        companyName: "Launch Labs",
        jobTitle: "Frontend Engineer",
        startDate: "2020-01",
        endDate: "",
        current: true,
        responsibilities: "Built customer-facing product workflows.",
      },
    ]),
  );
  formData.set(
    "education",
    JSON.stringify([
      {
        id: "education-1",
        highestDegree: "bachelors",
        fieldOfStudy: "Computer Science",
        institutionName: "State University",
        graduationYear: "2018",
      },
    ]),
  );
  formData.set("jobTitlesSeeking", JSON.stringify(["Frontend Engineer"]));
  formData.set("preferredLocations", JSON.stringify(["Remote"]));
  formData.set("salaryExpectation", "");
  formData.set("coverLetterTone", "formal");
  formData.set("linkedinUrl", "");
  formData.set("portfolioUrl", "");
  formData.set("workAuthorization", "citizen");
}

test("maps legacy and multi remote preference storage into the profile view model", () => {
  expect(
    mapProfileRecordToViewModel(createProfileRecord("hybrid"), "user@example.test")
      .jobPreferences.remotePreferences,
  ).toEqual(["hybrid"]);

  expect(
    mapProfileRecordToViewModel(
      createProfileRecord("remote,hybrid"),
      "user@example.test",
    ).jobPreferences.remotePreferences,
  ).toEqual(["remote", "hybrid"]);
});

test("marks resume extraction used only when the active resume key matches", () => {
  const extractedRecord: ProfileRecord = {
    ...createProfileRecord(null),
    resume_pdf_key: "resumes/user-1/resume-1.pdf",
    resume_extracted_pdf_key: "resumes/user-1/resume-1.pdf",
  };
  const replacedRecord: ProfileRecord = {
    ...extractedRecord,
    resume_pdf_key: "resumes/user-1/resume-2.pdf",
  };

  expect(
    mapProfileRecordToViewModel(extractedRecord, "user@example.test").resume
      .hasExtractedProfile,
  ).toBe(true);
  expect(
    mapProfileRecordToViewModel(replacedRecord, "user@example.test").resume
      .hasExtractedProfile,
  ).toBe(false);
});

test("saves multiple remote preferences into the existing database column", () => {
  const formData = new FormData();
  appendValidProfileFields(formData);
  formData.set("remotePreferences", JSON.stringify(["remote", "hybrid"]));

  const values = parseProfileFormData(formData);
  const payload = toProfileDatabasePayload("user-1", values, true);

  expect(values.remotePreferences).toEqual(["remote", "hybrid"]);
  expect(payload.remote_preference).toBe("remote,hybrid");
});

test("keeps Any exclusive when saving remote preferences", () => {
  const formData = new FormData();
  appendValidProfileFields(formData);
  formData.set("remotePreferences", JSON.stringify(["remote", "any", "hybrid"]));

  const values = parseProfileFormData(formData);
  const payload = toProfileDatabasePayload("user-1", values, true);

  expect(values.remotePreferences).toEqual(["any"]);
  expect(payload.remote_preference).toBe("any");
});
