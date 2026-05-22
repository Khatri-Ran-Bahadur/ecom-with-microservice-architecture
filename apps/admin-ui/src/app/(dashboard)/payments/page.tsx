"use client";

import React, { useMemo, Suspense } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column } from "../../../components/table/DataTable";
import { Pagination } from "../../../components/table/Pagination";
import { SearchInput } from "../../../components/table/SearchInput";
import { CreditCard, Loader2 } from "lucide-react";


type PaymentRecord = {
  id: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string; // "PAID" | "PENDING" | "REFUNDED"
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  shop?: {
    name?: string | null;
  } | null;
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

function PaymentsContent() {
  const { q, page, limit, setParams } = useQueryState();


  const { data, isLoading } = useQuery({
    queryKey: ["adminPaymentsList", { q, page, limit }],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/payments", {
        params: { q, page, limit },
      });
      return res.data as {
        success: boolean;
        orders: PaymentRecord[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
    },
  });

  const columns = useMemo<Column<PaymentRecord>[]>(
    () => [
      {
        key: "order",
        header: "Order / Tx ID",
        render: (o) => (
          <div className="font-semibold text-slate-800 dark:text-white uppercase">
            #{o.id.slice(-8).toUpperCase()}
          </div>
        ),
      },
      {
        key: "customer",
        header: "Buyer Info",
        render: (o) => (
          <div className="leading-tight">
            <div className="font-semibold text-slate-800 dark:text-white">{o.user?.name ?? "Guest Customer"}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{o.user?.email ?? "—"}</div>
          </div>
        ),
      },
      {
        key: "shop",
        header: "Receiving Merchant",
        render: (o) => <span className="text-sm font-medium">{o.shop?.name ?? "Platform Store"}</span>,
      },
      {
        key: "amount",
        header: "Amount Paid",
        className: "whitespace-nowrap",
        render: (o) => (
          <span className="font-extrabold text-slate-900 dark:text-white">
            ${Number(o.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "method",
        header: "Method",
        render: (o) => {
          const method = (o.paymentMethod || "COD").toUpperCase();
          return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>{method}</span>
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Payment Status",
        render: (o) => {
          const status = (o.paymentStatus || "PENDING").toUpperCase();
          if (status === "PAID") {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                Paid
              </span>
            );
          }
          if (status === "REFUNDED") {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30">
                Refunded
              </span>
            );
          }
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
              Pending
            </span>
          );
        },
      },
      {
        key: "date",
        header: "Timestamp",
        className: "whitespace-nowrap",
        render: (o) => (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(o.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        ),
      },
    ],
    []
  );

  const pagination = data?.pagination;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Payments
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 font-sans">
            Track and search purchase histories, total sales amounts, and transaction payment statuses.
          </p>
        </div>
      </div>

      {/* Filters & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={q}
          onChange={(v) => setParams({ q: v, page: 1 })}
          placeholder="Search transactions by Order ID, Customer name…"
        />
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {pagination ? (
            <>
              <span className="text-slate-900 dark:text-white">{pagination.total}</span> total transactions
            </>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Fetching…
            </span>
          )}
        </div>
      </div>

      {/* Payments Data Table */}
      <DataTable columns={columns} rows={data?.orders ?? []} isLoading={isLoading} />

      {/* Pagination */}
      <Pagination
        page={pagination?.page ?? page}
        totalPages={pagination?.totalPages ?? 1}
        limit={pagination?.limit ?? limit}
        onPageChange={(p) => setParams({ page: p })}
        onLimitChange={(l) => setParams({ limit: l, page: 1 })}
      />
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}
