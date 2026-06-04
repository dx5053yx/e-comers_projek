import { cn } from "@/lib/utils";

const toneClass = {
  default: "border-border bg-muted text-foreground",
  green: "border-primary/20 bg-primary/10 text-primary",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  gray: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

export function Badge({
  className,
  tone = "default",
  children,
}: {
  className?: string;
  tone?: keyof typeof toneClass;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium leading-none",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
