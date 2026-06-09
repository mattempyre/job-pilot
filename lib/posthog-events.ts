export type PostHogEventName =
  | "job_search_started"
  | "job_found"
  | "profile_completed"
  | "company_researched";

type PostHogEventKey =
  | "jobSearchStarted"
  | "jobFound"
  | "profileCompleted"
  | "companyResearched";

export const POSTHOG_EVENT_NAMES: Record<PostHogEventKey, PostHogEventName> = {
  jobSearchStarted: "job_search_started",
  jobFound: "job_found",
  profileCompleted: "profile_completed",
  companyResearched: "company_researched",
};

export type JobSearchStartedProperties = {
  userId: string;
  jobTitle: string;
  location: string;
};

export type JobFoundProperties = {
  userId: string;
  source: string;
  matchScore: number;
};

export type ProfileCompletedProperties = {
  userId: string;
};

export type CompanyResearchedProperties = {
  userId: string;
  jobId: string;
  company: string;
};

export type PostHogEventProperties =
  | JobSearchStartedProperties
  | JobFoundProperties
  | ProfileCompletedProperties
  | CompanyResearchedProperties;
