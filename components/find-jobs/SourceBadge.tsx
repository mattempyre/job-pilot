import type { JobSource } from "@/components/find-jobs/types";

type Props = {
  source: JobSource;
};

export function SourceBadge({ source }: Props) {
  const isSearch = source === "search";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium leading-4 ${
        isSearch
          ? "bg-info-lightest text-info-foreground"
          : "bg-surface-secondary text-text-secondary"
      }`}
    >
      {isSearch ? "Search" : "URL"}
    </span>
  );
}
