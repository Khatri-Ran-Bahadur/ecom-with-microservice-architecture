"use client";
import React, { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Search, SlidersHorizontal, X, RotateCcw, Store,
    Loader2, ChevronDown, ChevronUp, Filter, Globe, Tag,
    Star, Users, Sparkles,
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import ShopCard from "apps/user-ui/src/app/shared/components/cards/shop.card";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ShopFilterState {
    search: string;
    categories: string[];
    countries: string[];
    rating: number | null;
    page: number;
}

interface Shop {
    id: string;
    name: string;
    description?: string;
    avatar: string;
    coverBanner?: string;
    address?: string;
    followers?: any[];
    rating?: number;
    category?: string;
    country?: string;
}

interface ShopsResponse {
    shops: Shop[];
    total: number;
    totalPages: number;
    page: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const LIMIT = 1;

const SHOP_CATEGORIES = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Beauty",
    "Sports",
    "Books",
    "Toys",
    "Automotive",
    "Food & Grocery",
    "Health",
    "Jewelry",
    "Other",
];

// Common countries — extend as needed or fetch from API
const COUNTRIES = [
    "Nepal",
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "China",
    "Singapore",
    "Bangladesh",
    "Pakistan",
    "Sri Lanka",
    "UAE",
];

const SORT_OPTIONS = [
    { label: "Featured", value: "featured" },
    { label: "Top Rated", value: "rating" },
    { label: "Most Followers", value: "followers" },
    { label: "Newest", value: "newest" },
    { label: "A → Z", value: "name_asc" },
];

const DEFAULT_FILTERS: ShopFilterState = {
    search: "",
    categories: [],
    countries: [],
    rating: null,
    page: 1,
};

// ─── API ─────────────────────────────────────────────────────────────────────────

const fetchShopCategories = async (): Promise<string[]> => {
    const res = await axiosInstance.get("/products/api/get-categories");
    return res.data?.categories ?? [];
};

const fetchFilteredShops = async (
    filters: ShopFilterState,
    sortBy: string
): Promise<ShopsResponse> => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.categories.length) params.set("categories", filters.categories.join(","));
    if (filters.countries.length) params.set("countries", filters.countries.join(","));
    if (filters.rating) params.set("rating", String(filters.rating));
    params.set("sortBy", sortBy);
    params.set("page", String(filters.page));
    params.set("limit", String(LIMIT));
    const res = await axiosInstance.get(`/products/api/get-filtered-shops?${params.toString()}`);
    return res.data;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────

const filtersToQuery = (f: ShopFilterState, sortBy: string) => {
    const p = new URLSearchParams();
    if (f.search) p.set("search", f.search);
    if (f.categories.length) p.set("categories", f.categories.join(","));
    if (f.countries.length) p.set("countries", f.countries.join(","));
    if (f.rating) p.set("rating", String(f.rating));
    p.set("sortBy", sortBy);
    p.set("page", String(f.page));
    return p.toString();
};

// ─── Sub-components ───────────────────────────────────────────────────────────────

const FilterSection = ({
    title,
    icon,
    children,
    defaultOpen = true,
    badge,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: number;
}) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full py-3.5 group"
            >
                <span className="flex items-center gap-2">
                    <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                        {icon}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                        {title}
                    </span>
                    {!!badge && (
                        <span className="bg-indigo-600 text-white text-[9px] font-black min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center leading-none">
                            {badge}
                        </span>
                    )}
                </span>
                {open
                    ? <ChevronUp size={11} className="text-slate-300" />
                    : <ChevronDown size={11} className="text-slate-300" />}
            </button>
            {open && <div className="pb-4">{children}</div>}
        </div>
    );
};

const FilterPill = ({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-full leading-none">
        {label}
        <button onClick={onRemove} className="hover:text-indigo-900 ml-0.5">
            <X size={9} strokeWidth={3} />
        </button>
    </span>
);

const CheckItem = ({
    label,
    checked,
    onToggle,
    count,
}: {
    label: string;
    checked: boolean;
    onToggle: () => void;
    count?: number;
}) => (
    <div
        onClick={onToggle}
        className="flex items-center gap-2.5 py-1.5 cursor-pointer group"
    >
        <div
            className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all
                ${checked
                    ? "bg-indigo-600 border-indigo-600"
                    : "border-slate-200 group-hover:border-indigo-400"
                }`}
        >
            {checked && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
        <span className={`flex-1 text-[12px] select-none transition-colors leading-tight ${checked ? "font-semibold text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>
            {label}
        </span>
        {count !== undefined && (
            <span className="text-[10px] text-slate-400 font-medium">{count}</span>
        )}
    </div>
);

const ShopSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-100 animate-pulse overflow-hidden">
        <div className="h-28 bg-slate-100" />
        <div className="px-5 pt-10 pb-5 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-3/5" />
            <div className="h-3 bg-slate-100 rounded w-4/5" />
            <div className="h-3 bg-slate-100 rounded w-2/5" />
            <div className="border-t border-slate-100 my-2" />
            <div className="flex justify-between">
                <div className="h-3 bg-slate-100 rounded w-24" />
                <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
        </div>
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────────

const ShopsPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState<ShopFilterState>(() => ({
        search: searchParams.get("search") ?? "",
        categories: searchParams.get("categories")?.split(",").filter(Boolean) ?? [],
        countries: searchParams.get("countries")?.split(",").filter(Boolean) ?? [],
        rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : null,
        page: Number(searchParams.get("page") ?? 1),
    }));

    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") ?? "featured");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [catSearch, setCatSearch] = useState("");
    const [countrySearch, setCountrySearch] = useState("");
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // URL sync
    useEffect(() => {
        router.replace(`/shops?${filtersToQuery(filters, sortBy)}`, { scroll: false });
    }, [filters, sortBy]);

    const { data: shopsData, isLoading, isFetching } = useQuery<ShopsResponse>({
        queryKey: ["shops", filters, sortBy],
        queryFn: () => fetchFilteredShops(filters, sortBy),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

    const { data: shopCategories = [] } = useQuery<string[]>({
        queryKey: ["shopCategories"],
        queryFn: fetchShopCategories,
        staleTime: 1000 * 60 * 10,
    });

    const shops = shopsData?.shops ?? [];
    const total = shopsData?.total ?? 0;
    const totalPages = shopsData?.totalPages ?? 1;

    const isInitLoading = isLoading && !isFetching;

    // Helpers
    const setFilter = useCallback(<K extends keyof ShopFilterState>(key: K, val: ShopFilterState[K]) => {
        setFilters((f) => ({ ...f, [key]: val, page: key === "page" ? (val as number) : 1 }));
    }, []);

    const toggleArr = useCallback((key: "categories" | "countries", val: string) => {
        setFilters((f) => {
            const arr = f[key] as string[];
            return { ...f, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val], page: 1 };
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        setCatSearch("");
        setCountrySearch("");
    }, []);

    const handleSearch = (val: string) => {
        if (searchTimer.current !== null) {
            clearTimeout(searchTimer.current);
        }
        searchTimer.current = setTimeout(() => setFilter("search", val), 350);
    };

    // Active pills
    const pills: { label: string; remove: () => void }[] = [
        ...filters.search ? [{ label: `"${filters.search}"`, remove: () => setFilter("search", "") }] : [],
        ...filters.categories.map((c) => ({ label: c, remove: () => toggleArr("categories", c) })),
        ...filters.countries.map((c) => ({ label: c, remove: () => toggleArr("countries", c) })),
        ...filters.rating ? [{ label: `${filters.rating}★+`, remove: () => setFilter("rating", null) }] : [],
    ];

    const activeCount = pills.length;

    // Filtered lists for search inside sidebar
    const filteredCats = (shopCategories.length ? shopCategories : SHOP_CATEGORIES).filter((c) =>
        c.toLowerCase().includes(catSearch.toLowerCase())
    );
    const filteredCountries = COUNTRIES.filter((c) =>
        c.toLowerCase().includes(countrySearch.toLowerCase())
    );

    // Pagination
    const pageNumbers = (): (number | "...")[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | "...")[] = [1];
        if (filters.page > 3) pages.push("...");
        for (let i = Math.max(2, filters.page - 1); i <= Math.min(totalPages - 1, filters.page + 1); i++) pages.push(i);
        if (filters.page < totalPages - 2) pages.push("...");
        pages.push(totalPages);
        return pages;
    };

    // Sidebar JSX (shared between desktop and mobile)
    const SidebarContent = () => (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-1 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
                        <Filter size={13} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none">
                            Filters
                        </p>
                        {activeCount > 0 && (
                            <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">
                                {activeCount} active
                            </p>
                        )}
                    </div>
                </div>
                {activeCount > 0 && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-[10px] text-slate-400 font-bold hover:text-indigo-600 transition px-2 py-1.5 rounded-lg hover:bg-indigo-50"
                    >
                        <RotateCcw size={9} /> Reset
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Search */}
                <FilterSection title="Search" icon={<Search size={12} />} badge={filters.search ? 1 : 0}>
                    <div className="relative">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <input
                            type="text"
                            defaultValue={filters.search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search shops…"
                            className="w-full pl-8 pr-3 py-2.5 text-[12px] border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50 placeholder:text-slate-300 text-slate-700 font-medium"
                        />
                    </div>
                </FilterSection>

                {/* Categories */}
                <FilterSection
                    title="Category"
                    icon={<Tag size={12} />}
                    badge={filters.categories.length || undefined}
                >
                    {/* Mini search inside */}
                    <div className="relative mb-2.5">
                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <input
                            type="text"
                            value={catSearch}
                            onChange={(e) => setCatSearch(e.target.value)}
                            placeholder="Find category…"
                            className="w-full pl-7 pr-3 py-2 text-[11px] border border-slate-200 rounded-lg outline-none focus:border-indigo-300 transition bg-slate-50 placeholder:text-slate-300"
                        />
                    </div>
                    <div className="space-y-0.5 max-h-52 overflow-y-auto no-scrollbar pr-0.5">
                        {filteredCats.map((cat) => (
                            <CheckItem
                                key={cat}
                                label={cat}
                                checked={filters.categories.includes(cat)}
                                onToggle={() => toggleArr("categories", cat)}
                            />
                        ))}
                        {filteredCats.length === 0 && (
                            <p className="text-[11px] text-slate-400 italic py-2">No match</p>
                        )}
                    </div>
                </FilterSection>

                {/* Countries */}
                <FilterSection
                    title="Country"
                    icon={<Globe size={12} />}
                    badge={filters.countries.length || undefined}
                >
                    <div className="relative mb-2.5">
                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Find country…"
                            className="w-full pl-7 pr-3 py-2 text-[11px] border border-slate-200 rounded-lg outline-none focus:border-indigo-300 transition bg-slate-50 placeholder:text-slate-300"
                        />
                    </div>
                    <div className="space-y-0.5 max-h-52 overflow-y-auto no-scrollbar pr-0.5">
                        {filteredCountries.map((country) => (
                            <CheckItem
                                key={country}
                                label={country}
                                checked={filters.countries.includes(country)}
                                onToggle={() => toggleArr("countries", country)}
                            />
                        ))}
                        {filteredCountries.length === 0 && (
                            <p className="text-[11px] text-slate-400 italic py-2">No match</p>
                        )}
                    </div>
                </FilterSection>

                {/* Min Rating */}
                <FilterSection
                    title="Min Rating"
                    icon={<Star size={12} />}
                    badge={filters.rating ?? undefined}
                    defaultOpen={false}
                >
                    <div className="space-y-1">
                        {[5, 4, 3, 2].map((r) => (
                            <button
                                key={r}
                                onClick={() => setFilter("rating", filters.rating === r ? null : r)}
                                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl border transition
                                    ${filters.rating === r
                                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                                        : "border-transparent hover:bg-slate-50 text-slate-500 hover:border-slate-200"
                                    }`}
                            >
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            size={12}
                                            className={s <= r ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}
                                        />
                                    ))}
                                </div>
                                <span className="text-[11px] font-semibold">& above</span>
                            </button>
                        ))}
                    </div>
                </FilterSection>

                {/* Followers */}
                <FilterSection
                    title="Followers"
                    icon={<Users size={12} />}
                    defaultOpen={false}
                >
                    <div className="space-y-1">
                        {[
                            { label: "10k+ followers", value: "10000" },
                            { label: "5k+ followers", value: "5000" },
                            { label: "1k+ followers", value: "1000" },
                            { label: "Any", value: "" },
                        ].map(({ label, value }) => (
                            <label key={label} className="flex items-center gap-2.5 cursor-pointer group py-1.5">
                                <input
                                    type="radio"
                                    name="followers"
                                    value={value}
                                    className="accent-indigo-600 w-3.5 h-3.5"
                                />
                                <span className="text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors">
                                    {label}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/70">

            {/* ── Topbar ── */}
            <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
                <div className="w-[94%] xl:w-[88%] mx-auto py-3">
                    <div className="flex items-center gap-3 flex-wrap min-h-[42px]">

                        {/* Page title — desktop */}
                        <div className="hidden lg:flex items-center gap-2 mr-2">
                            <Store size={16} className="text-indigo-600" />
                            <span className="text-[13px] font-black text-slate-800 tracking-tight">Shops</span>
                        </div>

                        {/* Mobile filter button */}
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition"
                        >
                            <SlidersHorizontal size={13} />
                            Filters
                            {activeCount > 0 && (
                                <span className="bg-indigo-600 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                                    {activeCount}
                                </span>
                            )}
                        </button>

                        {/* Result count */}
                        <div className="text-[12px] text-slate-500">
                            {isFetching && !isInitLoading ? (
                                <span className="flex items-center gap-1.5 text-indigo-500 font-semibold">
                                    <Loader2 size={12} className="animate-spin" /> Updating…
                                </span>
                            ) : (
                                <>
                                    <span className="font-black text-slate-800">{total.toLocaleString()}</span>
                                    {" "}shop{total !== 1 ? "s" : ""}
                                </>
                            )}
                        </div>

                        {/* Active pills */}
                        {pills.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {pills.map((p, i) => (
                                    <FilterPill key={i} label={p.label} onRemove={p.remove} />
                                ))}
                                <button
                                    onClick={resetFilters}
                                    className="text-[10px] text-slate-400 hover:text-slate-700 underline underline-offset-2 transition font-semibold"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Sort */}
                        <div className="ml-auto relative">
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setFilter("page", 1); }}
                                className="appearance-none pl-3 pr-8 py-2 text-[12px] font-bold border border-slate-200 rounded-xl outline-none bg-white text-slate-700 hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition cursor-pointer"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="w-[94%] xl:w-[88%] mx-auto py-6 flex gap-6">

                {/* ── Desktop Sidebar ── */}
                <aside className="hidden lg:block w-72 shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-[57px] max-h-[calc(100vh-76px)] overflow-hidden flex flex-col">
                        <SidebarContent />
                    </div>
                </aside>

                {/* ── Mobile Drawer ── */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setDrawerOpen(false)}
                        />
                        <div className="absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-2xl flex flex-col">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                                        <Filter size={13} className="text-white" />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Filters</span>
                                </div>
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                <SidebarContent />
                            </div>
                            <div className="px-5 py-4 border-t border-slate-100">
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="w-full py-3 bg-indigo-600 text-white text-[13px] font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={14} />
                                    Show {total.toLocaleString()} Shops
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Shops Grid ── */}
                <div className="flex-1 min-w-0">
                    {isInitLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array.from({ length: LIMIT }).map((_, i) => <ShopSkeleton key={i} />)}
                        </div>
                    ) : shops.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-5">
                                <Store size={28} className="text-slate-300" />
                            </div>
                            <h3 className="text-[15px] font-bold text-slate-700 mb-1.5">No shops found</h3>
                            <p className="text-[13px] text-slate-400 mb-6">Try adjusting your filters</p>
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[12px] font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
                            >
                                <RotateCcw size={13} /> Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4  transition-opacity duration-200 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}>
                            {shops.map((shop: any) => (
                                <ShopCard key={shop.id} shop={shop} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isInitLoading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 mt-12 flex-wrap">
                            <button
                                disabled={filters.page <= 1}
                                onClick={() => setFilter("page", filters.page - 1)}
                                className="px-4 py-2 text-[12px] font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                ← Prev
                            </button>
                            {pageNumbers().map((p, i) =>
                                p === "..." ? (
                                    <span key={`e${i}`} className="px-1 text-slate-300 select-none">•••</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setFilter("page", p as number)}
                                        className={`w-9 h-9 rounded-xl text-[12px] font-bold transition border
                                            ${filters.page === p
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button
                                disabled={filters.page >= totalPages}
                                onClick={() => setFilter("page", filters.page + 1)}
                                className="px-4 py-2 text-[12px] font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ShopsPage = () => (
    <Suspense
        fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        }
    >
        <ShopsPageContent />
    </Suspense>
);

export default ShopsPage;