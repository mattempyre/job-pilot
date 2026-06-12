import type { AuthenticatedUser, E2ESession } from "@/lib/e2e-auth";
import {
  calculateCompletion,
  mapProfileRecordToViewModel,
  type ExtractedProfileData,
  type ProfileMutationValues,
  type ProfileRecord,
  toProfileDatabasePayload,
} from "@/lib/profile";

declare global {
  var jobPilotE2EProfiles: Map<string, ProfileRecord> | undefined;
}

type E2EResumeReference = {
  key: string;
  url: string;
};

function getStore(): Map<string, ProfileRecord> {
  if (!globalThis.jobPilotE2EProfiles) {
    globalThis.jobPilotE2EProfiles = new Map<string, ProfileRecord>();
  }

  return globalThis.jobPilotE2EProfiles;
}

function getProfileKey(session: E2ESession): string {
  return `${session.user.id}:${session.profileScenario}`;
}

function createBaseProfileRecord(user: AuthenticatedUser): ProfileRecord {
  return {
    id: user.id,
    full_name: null,
    email: user.email,
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
    remote_preference: null,
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

function addResume(record: ProfileRecord): ProfileRecord {
  return {
    ...record,
    resume_pdf_url: "/e2e/resume.pdf",
    resume_pdf_key: `resumes/${record.id}/e2e-resume.pdf`,
  };
}

function createFixtureProfile(session: E2ESession): ProfileRecord {
  const base = createBaseProfileRecord(session.user);

  if (session.profileScenario === "blank") {
    return base;
  }

  const readyProfile: ProfileRecord = {
    ...base,
    full_name: "Jordan Ready",
    phone: "555-0120",
    location: "Seattle, WA",
    current_title: "Frontend Engineer",
    experience_level: "mid",
    years_experience: 5,
    skills: ["React", "TypeScript", "Next.js", "Testing"],
    industries: ["SaaS", "Developer Tools"],
    work_experience: [
      {
        id: "e2e-ready-role-1",
        companyName: "Ready Labs",
        jobTitle: "Frontend Engineer",
        startDate: "2020-02",
        endDate: "",
        current: true,
        responsibilities:
          "Built accessible product workflows with React, TypeScript, and Next.js.",
      },
    ],
    education: {
      entries: [
        {
          id: "e2e-ready-education-1",
          highestDegree: "bachelors",
          fieldOfStudy: "Computer Science",
          institutionName: "Pacific State University",
          graduationYear: "2018",
        },
      ],
    },
    job_titles_seeking: ["Frontend Engineer", "Full Stack Engineer"],
    remote_preference: "remote,hybrid",
    preferred_locations: ["Remote", "Seattle, WA"],
    salary_expectation: "$160,000",
    cover_letter_tone: "enthusiastic",
    linkedin_url: "https://www.linkedin.com/in/jordan-ready",
    portfolio_url: "https://jordan-ready.example.test",
    work_authorization: "citizen",
  };
  const readyViewModel = mapProfileRecordToViewModel(
    readyProfile,
    session.user.email,
  );

  if (session.profileScenario === "ready") {
    return {
      ...readyProfile,
      is_complete: calculateCompletion(readyViewModel, false).isComplete,
    };
  }

  if (session.profileScenario === "resume") {
    return addResume(base);
  }

  const populated = addResume({
    ...base,
    full_name: "Jordan Existing",
    phone: "555-0100",
    location: "Denver, CO",
    current_title: "Product Engineer",
    experience_level: "mid",
    years_experience: 4,
    skills: ["React", "Node.js"],
    industries: ["SaaS"],
    work_experience: [
      {
        id: "e2e-existing-role-1",
        companyName: "Existing Co",
        jobTitle: "Product Engineer",
        startDate: "2021-01",
        endDate: "",
        current: true,
        responsibilities: "Built and maintained customer-facing product workflows.",
      },
    ],
    education: {
      entries: [
        {
          id: "e2e-existing-education-1",
          highestDegree: "bachelors",
          fieldOfStudy: "Computer Science",
          institutionName: "State University",
          graduationYear: "2018",
        },
      ],
    },
    job_titles_seeking: ["Full Stack Engineer"],
    remote_preference: "hybrid",
    preferred_locations: ["Denver, CO"],
    salary_expectation: "$150,000",
    cover_letter_tone: "formal",
    linkedin_url: "https://www.linkedin.com/in/jordan-existing",
    portfolio_url: "https://jordan.example.test",
    work_authorization: "citizen",
  });
  const viewModel = mapProfileRecordToViewModel(populated, session.user.email);

  return {
    ...populated,
    is_complete: calculateCompletion(viewModel, true).isComplete,
  };
}

export function getE2EProfileRecord(session: E2ESession): ProfileRecord {
  const store = getStore();
  const profileKey = getProfileKey(session);
  const existing = store.get(profileKey);

  if (existing) {
    return existing;
  }

  const fixture = createFixtureProfile(session);
  store.set(profileKey, fixture);
  return fixture;
}

export function saveE2EProfileValues(
  session: E2ESession,
  values: ProfileMutationValues,
): ProfileRecord {
  const existing = getE2EProfileRecord(session);
  const hasResume = Boolean(existing.resume_pdf_key);
  const payload = toProfileDatabasePayload(session.user.id, values, hasResume);
  const nextRecord: ProfileRecord = {
    ...payload,
    resume_pdf_url: existing.resume_pdf_url,
    resume_pdf_key: existing.resume_pdf_key,
    resume_extracted_pdf_key: existing.resume_extracted_pdf_key,
    resume_extracted_at: existing.resume_extracted_at,
  };

  getStore().set(getProfileKey(session), nextRecord);
  return nextRecord;
}

export function saveE2EResumeReference(
  session: E2ESession,
  resume: E2EResumeReference,
): ProfileRecord {
  const existing = getE2EProfileRecord(session);
  const viewModel = mapProfileRecordToViewModel(existing, session.user.email);
  const completion = calculateCompletion(viewModel, true);
  const nextRecord: ProfileRecord = {
    ...existing,
    resume_pdf_url: resume.url,
    resume_pdf_key: resume.key,
    resume_extracted_pdf_key: null,
    resume_extracted_at: null,
    is_complete: completion.isComplete,
  };

  getStore().set(getProfileKey(session), nextRecord);
  return nextRecord;
}

export function saveE2EGeneratedResumeReference(
  session: E2ESession,
  resume: E2EResumeReference,
): ProfileRecord {
  return saveE2EResumeReference(session, resume);
}

export function hasE2EResumeBeenExtracted(session: E2ESession): boolean {
  const profile = getE2EProfileRecord(session);

  return (
    Boolean(profile.resume_pdf_key) &&
    profile.resume_pdf_key === profile.resume_extracted_pdf_key
  );
}

export function markE2EResumeExtracted(session: E2ESession): ProfileRecord {
  const existing = getE2EProfileRecord(session);
  const nextRecord: ProfileRecord = {
    ...existing,
    resume_extracted_pdf_key: existing.resume_pdf_key,
    resume_extracted_at: new Date().toISOString(),
  };

  getStore().set(getProfileKey(session), nextRecord);
  return nextRecord;
}

export function getE2EExtractedProfileData(): ExtractedProfileData {
  return {
    personalInfo: {
      fullName: "Alex Rivera",
      email: "alex.rivera@example.test",
      phone: "555-0199",
      location: "Austin, TX",
      linkedinUrl: "https://www.linkedin.com/in/alex-rivera",
      portfolioUrl: "https://alexrivera.example.test",
      workAuthorization: "citizen",
    },
    professionalInfo: {
      currentTitle: "Senior Frontend Engineer",
      experienceLevel: "senior",
      yearsExperience: "7",
      skills: ["React", "TypeScript", "Next.js", "Accessibility"],
      industries: ["SaaS", "Developer Tools"],
    },
    workExperience: [
      {
        id: "e2e-extracted-role-1",
        companyName: "Launch Labs",
        jobTitle: "Senior Frontend Engineer",
        startDate: "2020-04",
        endDate: "",
        current: true,
        responsibilities:
          "Led frontend architecture for customer onboarding and analytics workflows.",
      },
    ],
    education: [
      {
        id: "e2e-extracted-education-1",
        highestDegree: "bachelors",
        fieldOfStudy: "Software Engineering",
        institutionName: "Austin Tech University",
        graduationYear: "2017",
      },
    ],
    jobPreferences: {
      jobTitlesSeeking: ["Senior Frontend Engineer", "Staff Frontend Engineer"],
      remotePreferences: ["remote"],
      salaryExpectation: "$170,000",
      preferredLocations: ["Remote", "Austin, TX"],
      coverLetterTone: "enthusiastic",
    },
  };
}
