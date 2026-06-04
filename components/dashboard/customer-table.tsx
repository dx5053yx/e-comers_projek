"use client";

import { MessageCircle, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Td, Th, Table } from "@/components/ui/table";
import {
  getCustomerDisplayName,
  getCustomerDisplayPhone,
  getCustomerPrimaryPhone,
} from "@/lib/customers";
import type { Customer, CustomerSegment } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { createWhatsAppUrl } from "@/lib/whatsapp";

const segmentLabels: Record<CustomerSegment | "ALL", string> = {
  ALL: "Semua",
  NEW: "Baru",
  RETURNING: "Repeat",
  LOYAL: "Loyal",
};

export function CustomerTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<CustomerSegment | "ALL">("ALL");

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSegment = segment === "ALL" || customer.segment === segment;
      const searchable = [
        getCustomerDisplayName(customer),
        getCustomerDisplayPhone(customer),
        customer.email,
        customer.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesSegment && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [customers, query, segment]);

  if (!customers.length) {
    return (
      <EmptyState
        title="Belum ada customer"
        description="Customer dari order website dan WhatsApp akan muncul di halaman ini."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Cari nama, WhatsApp, email, atau alamat"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(segmentLabels) as Array<CustomerSegment | "ALL">).map((item) => (
            <button
              key={item}
              className={
                item === segment
                  ? "h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  : "h-10 shrink-0 rounded-md border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              }
              type="button"
              onClick={() => setSegment(item)}
            >
              {segmentLabels[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="table-scroll">
        <Table>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>WhatsApp</Th>
              <Th>Email</Th>
              <Th>Segment</Th>
              <Th>Dibuat</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => {
              const name = getCustomerDisplayName(customer);
              const phone = getCustomerDisplayPhone(customer);
              const waUrl = createWhatsAppUrl(getCustomerPrimaryPhone(customer));

              return (
                <tr key={customer.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <UserRound className="h-5 w-5" aria-hidden />
                      </div>
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {customer.address ?? "Alamat belum diisi"}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>{phone}</Td>
                  <Td>{customer.email ?? "-"}</Td>
                  <Td>
                    <Badge tone={customer.segment === "LOYAL" ? "green" : "blue"}>
                      {segmentLabels[customer.segment]}
                    </Badge>
                  </Td>
                  <Td>{formatDate(customer.created_at)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Link
                        className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium transition hover:border-primary/30 hover:text-primary"
                        href={`/dashboard/customers/${customer.id}`}
                      >
                        Detail
                      </Link>
                      {waUrl ? (
                        <Link
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
                          href={waUrl}
                          target="_blank"
                          aria-label={`Chat ${name}`}
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden />
                        </Link>
                      ) : null}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {!filteredCustomers.length ? (
        <EmptyState
          title="Customer tidak ditemukan"
          description="Coba ubah kata pencarian atau filter segment."
        />
      ) : null}
    </div>
  );
}
