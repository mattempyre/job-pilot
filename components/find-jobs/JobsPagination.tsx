"use client";

type Props = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function JobsPagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
}: Props) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-4 rounded-b-xl bg-surface p-4 md:flex-row md:items-center md:justify-between md:px-6">
      <p className="text-[14px] font-normal leading-5 text-text-secondary">
        Showing <span className="font-semibold text-text-dark">{start}</span> to{" "}
        <span className="font-semibold text-text-dark">{end}</span> of{" "}
        <span className="font-semibold text-text-dark">{totalItems}</span>{" "}
        results
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="h-10 rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-secondary shadow-sm transition-[background-color,border-color,color,box-shadow] hover:bg-surface-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Previous
        </button>

        {pages.map((page) => (
          <button
            aria-current={page === currentPage ? "page" : undefined}
            className={`size-10 rounded-md border text-[14px] font-semibold leading-5 shadow-sm transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              page === currentPage
                ? "border-accent-light bg-accent-muted text-accent"
                : "border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-accent"
            }`}
            key={page}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ))}

        <button
          className="h-10 rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-secondary shadow-sm transition-[background-color,border-color,color,box-shadow] hover:bg-surface-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
