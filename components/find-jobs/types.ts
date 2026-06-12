export type JobSource = "search" | "url";

export type MockJob = {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  salary: string;
  source: JobSource;
  foundAt: string;
  foundAtLabel: string;
};

export type MatchFilter = "all" | "high" | "low";

export type SortOption = "match-score" | "newest" | "oldest";
