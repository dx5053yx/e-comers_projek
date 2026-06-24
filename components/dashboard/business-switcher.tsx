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
      className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-primary"
      aria-label="Mengganti toko"
    />
  ) : (
    <ChevronDown
      className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-foreground)]"
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
    <form ref={formRef} action={switchBusinessAction} className={cn(!compact && "space-y-1.5")}>
      {!compact && (
        <label
          htmlFor="active-business"
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]"
        >
          <Store className="h-3.5 w-3.5" aria-hidden />
          Toko aktif
        </label>
      )}
      <div className="relative">
        <select
          id={compact ? "mobile-active-business" : "active-business"}
          name="business_id"
          defaultValue={activeBusinessId}
          className={cn(
            "appearance-none rounded-md border border-[var(--border)] bg-[var(--card)] pl-3 pr-8 font-bold text-[var(--foreground)] outline-none transition hover:border-primary/40 focus:border-primary",
            compact ? "h-8 py-1 text-xs max-w-[160px] sm:max-w-[200px]" : "h-10 w-full text-sm",
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
