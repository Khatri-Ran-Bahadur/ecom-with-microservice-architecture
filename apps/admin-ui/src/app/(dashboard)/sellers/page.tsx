"use client";

import React, { useMemo, useState, Suspense } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column } from "../../../components/table/DataTable";
import { Pagination } from "../../../components/table/Pagination";
import { SearchInput } from "../../../components/table/SearchInput";
import { PackageSearch, Star, Store, Loader2 } from "lucide-react";
import { useAdminTheme } from "../../../context/AdminThemeContext";

type SellerRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  phone_number?: string | null;
  createdAt: string;
  shop?: {
    name: string;
    ratings?: number | null;
    category?: string | null;
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

function SellersContent() {
  const { q, page, limit, setParams } = useQueryState();
  const { accentClass } = useAdminTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["adminSellersList", { q, page, limit }],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/sellers", {
        params: { q, page, limit },
      });
      return res.data as {
        success: boolean;
        sellers: SellerRecord[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
    },
  });

  const columns = useMemo<Column<SellerRecord>[]>(
    () => [
      {
        key: "name",
        header: "Seller Info",
        render: (s) => (
          <div className="leading-tight">
            <div className="font-semibold text-slate-800 dark:text-white">{s.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{s.email}</div>
          </div>
        ),
      },
      {
        key: "shop",
        header: "Shop Details",
        render: (s) => {
          if (!s.shop) return <span className="text-slate-400 dark:text-slate-500 italic text-xs">No Shop Registered</span>;
          return (
            <div className="leading-tight space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{s.shop.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {s.shop.category && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide text-[9px]">
                    {s.shop.category}
                  </span>
                )}
                {s.shop.ratings !== undefined && s.shop.ratings !== null && (
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-bold text-[10px]">{Number(s.shop.ratings).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "phone",
        header: "Contact Phone",
        render: (s) => <span className="font-medium text-slate-700 dark:text-slate-300">{s.phone ?? s.phone_number ?? "—"}</span>,
      },
      {
        key: "date",
        header: "Registration Date",
        className: "whitespace-nowrap",
        render: (s) => (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(s.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
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
            Sellers
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 font-sans">
            Oversee and search registered sellers, shops, categories, and ratings performance.
          </p>
        </div>
      </div>

      {/* Filters & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={q}
          onChange={(v) => setParams({ q: v, page: 1 })}
          placeholder="Search by seller name, email, shop name…"
        />
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {pagination ? (
            <>
              <span className="text-slate-900 dark:text-white">{pagination.total}</span> registered sellers
            </>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Fetching…
            </span>
          )}
        </div>
      </div>

      {/* Sellers Data Table */}
      <DataTable columns={columns} rows={data?.sellers ?? []} isLoading={isLoading} />

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

export default function SellersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <SellersContent />
    </Suspense>
  );
}
