"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";

import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsMobileList } from "@/components/find-jobs/JobsMobileList";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { mockJobs } from "@/components/find-jobs/mockJobs";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import type {
  MatchFilter,
  MockJob,
  SortOption,
} from "@/components/find-jobs/types";
import { MATCH_THRESHOLD } from "@/lib/utils";

const PAGE_SIZE = 6;

function matchesFilter(job: MockJob, filterText: string): boolean {
  const normalizedFilter = filterText.trim().toLowerCase();

  if (!normalizedFilter) {
    return true;
  }

  return `${job.company} ${job.role}`.toLowerCase().includes(normalizedFilter);
}

function matchesScoreFilter(job: MockJob, matchFilter: MatchFilter): boolean {
  if (matchFilter === "high") {
    return job.matchScore >= MATCH_THRESHOLD;
  }

  if (matchFilter === "low") {
    return job.matchScore < MATCH_THRESHOLD;
  }

  return true;
}

function sortJobs(jobs: MockJob[], sortOption: SortOption): MockJob[] {
  return [...jobs].sort((first, second) => {
    if (sortOption === "newest") {
      return (
        new Date(second.foundAt).getTime() - new Date(first.foundAt).getTime()
      );
    }

    if (sortOption === "oldest") {
      return (
        new Date(first.foundAt).getTime() - new Date(second.foundAt).getTime()
      );
    }

    return second.matchScore - first.matchScore;
  });
}

export function FindJobsExperience() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [filterText, setFilterText] = useState("");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("match-score");
  const [currentPage, setCurrentPage] = useState(1);

  const strongMatches = useMemo(
    () => mockJobs.filter((job) => job.matchScore >= MATCH_THRESHOLD).length,
    [],
  );

  const filteredJobs = useMemo(() => {
    const matchingJobs = mockJobs.filter(
      (job) =>
        matchesFilter(job, filterText) &&
        matchesScoreFilter(job, matchFilter),
    );

    return sortJobs(matchingJobs, sortOption);
  }, [filterText, matchFilter, sortOption]);

  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);
  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const paginatedJobs = filteredJobs.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  function resetToFirstPage(): void {
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      <SearchControls
        jobTitle={jobTitle}
        location={location}
        onJobTitleChange={setJobTitle}
        onLocationChange={setLocation}
        onSubmit={() => {
          resetToFirstPage();
        }}
        strongMatches={strongMatches}
        totalJobs={mockJobs.length}
      />

      <JobFilters
        filterText={filterText}
        matchFilter={matchFilter}
        onFilterTextChange={(value) => {
          setFilterText(value);
          resetToFirstPage();
        }}
        onMatchFilterChange={(value) => {
          setMatchFilter(value);
          resetToFirstPage();
        }}
        onSortOptionChange={(value) => {
          setSortOption(value);
          resetToFirstPage();
        }}
        sortOption={sortOption}
      />

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h1 className="text-[16px] font-semibold leading-6 text-text-primary">
              Job Matches
            </h1>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
              Jobs by Adzuna
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-muted px-3 py-1 text-[12px] font-medium leading-4 text-accent">
            <BriefcaseBusiness
              aria-hidden="true"
              className="size-4"
              strokeWidth={2}
            />
            {filteredJobs.length} visible matches
          </div>
        </div>

        {paginatedJobs.length > 0 ? (
          <>
            <JobsTable jobs={paginatedJobs} />
            <JobsMobileList jobs={paginatedJobs} />
          </>
        ) : (
          <div className="grid place-items-center px-5 py-12 text-center">
            <div className="max-w-sm">
              <div className="mx-auto flex size-10 items-center justify-center rounded-md bg-accent-muted text-accent">
                <BriefcaseBusiness
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={2}
                />
              </div>
              <h2 className="mt-4 text-[16px] font-semibold leading-6 text-text-primary">
                No jobs match these filters
              </h2>
              <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">
                Try a broader company, role, or match filter to bring mock
                results back into view.
              </p>
            </div>
          </div>
        )}

        <JobsPagination
          currentPage={safeCurrentPage}
          onPageChange={setCurrentPage}
          pageSize={PAGE_SIZE}
          totalItems={filteredJobs.length}
          totalPages={totalPages}
        />
      </section>
    </div>
  );
}
