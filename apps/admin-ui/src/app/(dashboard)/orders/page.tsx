"use client";

import React, { useMemo } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column } from "../../../components/table/DataTable";
import { Pagination } from "../../../components/table/Pagination";
import { SearchInput } from "../../../components/table/SearchInput";
import { PackageSearch } from "lucide-react";

type AdminOrder = {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  couponCode?: string | null;
  createdAt: string;
  user?: { name?: string | null; email?: string | null } | null;
  shop?: { name?: string | null } | null;
};

function useQueryState() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = params.get("q") ?? "";
  const page = Number(params.get("page") ?? "1") || 1;
  const limit = Number(params.get("limit") ?? "10") || 10;

  const setParams = (next: Record<string, string | number | null | undefined>) => {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") sp.delete(k);
      else sp.set(k, String(v));
    });
    router.push(`${pathname}?${sp.toString()}`);
  };

  return { q, page, limit, setParams };
}

export default function AdminOrdersPage() {
  const { q, page, limit, setParams } = useQueryState();

  const { data, isLoading } = useQuery({
    queryKey: ["adminOrders", { q, page, limit }],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/admin/orders", {
        params: { q, page, limit },
      });
      return res.data as { data: AdminOrder[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    },
  });

  const columns = useMemo<Column<AdminOrder>[]>(
    () => [
      {
        key: "id",
        header: "Order",
        render: (o) => <span className="font-semibold text-slate-900 dark:text-white">#{o.id.slice(-6).toUpperCase()}</span>,
      },
      {
        key: "customer",
        header: "Customer",
        render: (o) => (
          <div className="leading-tight">
            <div className="font-semibold">{o.user?.name ?? "—"}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{o.user?.email ?? ""}</div>
          </div>
        ),
      },
      {
        key: "shop",
        header: "Shop",
        render: (o) => <span className="text-sm">{o.shop?.name ?? "—"}</span>,
      },
      {
        key: "total",
        header: "Total",
        className: "whitespace-nowrap",
        render: (o) => <span className="font-semibold">${Number(o.total ?? 0).toFixed(2)}</span>,
      },
      {
        key: "status",
        header: "Status",
        className: "whitespace-nowrap",
        render: (o) => (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            {o.deliveryStatus ?? o.status ?? "—"}
          </span>
        ),
      },
      {
        key: "date",
        header: "Date",
        className: "whitespace-nowrap",
        render: (o) => new Date(o.createdAt).toLocaleString(),
      },
    ],
    []
  );

  const meta = data?.meta;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Orders
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Search and manage orders across all shops.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={q} onChange={(v) => setParams({ q: v, page: 1 })} placeholder="Search by customer, shop, coupon, order id…" />
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {meta ? (
            <>
              <span className="text-slate-900 dark:text-white">{meta.total}</span> results
            </>
          ) : (
            <span className="inline-flex items-center gap-2"><PackageSearch className="h-4 w-4" />Fetching…</span>
          )}
        </div>
      </div>

      <DataTable columns={columns} rows={data?.data ?? []} isLoading={isLoading} />

      <Pagination
        page={meta?.page ?? page}
        totalPages={meta?.totalPages ?? 1}
        limit={meta?.limit ?? limit}
        onPageChange={(p) => setParams({ page: p })}
        onLimitChange={(l) => setParams({ limit: l, page: 1 })}
      />
    </div>
  );
}

