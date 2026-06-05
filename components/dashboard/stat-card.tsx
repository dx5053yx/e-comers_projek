import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="transition hover:border-primary/35 hover:shadow-lg hover:shadow-primary/10">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 truncate text-2xl font-semibold tracking-tight">{value}</p>
          {helper ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
        </div>
        <div className="rounded-md bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
