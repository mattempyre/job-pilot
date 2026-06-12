"use client";

import { Search } from "lucide-react";

import type { MatchFilter, SortOption } from "@/components/find-jobs/types";

type Props = {
  filterText: string;
  matchFilter: MatchFilter;
  sortOption: SortOption;
  onFilterTextChange: (value: string) => void;
  onMatchFilterChange: (value: MatchFilter) => void;
  onSortOptionChange: (value: SortOption) => void;
};

export function JobFilters({
  filterText,
  matchFilter,
  sortOption,
  onFilterTextChange,
  onMatchFilterChange,
  onSortOptionChange,
}: Props) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
        <label className="flex h-11 items-center gap-3 rounded-md border border-border bg-surface px-3 transition-[border-color,box-shadow] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent lg:border-0 lg:shadow-none">
          <Search
            aria-hidden="true"
            className="size-5 shrink-0 text-text-muted"
            strokeWidth={2}
          />
          <span className="sr-only">Filter by company or role</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-[14px] font-medium leading-5 text-text-primary outline-none placeholder:text-text-muted"
            onChange={(event) => onFilterTextChange(event.target.value)}
            placeholder="Filter by company or role..."
            type="search"
            value={filterText}
          />
        </label>

        <div className="hidden h-10 w-px bg-border lg:block" aria-hidden="true" />

        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="sr-only">Match filter</span>
            <select
              className="h-11 w-full rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-1 focus:ring-accent sm:w-40"
              onChange={(event) =>
                onMatchFilterChange(event.target.value as MatchFilter)
              }
              value={matchFilter}
            >
              <option value="all">All Matches</option>
              <option value="high">High Match</option>
              <option value="low">Low Match</option>
            </select>
          </label>

          <label>
            <span className="sr-only">Sort jobs</span>
            <select
              className="h-11 w-full rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-1 focus:ring-accent sm:w-40"
              onChange={(event) =>
                onSortOptionChange(event.target.value as SortOption)
              }
              value={sortOption}
            >
              <option value="match-score">Match Score</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
