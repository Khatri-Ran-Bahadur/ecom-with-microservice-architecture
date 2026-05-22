"use client";

import React, { useMemo } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column } from "../../../components/table/DataTable";
import { Pagination } from "../../../components/table/Pagination";
import { SearchInput } from "../../../components/table/SearchInput";
import { PackageSearch } from "lucide-react";

type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  subCategory: string;
  stock: number;
  sale_price: number;
  totalSales: number;
  shop?: { name?: string | null } | null;
  createdAt: string;
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

export default function AdminProductsPage() {
  const { q, page, limit, setParams } = useQueryState();

  const { data, isLoading } = useQuery({
    queryKey: ["adminProducts", { q, page, limit }],
    queryFn: async () => {
      const res = await axiosInstance.get("/products/api/admin/products", {
        params: { q, page, limit },
      });
      return res.data as { products: AdminProduct[]; pagination: { total: number; page: number; limit: number; totalPages: number } };
    },
  });

  const columns = useMemo<Column<AdminProduct>[]>(
    () => [
      {
        key: "title",
        header: "Product",
        render: (p) => (
          <div className="leading-tight">
            <div className="font-semibold text-slate-900 dark:text-white">{p.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">/{p.slug}</div>
          </div>
        ),
      },
      {
        key: "shop",
        header: "Shop",
        render: (p) => p.shop?.name ?? "—",
      },
      {
        key: "category",
        header: "Category",
        render: (p) => (
          <span className="text-sm">
            {p.category}
            {p.subCategory ? <span className="text-slate-400"> / {p.subCategory}</span> : null}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "whitespace-nowrap",
        render: (p) => (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            {p.status}
          </span>
        ),
      },
      {
        key: "stock",
        header: "Stock",
        className: "whitespace-nowrap",
        render: (p) => <span className="font-semibold">{p.stock}</span>,
      },
      {
        key: "price",
        header: "Price",
        className: "whitespace-nowrap",
        render: (p) => <span className="font-semibold">${Number(p.sale_price ?? 0).toFixed(2)}</span>,
      },
    ],
    []
  );

  const meta = data?.pagination;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Products
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Search and manage products across all shops.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={q} onChange={(v) => setParams({ q: v, page: 1 })} placeholder="Search products by title, slug, tags…" />
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

      <DataTable columns={columns} rows={data?.products ?? []} isLoading={isLoading} />

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

