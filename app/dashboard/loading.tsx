export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
        <div className="mt-4 h-8 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-md border border-border bg-card p-5">
            <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 h-8 w-32 animate-pulse rounded-md bg-muted" />
            <div className="mt-3 h-3 w-40 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="h-80 rounded-md border border-border bg-card p-5">
          <div className="h-5 w-44 animate-pulse rounded-md bg-muted" />
          <div className="mt-8 h-56 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-80 rounded-md border border-border bg-card p-5">
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
