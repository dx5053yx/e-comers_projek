import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          siPandu
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link className="w-full sm:w-auto" href={action.href}>
          <Button className="w-full sm:w-auto">{action.label}</Button>
        </Link>
      ) : null}
    </div>
  );
}
