"use client";

import { ChevronDown, LoaderCircle, Store } from "lucide-react";
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { switchBusinessAction } from "@/app/dashboard/actions";
import type { BusinessMembership } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

const roleLabels = {
  OWNER: "Pemilik",
  STAFF: "Staf",
  VIEWER: "Tamu",
};

function SwitchStatus() {
  const { pending } = useFormStatus();

  return pending ? (
    <LoaderCircle
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary"
      aria-label="Mengganti toko"
    />
  ) : (
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden
    />
  );
}

export function BusinessSwitcher({
  activeBusinessId,
  memberships,
  compact = false,
}: {
  activeBusinessId?: string;
  memberships: BusinessMembership[];
  compact?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (memberships.length < 2) {
    return null;
  }

  return (
    <form ref={formRef} action={switchBusinessAction} className="space-y-1.5">
      <label
        htmlFor={compact ? "mobile-active-business" : "active-business"}
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        <Store className="h-3.5 w-3.5" aria-hidden />
        Toko aktif
      </label>
      <div className="relative">
        <select
          id={compact ? "mobile-active-business" : "active-business"}
          name="business_id"
          defaultValue={activeBusinessId}
          className={cn(
            "h-10 w-full appearance-none rounded-md border border-border bg-background pl-3 pr-9 text-sm font-medium text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
            compact && "h-11",
          )}
          onChange={() => formRef.current?.requestSubmit()}
        >
          {memberships.map((membership) => (
            <option key={membership.business.id} value={membership.business.id}>
              {membership.business.name} ({roleLabels[membership.role]})
            </option>
          ))}
        </select>
        <SwitchStatus />
      </div>
    </form>
  );
}
