import { z } from "zod";

export type WorkRole = {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
};

export type EducationEntry = {
  id: string;
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
};

export type EducationData = {
  entries: EducationEntry[];
};

export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
};

export type ProfessionalInfo = {
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
};

export type JobPreferences = {
  jobTitlesSeeking: string[];
  remotePreferences: string[];
  salaryExpectation: string;
  preferredLocations: string[];
  coverLetterTone: string;
};

export type ResumeInfo = {
  fileName: string;
  fileDetails: string;
  hasExtractedProfile: boolean;
  url: string;
  key: string;
};

export type ProfileViewModel = {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  workExperience: WorkRole[];
  education: EducationEntry[];
  jobPreferences: JobPreferences;
  resume: ResumeInfo;
};

export type ExtractedProfileData = Omit<ProfileViewModel, "resume">;

export type CompletionFieldKey =
  | "fullName"
  | "email"
  | "phone"
  | "location"
  | "currentTitle"
  | "experience"
  | "skills"
  | "workExperience"
  | "education"
  | "jobTitlesSeeking"
  | "remotePreference"
  | "workAuthorization"
  | "resume";

export type CompletionItem = {
  key: CompletionFieldKey;
  label: string;
};

export type CompletionSummary = {
  completion: number;
  missingFields: string[];
  missingItems: CompletionItem[];
  completedFields: string[];
  isComplete: boolean;
};

export type ProfileRecord = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkRole[];
  education: EducationData;
  job_titles_seeking: string[];
  remote_preference: string | null;
  preferred_locations: string[];
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url: string | null;
  resume_pdf_key: string | null;
  resume_extracted_pdf_key: string | null;
  resume_extracted_at: string | null;
  is_complete: boolean;
};

export type ProfileMutationValues = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: number | null;
  skills: string[];
  industries: string[];
  workExperience: WorkRole[];
  education: EducationEntry[];
  jobTitlesSeeking: string[];
  remotePreferences: string[];
  preferredLocations: string[];
  salaryExpectation: string;
  coverLetterTone: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
};

export type ProfileDatabasePayload = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkRole[];
  education: EducationData;
  job_titles_seeking: string[];
  remote_preference: string | null;
  preferred_locations: string[];
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  is_complete: boolean;
};

const MAX_SHORT_TEXT_LENGTH = 120;
const MAX_MEDIUM_TEXT_LENGTH = 240;
const MAX_LONG_TEXT_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 254;
const MAX_PROFILE_LIST_ITEMS = 50;
const MAX_WORK_ROLES = 3;
const MAX_EDUCATION_ENTRIES = 50;
const MAX_SEEDED_JOB_TITLE_ROLES = 3;
const REMOTE_PREFERENCE_DELIMITER = ",";

const shortTextSchema = z.string().trim().max(MAX_SHORT_TEXT_LENGTH);
const mediumTextSchema = z.string().trim().max(MAX_MEDIUM_TEXT_LENGTH);
const longTextSchema = z.string().trim().max(MAX_LONG_TEXT_LENGTH);

const workRoleSchema = z.object({
  id: shortTextSchema.min(1),
  companyName: shortTextSchema,
  jobTitle: shortTextSchema,
  startDate: shortTextSchema,
  endDate: shortTextSchema,
  current: z.boolean(),
  responsibilities: longTextSchema,
});

const educationEntrySchema = z.object({
  id: shortTextSchema.min(1),
  highestDegree: shortTextSchema,
  fieldOfStudy: shortTextSchema,
  institutionName: shortTextSchema,
  graduationYear: shortTextSchema,
});

const stringArraySchema = z
  .array(mediumTextSchema)
  .max(MAX_PROFILE_LIST_ITEMS)
  .transform((values) => normalizeStringArray(values));

const profileRowSchema = z.object({
  id: z.string(),
  full_name: z.string().nullable().default(null),
  email: z.string().default(""),
  phone: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  current_title: z.string().nullable().default(null),
  experience_level: z.string().nullable().default(null),
  years_experience: z.number().nullable().default(null),
  skills: stringArraySchema.default([]),
  industries: stringArraySchema.default([]),
  work_experience: z.array(workRoleSchema).default([]),
  education: z
    .unknown()
    .transform((value) => ({ entries: normalizeEducationEntries(value) })),
  job_titles_seeking: stringArraySchema.default([]),
  remote_preference: z.string().nullable().default(null),
  preferred_locations: stringArraySchema.default([]),
  salary_expectation: z.string().nullable().default(null),
  cover_letter_tone: z.string().nullable().default(null),
  linkedin_url: z.string().nullable().default(null),
  portfolio_url: z.string().nullable().default(null),
  work_authorization: z.string().nullable().default(null),
  resume_pdf_url: z.string().nullable().default(null),
  resume_pdf_key: z.string().nullable().default(null),
  resume_extracted_pdf_key: z.string().nullable().default(null),
  resume_extracted_at: z.string().nullable().default(null),
  is_complete: z.boolean().default(false),
});

const profileFormSchema = z.object({
  fullName: shortTextSchema,
  email: z.string().trim().email().max(MAX_EMAIL_LENGTH),
  phone: shortTextSchema,
  location: mediumTextSchema,
  currentTitle: shortTextSchema,
  experienceLevel: z.enum(["", "junior", "mid", "senior", "lead"]),
  yearsExperience: z
    .string()
    .trim()
    .max(3)
    .transform((value) => {
      if (!value) {
        return null;
      }

      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
    }),
  skills: stringArraySchema,
  industries: stringArraySchema,
  workExperience: z
    .array(workRoleSchema)
    .max(MAX_WORK_ROLES)
    .transform((roles) => roles.slice(0, MAX_WORK_ROLES)),
  education: z.array(educationEntrySchema).max(MAX_EDUCATION_ENTRIES),
  jobTitlesSeeking: stringArraySchema,
  remotePreferences: z
    .array(z.enum(["remote", "onsite", "hybrid", "any"]))
    .max(4)
    .transform((values) => normalizeRemotePreferences(values)),
  preferredLocations: stringArraySchema,
  salaryExpectation: shortTextSchema,
  coverLetterTone: z.enum(["", "formal", "casual", "enthusiastic"]),
  linkedinUrl: mediumTextSchema,
  portfolioUrl: mediumTextSchema,
  workAuthorization: z.enum(["", "citizen", "permanent_resident", "visa_required"]),
});

const extractedShortTextSchema = z.preprocess(
  (value) => normalizeExtractedText(value, MAX_SHORT_TEXT_LENGTH),
  z.string(),
);

const extractedMediumTextSchema = z.preprocess(
  (value) => normalizeExtractedText(value, MAX_MEDIUM_TEXT_LENGTH),
  z.string(),
);

const extractedLongTextSchema = z.preprocess(
  (value) => normalizeExtractedText(value, MAX_LONG_TEXT_LENGTH),
  z.string(),
);

const extractedBooleanSchema = z.preprocess(
  (value) => value === true,
  z.boolean(),
);

const extractedStringArraySchema = z.preprocess(
  (value) => normalizeExtractedStringArray(value),
  z.array(mediumTextSchema),
);

const extractedExperienceLevelSchema = z.preprocess(
  (value) => (isExperienceLevelValue(value) ? value : ""),
  z.enum(["", "junior", "mid", "senior", "lead"]),
);

const extractedRemotePreferencesSchema = z.preprocess(
  (value) => normalizeExtractedRemotePreferences(value),
  z.array(z.enum(["remote", "onsite", "hybrid", "any"])),
);

const extractedCoverLetterToneSchema = z.preprocess(
  (value) => (isCoverLetterToneValue(value) ? value : ""),
  z.enum(["", "formal", "casual", "enthusiastic"]),
);

const extractedWorkAuthorizationSchema = z.preprocess(
  (value) => (isWorkAuthorizationValue(value) ? value : ""),
  z.enum(["", "citizen", "permanent_resident", "visa_required"]),
);

const extractedEducationDegreeSchema = z.preprocess(
  (value) => (isEducationDegreeValue(value) ? value : ""),
  z.enum(["", "bachelors", "masters", "phd", "bootcamp", "self_taught"]),
);

const extractedPersonalInfoSchema = z.preprocess(
  (value) => (isRecord(value) ? value : {}),
  z.object({
    fullName: extractedShortTextSchema,
    email: extractedMediumTextSchema,
    phone: extractedShortTextSchema,
    location: extractedMediumTextSchema,
    linkedinUrl: extractedMediumTextSchema,
    portfolioUrl: extractedMediumTextSchema,
    workAuthorization: extractedWorkAuthorizationSchema,
  }),
);

const extractedProfessionalInfoSchema = z.preprocess(
  (value) => (isRecord(value) ? value : {}),
  z.object({
    currentTitle: extractedShortTextSchema,
    experienceLevel: extractedExperienceLevelSchema,
    yearsExperience: extractedShortTextSchema,
    skills: extractedStringArraySchema,
    industries: extractedStringArraySchema,
  }),
);

const extractedWorkRoleSchema = z.preprocess(
  (value) => (isRecord(value) ? value : {}),
  z.object({
    companyName: extractedShortTextSchema,
    jobTitle: extractedShortTextSchema,
    startDate: extractedShortTextSchema,
    endDate: extractedShortTextSchema,
    current: extractedBooleanSchema,
    responsibilities: extractedLongTextSchema,
  }),
);

const extractedEducationEntrySchema = z.preprocess(
  (value) => (isRecord(value) ? value : {}),
  z.object({
    highestDegree: extractedEducationDegreeSchema,
    fieldOfStudy: extractedShortTextSchema,
    institutionName: extractedShortTextSchema,
    graduationYear: extractedShortTextSchema,
  }),
);

const extractedJobPreferencesSchema = z.preprocess(
  (value) => {
    const record = isRecord(value) ? value : {};
    return {
      ...record,
      remotePreferences:
        record.remotePreferences ?? record.remotePreference ?? [],
    };
  },
  z.object({
    jobTitlesSeeking: extractedStringArraySchema,
    remotePreferences: extractedRemotePreferencesSchema,
    salaryExpectation: extractedShortTextSchema,
    preferredLocations: extractedStringArraySchema,
    coverLetterTone: extractedCoverLetterToneSchema,
  }),
);

const extractedProfileSchema = z.object({
  personalInfo: extractedPersonalInfoSchema,
  professionalInfo: extractedProfessionalInfoSchema,
  workExperience: z
    .preprocess(
      (value) =>
        normalizeExtractedObjectArray(value).slice(0, MAX_WORK_ROLES),
      z.array(extractedWorkRoleSchema),
    )
    .transform((roles) =>
      roles.map((role, index) => ({
        ...role,
        id: `extracted-role-${index + 1}`,
      })),
    ),
  education: z
    .preprocess(
      (value) =>
        normalizeExtractedObjectArray(value).slice(0, MAX_EDUCATION_ENTRIES),
      z.array(extractedEducationEntrySchema),
    )
    .transform((entries) =>
      entries.map((entry, index) => ({
        ...entry,
        id: `extracted-education-${index + 1}`,
      })),
    ),
  jobPreferences: extractedJobPreferencesSchema,
}).transform((profile) => seedExtractedJobTitlesSeeking(profile));

function normalizeString(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function nullIfEmpty(value: string): string | null {
  return value.trim() || null;
}

function normalizeStringArray(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function normalizeRemotePreferences(values: string[]): string[] {
  const normalized = Array.from(
    new Set(values.filter((value) => isRemotePreferenceValue(value))),
  );

  return normalized.includes("any")
    ? ["any"]
    : normalized.filter((value) => value !== "");
}

function parseRemotePreferences(value: unknown): string[] {
  if (Array.isArray(value)) {
    return normalizeRemotePreferences(
      value.filter((item) => typeof item === "string"),
    );
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return parseRemotePreferences(parsed);
    } catch {
      return [];
    }
  }

  return normalizeRemotePreferences(
    trimmed
      .split(REMOTE_PREFERENCE_DELIMITER)
      .map((item) => item.trim()),
  );
}

function serializeRemotePreferences(values: string[]): string | null {
  const normalized = normalizeRemotePreferences(values);
  return normalized.length > 0
    ? normalized.join(REMOTE_PREFERENCE_DELIMITER)
    : null;
}

function normalizeExtractedText(value: unknown, maxLength: number): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value).slice(0, maxLength);
  }

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeExtractedStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return normalizeStringArray(
    value.map((item) => normalizeExtractedText(item, MAX_MEDIUM_TEXT_LENGTH)),
  ).slice(0, MAX_PROFILE_LIST_ITEMS);
}

function normalizeExtractedObjectArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    return [value];
  }

  return [];
}

function normalizeExtractedRemotePreferences(value: unknown): string[] {
  if (typeof value === "string") {
    return parseRemotePreferences(value);
  }

  if (Array.isArray(value)) {
    return normalizeRemotePreferences(
      value.map((item) => normalizeExtractedText(item, MAX_SHORT_TEXT_LENGTH)),
    );
  }

  return [];
}

function seedExtractedJobTitlesSeeking(
  profile: ExtractedProfileData,
): ExtractedProfileData {
  const seededTitles = normalizeStringArray([
    ...profile.jobPreferences.jobTitlesSeeking,
    profile.professionalInfo.currentTitle,
    ...profile.workExperience
      .slice(0, MAX_SEEDED_JOB_TITLE_ROLES)
      .map((role) => role.jobTitle),
  ]).slice(0, MAX_PROFILE_LIST_ITEMS);

  return {
    ...profile,
    jobPreferences: {
      ...profile.jobPreferences,
      jobTitlesSeeking: seededTitles,
    },
  };
}

function getRequiredRole(roles: WorkRole[]): WorkRole | null {
  return (
    roles.find(
      (role) =>
        Boolean(role.companyName) &&
        Boolean(role.jobTitle) &&
        Boolean(role.startDate) &&
        Boolean(role.responsibilities),
    ) ?? null
  );
}

function hasCompleteEducation(education: EducationEntry[]): boolean {
  return education.some(
    (entry) =>
      Boolean(entry.highestDegree) &&
      Boolean(entry.fieldOfStudy) &&
      Boolean(entry.institutionName) &&
      Boolean(entry.graduationYear),
  );
}

function formatResumeFileName(key: string): string {
  const fileName = key.split("/").pop();
  return fileName || "Active resume.pdf";
}

function createEmptyEducationEntry(index: number): EducationEntry {
  return {
    id: `education-${index + 1}`,
    highestDegree: "",
    fieldOfStudy: "",
    institutionName: "",
    graduationYear: "",
  };
}

function normalizeEducationEntries(value: unknown): EducationEntry[] {
  const valueRecord = isRecord(value) ? value : null;
  const candidateEntries = Array.isArray(valueRecord?.entries)
    ? valueRecord.entries
    : valueRecord
      ? [valueRecord]
      : [];
  const entries = candidateEntries
    .map((entry, index) => parseEducationEntry(entry, index))
    .filter((entry) => entry !== null);

  return entries.length > 0 ? entries : [createEmptyEducationEntry(0)];
}

function parseEducationEntry(
  value: unknown,
  index: number,
): EducationEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  const result = educationEntrySchema.safeParse({
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id
        : `education-${index + 1}`,
    highestDegree:
      typeof value.highestDegree === "string" ? value.highestDegree : "",
    fieldOfStudy:
      typeof value.fieldOfStudy === "string" ? value.fieldOfStudy : "",
    institutionName:
      typeof value.institutionName === "string" ? value.institutionName : "",
    graduationYear:
      typeof value.graduationYear === "string" ? value.graduationYear : "",
  });

  return result.success ? result.data : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isExperienceLevelValue(
  value: unknown,
): value is "" | "junior" | "mid" | "senior" | "lead" {
  return (
    value === "" ||
    value === "junior" ||
    value === "mid" ||
    value === "senior" ||
    value === "lead"
  );
}

function isRemotePreferenceValue(
  value: unknown,
): value is "" | "remote" | "onsite" | "hybrid" | "any" {
  return (
    value === "" ||
    value === "remote" ||
    value === "onsite" ||
    value === "hybrid" ||
    value === "any"
  );
}

function isCoverLetterToneValue(
  value: unknown,
): value is "" | "formal" | "casual" | "enthusiastic" {
  return (
    value === "" ||
    value === "formal" ||
    value === "casual" ||
    value === "enthusiastic"
  );
}

function isWorkAuthorizationValue(
  value: unknown,
): value is "" | "citizen" | "permanent_resident" | "visa_required" {
  return (
    value === "" ||
    value === "citizen" ||
    value === "permanent_resident" ||
    value === "visa_required"
  );
}

function isEducationDegreeValue(
  value: unknown,
): value is "" | "bachelors" | "masters" | "phd" | "bootcamp" | "self_taught" {
  return (
    value === "" ||
    value === "bachelors" ||
    value === "masters" ||
    value === "phd" ||
    value === "bootcamp" ||
    value === "self_taught"
  );
}

export function parseProfileRecord(value: unknown): ProfileRecord | null {
  const result = profileRowSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseExtractedProfileData(
  value: unknown,
): ExtractedProfileData | null {
  const result = extractedProfileSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function createEmptyProfileViewModel(email: string): ProfileViewModel {
  return {
    personalInfo: {
      fullName: "",
      email,
      phone: "",
      location: "",
      linkedinUrl: "",
      portfolioUrl: "",
      workAuthorization: "",
    },
    professionalInfo: {
      currentTitle: "",
      experienceLevel: "",
      yearsExperience: "",
      skills: [],
      industries: [],
    },
    workExperience: [
      {
        id: "role-one",
        companyName: "",
        jobTitle: "",
        startDate: "",
        endDate: "",
        current: false,
        responsibilities: "",
      },
    ],
    education: [createEmptyEducationEntry(0)],
    jobPreferences: {
      jobTitlesSeeking: [],
      remotePreferences: [],
      salaryExpectation: "",
      preferredLocations: [],
      coverLetterTone: "",
    },
    resume: {
      fileName: "",
      fileDetails: "",
      hasExtractedProfile: false,
      url: "",
      key: "",
    },
  };
}

export function mapProfileRecordToViewModel(
  record: ProfileRecord | null,
  email: string,
): ProfileViewModel {
  if (!record) {
    return createEmptyProfileViewModel(email);
  }

  return {
    personalInfo: {
      fullName: normalizeString(record.full_name),
      email: record.email || email,
      phone: normalizeString(record.phone),
      location: normalizeString(record.location),
      linkedinUrl: normalizeString(record.linkedin_url),
      portfolioUrl: normalizeString(record.portfolio_url),
      workAuthorization: normalizeString(record.work_authorization),
    },
    professionalInfo: {
      currentTitle: normalizeString(record.current_title),
      experienceLevel: normalizeString(record.experience_level),
      yearsExperience:
        record.years_experience === null ? "" : String(record.years_experience),
      skills: record.skills,
      industries: record.industries,
    },
    workExperience:
      record.work_experience.length > 0
        ? record.work_experience
        : createEmptyProfileViewModel(email).workExperience,
    education: record.education.entries,
    jobPreferences: {
      jobTitlesSeeking: record.job_titles_seeking,
      remotePreferences: parseRemotePreferences(record.remote_preference),
      salaryExpectation: normalizeString(record.salary_expectation),
      preferredLocations: record.preferred_locations,
      coverLetterTone: normalizeString(record.cover_letter_tone),
    },
    resume: {
      fileName: record.resume_pdf_key
        ? formatResumeFileName(record.resume_pdf_key)
        : "",
      fileDetails: record.resume_pdf_key ? "Active PDF saved" : "",
      hasExtractedProfile:
        Boolean(record.resume_pdf_key) &&
        record.resume_pdf_key === record.resume_extracted_pdf_key,
      url: normalizeString(record.resume_pdf_url),
      key: normalizeString(record.resume_pdf_key),
    },
  };
}

export function parseProfileFormData(
  formData: FormData,
): ProfileMutationValues {
  const remotePreferenceValues = parseJsonArray(
    formData.get("remotePreferences"),
  );
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    location: String(formData.get("location") ?? ""),
    currentTitle: String(formData.get("currentTitle") ?? ""),
    experienceLevel: String(formData.get("experienceLevel") ?? ""),
    yearsExperience: String(formData.get("yearsExperience") ?? ""),
    skills: parseJsonArray(formData.get("skills")),
    industries: parseJsonArray(formData.get("industries")),
    workExperience: parseJsonArray(formData.get("workExperience")),
    education: parseEducationFormEntries(formData),
    jobTitlesSeeking: parseJsonArray(formData.get("jobTitlesSeeking")),
    remotePreferences:
      remotePreferenceValues.length > 0
        ? remotePreferenceValues
        : formData.getAll("remotePreference"),
    preferredLocations: parseJsonArray(formData.get("preferredLocations")),
    salaryExpectation: String(formData.get("salaryExpectation") ?? ""),
    coverLetterTone: String(formData.get("coverLetterTone") ?? ""),
    linkedinUrl: String(formData.get("linkedinUrl") ?? ""),
    portfolioUrl: String(formData.get("portfolioUrl") ?? ""),
    workAuthorization: String(formData.get("workAuthorization") ?? ""),
  };
  const parsed = profileFormSchema.parse(raw);

  return {
    fullName: parsed.fullName,
    email: parsed.email,
    phone: parsed.phone,
    location: parsed.location,
    currentTitle: parsed.currentTitle,
    experienceLevel: parsed.experienceLevel,
    yearsExperience: parsed.yearsExperience,
    skills: parsed.skills,
    industries: parsed.industries,
    workExperience: parsed.workExperience,
    education: parsed.education,
    jobTitlesSeeking: parsed.jobTitlesSeeking,
    remotePreferences: parsed.remotePreferences,
    preferredLocations: parsed.preferredLocations,
    salaryExpectation: parsed.salaryExpectation,
    coverLetterTone: parsed.coverLetterTone,
    linkedinUrl: parsed.linkedinUrl,
    portfolioUrl: parsed.portfolioUrl,
    workAuthorization: parsed.workAuthorization,
  };
}

export function toProfileDatabasePayload(
  userId: string,
  values: ProfileMutationValues,
  hasResume: boolean,
): ProfileDatabasePayload {
  return {
    id: userId,
    full_name: nullIfEmpty(values.fullName),
    email: values.email,
    phone: nullIfEmpty(values.phone),
    location: nullIfEmpty(values.location),
    current_title: nullIfEmpty(values.currentTitle),
    experience_level: nullIfEmpty(values.experienceLevel),
    years_experience: values.yearsExperience,
    skills: values.skills,
    industries: values.industries,
    work_experience: values.workExperience,
    education: { entries: values.education },
    job_titles_seeking: values.jobTitlesSeeking,
    remote_preference: serializeRemotePreferences(values.remotePreferences),
    preferred_locations: values.preferredLocations,
    salary_expectation: nullIfEmpty(values.salaryExpectation),
    cover_letter_tone: nullIfEmpty(values.coverLetterTone),
    linkedin_url: nullIfEmpty(values.linkedinUrl),
    portfolio_url: nullIfEmpty(values.portfolioUrl),
    work_authorization: nullIfEmpty(values.workAuthorization),
    is_complete: calculateCompletion(values, hasResume).isComplete,
  };
}

export function calculateCompletion(
  profile: ProfileMutationValues | ProfileViewModel,
  hasResume: boolean,
): CompletionSummary {
  const values =
    "personalInfo" in profile ? viewModelToMutationValues(profile) : profile;

  const checks = [
    {
      key: "fullName",
      label: "FULL NAME",
      complete: Boolean(values.fullName),
      completedLabel: "Name added",
    },
    {
      key: "email",
      label: "EMAIL",
      complete: Boolean(values.email),
      completedLabel: "Email added",
    },
    {
      key: "phone",
      label: "PHONE",
      complete: Boolean(values.phone),
      completedLabel: "Phone added",
    },
    {
      key: "location",
      label: "LOCATION",
      complete: Boolean(values.location),
      completedLabel: "Location added",
    },
    {
      key: "currentTitle",
      label: "CURRENT TITLE",
      complete: Boolean(values.currentTitle),
      completedLabel: "Title added",
    },
    {
      key: "experience",
      label: "EXPERIENCE",
      complete:
        Boolean(values.experienceLevel) && values.yearsExperience !== null,
      completedLabel: "Experience added",
    },
    {
      key: "skills",
      label: "SKILLS",
      complete: values.skills.length > 0,
      completedLabel: "Skills added",
    },
    {
      key: "workExperience",
      label: "WORK EXPERIENCE",
      complete: Boolean(getRequiredRole(values.workExperience)),
      completedLabel: "Role added",
    },
    {
      key: "education",
      label: "EDUCATION",
      complete: hasCompleteEducation(values.education),
      completedLabel: "Education added",
    },
    {
      key: "jobTitlesSeeking",
      label: "TARGET ROLES",
      complete: values.jobTitlesSeeking.length > 0,
      completedLabel: "Target roles added",
    },
    {
      key: "remotePreference",
      label: "REMOTE PREFERENCE",
      complete: values.remotePreferences.length > 0,
      completedLabel: "Preference added",
    },
    {
      key: "workAuthorization",
      label: "WORK AUTHORIZATION",
      complete: Boolean(values.workAuthorization),
      completedLabel: "Authorization added",
    },
    {
      key: "resume",
      label: "RESUME",
      complete: hasResume,
      completedLabel: "Resume attached",
    },
  ];

  const completed = checks.filter((check) => check.complete);
  const missing = checks.filter((check) => !check.complete);

  return {
    completion: Math.round((completed.length / checks.length) * 100),
    missingFields: missing.map((check) => check.label),
    missingItems: missing.map((check) => ({
      key: check.key as CompletionFieldKey,
      label: check.label,
    })),
    completedFields: completed.slice(0, 3).map((check) => check.completedLabel),
    isComplete: missing.length === 0,
  };
}

export function viewModelToMutationValues(
  profile: ProfileViewModel,
): ProfileMutationValues {
  return {
    fullName: profile.personalInfo.fullName,
    email: profile.personalInfo.email,
    phone: profile.personalInfo.phone,
    location: profile.personalInfo.location,
    currentTitle: profile.professionalInfo.currentTitle,
    experienceLevel: profile.professionalInfo.experienceLevel,
    yearsExperience: profile.professionalInfo.yearsExperience
      ? Number(profile.professionalInfo.yearsExperience)
      : null,
    skills: profile.professionalInfo.skills,
    industries: profile.professionalInfo.industries,
    workExperience: profile.workExperience,
    education: profile.education,
    jobTitlesSeeking: profile.jobPreferences.jobTitlesSeeking,
    remotePreferences: profile.jobPreferences.remotePreferences,
    preferredLocations: profile.jobPreferences.preferredLocations,
    salaryExpectation: profile.jobPreferences.salaryExpectation,
    coverLetterTone: profile.jobPreferences.coverLetterTone,
    linkedinUrl: profile.personalInfo.linkedinUrl,
    portfolioUrl: profile.personalInfo.portfolioUrl,
    workAuthorization: profile.personalInfo.workAuthorization,
  };
}

function parseJsonArray(value: FormDataEntryValue | null): unknown[] {
  if (typeof value !== "string" || !value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseEducationFormEntries(formData: FormData): unknown[] {
  const entries = parseJsonArray(formData.get("education"));

  if (entries.length > 0) {
    return entries;
  }

  const legacyEntry = {
    id: "education-1",
    highestDegree: String(formData.get("highestDegree") ?? ""),
    fieldOfStudy: String(formData.get("fieldOfStudy") ?? ""),
    institutionName: String(formData.get("institutionName") ?? ""),
    graduationYear: String(formData.get("graduationYear") ?? ""),
  };

  return [
    legacyEntry.highestDegree,
    legacyEntry.fieldOfStudy,
    legacyEntry.institutionName,
    legacyEntry.graduationYear,
  ].some((value) => value.trim())
    ? [legacyEntry]
    : [];
}
