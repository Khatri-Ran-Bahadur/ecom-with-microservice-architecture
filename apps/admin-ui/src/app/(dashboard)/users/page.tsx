"use client";

import React, { useMemo, Suspense } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column } from "../../../components/table/DataTable";
import { Pagination } from "../../../components/table/Pagination";
import { SearchInput } from "../../../components/table/SearchInput";
import { Users, Shield, MapPin, Loader2, User } from "lucide-react";
import { useAdminTheme } from "../../../context/AdminThemeContext";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string; // "ADMIN" | "SELLER" | "USER"
  createdAt: string;
  avatar?: { url?: string | null } | null;
  _count: {
    addresses: number;
  };
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

function UsersContent() {
  const { q, page, limit, setParams } = useQueryState();
  const { accentClass } = useAdminTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsersList", { q, page, limit }],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/users", {
        params: { q, page, limit },
      });
      return res.data as {
        success: boolean;
        users: UserRecord[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
    },
  });

  const columns = useMemo<Column<UserRecord>[]>(
    () => [
      {
        key: "avatar",
        header: "User",
        render: (u) => {
          return (
            <div className="flex items-center gap-3">
              {u.avatar?.url ? (
                <img
                  src={u.avatar.url}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200/50 dark:border-slate-800/50 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50 text-slate-500 shrink-0">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <div className="leading-tight">
                <div className="font-semibold text-slate-800 dark:text-white">{u.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: "role",
        header: "Role Status",
        render: (u) => {
          const role = (u.role || "USER").toUpperCase();
          if (role === "ADMIN") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30">
                <Shield className="w-3 h-3 fill-current" />
                <span>Admin</span>
              </span>
            );
          }
          if (role === "SELLER") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30">
                <span>Seller</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-350 border border-slate-200/30 dark:border-slate-850">
              <span>Customer</span>
            </span>
          );
        },
      },
      {
        key: "addresses",
        header: "Addresses",
        render: (u) => {
          const count = u._count?.addresses ?? 0;
          return (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-slate-450 shrink-0" />
              <span>{count} {count === 1 ? "address" : "addresses"}</span>
            </div>
          );
        },
      },
      {
        key: "date",
        header: "Registered On",
        className: "whitespace-nowrap",
        render: (u) => (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(u.createdAt).toLocaleDateString(undefined, {
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
            Users
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 font-sans">
            Search registered users, verify administrator and merchant accounts, and monitor user addresses.
          </p>
        </div>
      </div>

      {/* Filters & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={q}
          onChange={(v) => setParams({ q: v, page: 1 })}
          placeholder="Search users by name, email…"
        />
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {pagination ? (
            <>
              <span className="text-slate-900 dark:text-white">{pagination.total}</span> registered users
            </>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Fetching…
            </span>
          )}
        </div>
      </div>

      {/* Users Data Table */}
      <DataTable columns={columns} rows={data?.users ?? []} isLoading={isLoading} />

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

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
