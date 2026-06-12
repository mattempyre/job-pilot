type Props = {
  score: number;
};

function getScoreFillClass(score: number): string {
  if (score >= 80) {
    return "bg-success";
  }

  if (score >= 60) {
    return "bg-info-medium";
  }

  return "bg-warning";
}

export function MatchScore({ score }: Props) {
  const fillClass = getScoreFillClass(score);

  return (
    <div className="flex min-w-[150px] items-center gap-3">
      <div
        aria-hidden="true"
        className="h-1.5 w-24 overflow-hidden rounded-full bg-border-light"
      >
        <div
          className={`h-full rounded-full ${fillClass}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="min-w-10 text-[14px] font-semibold leading-5 text-text-dark">
        {score}%
      </span>
    </div>
  );
}
