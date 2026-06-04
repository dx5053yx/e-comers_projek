import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        "w-full min-w-[760px] border-collapse text-sm [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/35",
        className,
      )}
      {...props}
    />
  );
}

export function Th({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-border bg-muted/40 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Td({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("border-b border-border px-4 py-3.5 align-middle", className)}
      {...props}
    />
  );
}
