import { cn } from "@/lib/utils";

const toneClass = {
  default: "badge--muted",
  green: "badge--green",
  amber: "badge--amber",
  red: "badge--red",
  blue: "badge--muted",
  gray: "badge--muted",
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
    <span className={cn("badge", toneClass[tone], className)}>
      {children}
    </span>
  );
}
