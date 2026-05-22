"use client";
import React, { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    SlidersHorizontal, Grid3X3, List, Search, ChevronDown,
    ChevronUp, ChevronRight, X, Star, RotateCcw, Package,
    Loader2, Filter, Sparkles,
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import ProductCard from "../../shared/components/cards/product-card";
import ProductListCard from "../../shared/components/cards/product-list-card";
import ProductDetailCard from "../../shared/components/cards/product-detail-card";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SubCategory {
    id: string;
    title: string;
    slug: string;
}

interface Category {
    id: string;
    title: string;
    slug: string;
    subCategories?: SubCategory[];
}

interface FilterState {
    search: string;
    categories: string[];
    subCategories: string[];
    priceMin: number;
    priceMax: number;
    rating: number | null;
    colors: string[];
    sizes: string[];
    inStockOnly: boolean;
    sortBy: string;
    page: number;
}

interface ProductsResponse {
    products: any[];
    total: number;
    totalPages: number;
    page: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
    { label: "Featured", value: "featured" },
    { label: "Price: Low → High", value: "price_asc" },
    { label: "Price: High → Low", value: "price_desc" },
    { label: "Best Rating", value: "rating" },
    { label: "Most Sold", value: "sales" },
    { label: "Newest First", value: "newest" },
];

const LIMIT = 12;
// ── Constants ────────────────────────────────────────────────────────────────

const defaultColors = [
    "#0F172A", "#FFFFFF", "#EF4444", "#22C55E",
    "#3B82F6", "#EAB308", "#A855F7", "#06B6D4",
    "#F97316", "#EC4899", "#64748B", "#10B981",
];

const defaultSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const PRICE_MAX = 10000;

const DEFAULT_FILTERS: FilterState = {
    search: "",
    categories: [],
    subCategories: [],
    priceMin: 0,
    priceMax: PRICE_MAX,
    rating: null,
    colors: [],
    sizes: [],
    inStockOnly: false,
    sortBy: "featured",
    page: 1,
};

// ─── API ────────────────────────────────────────────────────────────────────────

export const fetchCategories = async (): Promise<Category[]> => {
    const res = await axiosInstance.get("/products/api/get-categories");
    if (res.data?.tree && res.data.tree.length > 0) {
        return res.data.tree;
    }
    
    // Normalize: backend may return { categories: [...] } or flat array
    // Each category may have subCategories nested OR we derive from the known shape
    const raw = res.data?.categories ?? res.data ?? [];

    // If the API returns the shape described (categories + subCategories map),
    // convert to Category[] with nested subCategories
    if (res.data?.subCategories && !Array.isArray(res.data)) {
        const subMap: Record<string, string[]> = res.data.subCategories;
        return (res.data.categories as string[]).map((title: string, idx: number) => ({
            id: String(idx),
            title,
            // Use the actual title for the slug to match DB exactly, 
            // but keep it URL-safe if needed. For now, matching DB is priority.
            slug: title,
            subCategories: (subMap[title] ?? []).map((s: string, si: number) => ({
                id: `${idx}-${si}`,
                title: s,
                slug: s,
            })),
        }));
    }

    return raw;
};

export const fetchFilterOptions = async (): Promise<{ colors: string[]; sizes: string[] }> => {
    const res = await axiosInstance.get("/products/api/get-filter-options");
    return res.data ?? { colors: [], sizes: [] };
};

export const fetchFilteredProducts = async (filters: FilterState): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);

    if (filters.categories.length) params.set("categories", filters.categories.join(","));
    if (filters.subCategories.length) params.set("subCategories", filters.subCategories.join(","));

    // Send as priceRange: min,max for backend compatibility
    params.set("priceRange", `${filters.priceMin},${filters.priceMax}`);

    if (filters.rating) params.set("rating", String(filters.rating));
    if (filters.colors.length) params.set("colors", filters.colors.join(","));
    if (filters.sizes.length) params.set("sizes", filters.sizes.join(","));
    if (filters.inStockOnly) params.set("inStockOnly", "true");

    params.set("sortBy", filters.sortBy);
    params.set("page", String(filters.page));
    params.set("limit", String(LIMIT));

    const res = await axiosInstance.get(`/products/api/get-filtered-products?${params.toString()}`);
    return res.data;
};

const filtersToQuery = (f: FilterState): string => {
    const p = new URLSearchParams();
    if (f.search) p.set("search", f.search);

    if (f.categories.length) p.set("categories", f.categories.join(","));
    if (f.subCategories.length) p.set("subCategories", f.subCategories.join(","));

    // Consistent with fetchFilteredProducts
    p.set("priceRange", `${f.priceMin},${f.priceMax}`);

    if (f.rating) p.set("rating", String(f.rating));
    if (f.colors.length) p.set("colors", f.colors.join(","));
    if (f.sizes.length) p.set("sizes", f.sizes.join(","));
    if (f.inStockOnly) p.set("inStockOnly", "true");
    p.set("sortBy", f.sortBy);
    p.set("page", String(f.page));
    return p.toString();
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

/** Collapsible section with badge */
const FilterSection = ({
    title,
    children,
    defaultOpen = true,
    badge,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: number;
}) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors"
            >
                <span className="flex items-center gap-2">
                    {title}
                    {!!badge && (
                        <span className="bg-violet-600 text-white text-[9px] font-black min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center leading-none">
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

/** Active filter pill */
const FilterPill = ({ label, color, onRemove }: { label: string; color?: string; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-bold rounded-full leading-none">
        {color && (
            <span className="w-2.5 h-2.5 rounded-full border border-white ring-1 ring-violet-300 shrink-0" style={{ backgroundColor: color }} />
        )}
        {label}
        <button onClick={onRemove} className="hover:text-violet-900 ml-0.5 shrink-0">
            <X size={9} strokeWidth={3} />
        </button>
    </span>
);

/** Skeleton shimmer */
const Skeleton = ({ list = false }: { list?: boolean }) =>
    list ? (
        <div className="bg-white rounded-2xl border border-slate-100 h-44 animate-pulse flex overflow-hidden">
            <div className="w-56 bg-slate-100 shrink-0" />
            <div className="flex-1 p-5 space-y-3 pt-6">
                <div className="h-2 bg-slate-100 rounded w-1/4" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
        </div>
    ) : (
        <div className="bg-white rounded-2xl border border-slate-100 animate-pulse overflow-hidden">
            <div className="aspect-[4/3] bg-slate-100" />
            <div className="p-4 space-y-2.5">
                <div className="h-2 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-4/5" />
                <div className="h-3 bg-slate-100 rounded w-2/5 mt-1" />
                <div className="h-5 bg-slate-100 rounded w-1/3 mt-1" />
            </div>
        </div>
    );

/** Category row — supports nested subCategories recursively */
const CategoryRow = ({
    cat,
    selectedCategories,
    selectedSubCategories,
    onToggleCat,
    onToggleSub,
    level = 0,
}: {
    cat: Category;
    selectedCategories: string[];
    selectedSubCategories: string[];
    onToggleCat: (slug: string) => void;
    onToggleSub: (slug: string) => void;
    level?: number;
}) => {
    const hasSubs = !!(cat.subCategories?.length || (cat as any).children?.length);
    const subs = cat.subCategories || (cat as any).children || [];
    const isSel = level === 0 
        ? selectedCategories.includes(cat.slug) 
        : selectedSubCategories.includes(cat.slug);
    const [open, setOpen] = useState(isSel);

    // Keep state in sync if parent selection changes
    useEffect(() => {
        if (isSel) {
            setOpen(true);
        }
    }, [isSel]);

    const handleToggle = () => {
        if (level === 0) {
            onToggleCat(cat.slug);
        } else {
            onToggleSub(cat.slug);
        }
    };

    return (
        <div>
            <div 
                className="flex items-center gap-2.5 py-1.5 group cursor-pointer"
                style={{ paddingLeft: `${level * 12}px` }}
            >
                <div
                    onClick={handleToggle}
                    className={`w-3.5 h-3.5 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-all
                        ${isSel ? "bg-violet-600 border-violet-600" : "border-slate-200 group-hover:border-violet-400"}`}
                >
                    {isSel && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <span
                    onClick={handleToggle}
                    className={`flex-1 text-[13px] select-none transition-colors leading-tight ${isSel ? "font-semibold text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}
                >
                    {cat.title || (cat as any).name}
                </span>
                {hasSubs && (
                    <button
                        onClick={() => setOpen(!open)}
                        className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-violet-500 transition-colors shrink-0"
                    >
                        <ChevronRight size={12} className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
                    </button>
                )}
            </div>
            {hasSubs && open && (
                <div className="border-l border-violet-100 ml-1.5 pl-1.5 space-y-0.5 mb-1">
                    {subs.map((sub: any) => (
                        <CategoryRow
                            key={sub.id}
                            cat={sub}
                            selectedCategories={selectedCategories}
                            selectedSubCategories={selectedSubCategories}
                            onToggleCat={onToggleCat}
                            onToggleSub={onToggleSub}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/** Dual-thumb price slider */
const PriceSlider = ({
    value,
    onChange,
}: {
    value: [number, number];
    onChange: (v: [number, number]) => void;
}) => {
    const [lo, hi] = value;
    const loPct = (lo / PRICE_MAX) * 100;
    const hiPct = (hi / PRICE_MAX) * 100;

    return (
        <div className="space-y-4 pt-2">
            <div className="flex gap-2.5 px-1">
                {[
                    { label: "Min", val: lo, update: (v: number) => onChange([Math.min(v, hi - 50), hi]) },
                    { label: "Max", val: hi, update: (v: number) => onChange([lo, Math.max(v, lo + 50)]) },
                ].map(({ label, val, update }) => (
                    <div key={label} className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none font-semibold">₹</span>
                        <input
                            type="number"
                            value={val}
                            min={0}
                            max={PRICE_MAX}
                            onChange={(e) => update(Number(e.target.value))}
                            className="w-full pl-7 pr-2 py-2 text-[12px] font-bold border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition bg-slate-50 text-slate-800"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-300 pointer-events-none uppercase font-bold">{label}</span>
                    </div>
                ))}
            </div>
            {/* Track container with extra horizontal padding for the thumbs */}
            <div className="px-3">
                <div className="relative h-1.5 bg-slate-100 rounded-full select-none">
                    <div
                        className="absolute h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full"
                        style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
                    />
                    <input type="range" min={0} max={PRICE_MAX} value={lo}
                        onChange={(e) => { const v = Number(e.target.value); if (v < hi) onChange([v, hi]); }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto"
                        style={{ zIndex: lo > PRICE_MAX - 200 ? 5 : 3 }}
                    />
                    <input type="range" min={0} max={PRICE_MAX} value={hi}
                        onChange={(e) => { const v = Number(e.target.value); if (v > lo) onChange([lo, v]); }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto"
                        style={{ zIndex: 4 }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-violet-500 rounded-full shadow-md pointer-events-none ring-2 ring-violet-100"
                        style={{ left: `calc(${loPct}% - 8px)` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-violet-500 rounded-full shadow-md pointer-events-none ring-2 ring-violet-100"
                        style={{ left: `calc(${hiPct}% - 8px)` }} />
                </div>
            </div>
            <div className="flex justify-between px-2 text-[10px] text-slate-400 font-semibold">
                <span>₹0</span>
                <span>₹{PRICE_MAX.toLocaleString()}</span>
            </div>
        </div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────

const ProductsPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [quickViewData, setQuickViewData] = useState<any>(null);

    // Hydrate from URL
    const [filters, setFilters] = useState<FilterState>(() => ({
        search: searchParams.get("search") ?? "",
        categories: searchParams.get("categories")?.split(",").filter(Boolean) ?? [],
        subCategories: searchParams.get("subCategories")?.split(",").filter(Boolean) ?? [],
        priceMin: Number(searchParams.get("priceMin") ?? 0),
        priceMax: Number(searchParams.get("priceMax") ?? PRICE_MAX),
        rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : null,
        colors: searchParams.get("colors")?.split(",").filter(Boolean) ?? [],
        sizes: searchParams.get("sizes")?.split(",").filter(Boolean) ?? [],
        inStockOnly: searchParams.get("inStockOnly") === "true",
        sortBy: searchParams.get("sortBy") ?? "featured",
        page: Number(searchParams.get("page") ?? 1),
    }));

    const [priceRange, setPriceRange] = useState<[number, number]>([filters.priceMin, filters.priceMax]);
    const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        router.replace(`/products?${filtersToQuery(filters)}`, { scroll: false });
    }, [filters]);

    // ── Queries ──
    const { data: categories = [], isLoading: catsLoading } = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: 60 * 60 * 1000,
    });

    useQuery({
        queryKey: ["filterOptions"],
        queryFn: fetchFilterOptions,
        staleTime: 30 * 60 * 1000,
    });

    const { data: productsData, isLoading: productsLoading, isFetching } = useQuery<ProductsResponse>({
        queryKey: ["products", filters],
        queryFn: () => fetchFilteredProducts(filters),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

    const products = productsData?.products ?? [];
    const totalPages = productsData?.totalPages ?? 1;
    const total = productsData?.total ?? 0;

    // ── Filter helpers ──
    const setFilter = useCallback(<K extends keyof FilterState>(key: K, val: FilterState[K]) => {
        setFilters((f) => ({ ...f, [key]: val, page: key === "page" ? (val as number) : 1 }));
    }, []);

    const toggleArr = useCallback((key: "categories" | "subCategories" | "colors" | "sizes", val: string) => {
        setFilters((f) => {
            const arr = f[key] as string[];
            const isRemoving = arr.includes(val);
            const nextArr = isRemoving ? arr.filter((v) => v !== val) : [...arr, val];

            let nextCategories = f.categories;
            let nextSubCategories = f.subCategories;

            if (key === "categories") {
                nextCategories = nextArr;
                if (isRemoving) {
                    const parentCat = categories.find(c => c.slug === val);
                    if (parentCat?.subCategories) {
                        const subSlugs = parentCat.subCategories.map(s => s.slug);
                        nextSubCategories = nextSubCategories.filter(s => !subSlugs.includes(s));
                    }
                }
            } else if (key === "subCategories") {
                nextSubCategories = nextArr;
            } else {
                return { ...f, [key]: nextArr, page: 1 };
            }

            return {
                ...f,
                categories: nextCategories,
                subCategories: nextSubCategories,
                page: 1
            };
        });
    }, [categories]);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        setPriceRange([0, PRICE_MAX]);
    }, []);

    const handlePriceChange = (val: [number, number]) => {
        setPriceRange(val);
        if (priceTimer.current) clearTimeout(priceTimer.current);
        priceTimer.current = setTimeout(() => {
            setFilters((f) => ({ ...f, priceMin: val[0], priceMax: val[1], page: 1 }));
        }, 400);
    };

    const handleSearchInput = (val: string) => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setFilter("search", val), 350);
    };

    // ── Active filter pills ──
    const pills: { label: string; color?: string; remove: () => void }[] = [
        ...filters.search ? [{ label: `"${filters.search}"`, remove: () => setFilter("search", "") }] : [],
        ...filters.categories.map((c) => ({
            label: categories.find((cat) => cat.slug === c)?.title ?? c,
            remove: () => toggleArr("categories", c),
        })),
        ...filters.subCategories.map((s) => ({
            label: s.replace(/-/g, " "),
            remove: () => toggleArr("subCategories", s),
        })),
        ...filters.colors.map((c) => ({
            label: "Color",
            color: c,
            remove: () => toggleArr("colors", c),
        })),
        ...filters.sizes.map((s) => ({
            label: `Size: ${s}`,
            remove: () => toggleArr("sizes", s),
        })),
        ...filters.inStockOnly ? [{ label: "In Stock", remove: () => setFilter("inStockOnly", false) }] : [],
        ...filters.rating ? [{ label: `${filters.rating}★+`, remove: () => setFilter("rating", null) }] : [],
        ...(filters.priceMin > 0 || filters.priceMax < PRICE_MAX)
            ? [{ label: `₹${filters.priceMin.toLocaleString()}–${filters.priceMax.toLocaleString()}`, remove: () => { setFilter("priceMin", 0); setFilter("priceMax", PRICE_MAX); setPriceRange([0, PRICE_MAX]); } }]
            : [],
    ];

    // ── Pagination ──
    const pageNumbers = (): (number | "...")[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | "...")[] = [1];
        if (filters.page > 3) pages.push("...");
        for (let i = Math.max(2, filters.page - 1); i <= Math.min(totalPages - 1, filters.page + 1); i++) pages.push(i);
        if (filters.page < totalPages - 2) pages.push("...");
        pages.push(totalPages);
        return pages;
    };

    const isInitLoading = productsLoading && !isFetching;
    const activeFilterCount = pills.length;

    // ── Shared sidebar content ──
    const SidebarContent = () => (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-200">
                        <Filter size={13} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none">Filters</p>
                        {activeFilterCount > 0 && (
                            <p className="text-[10px] text-violet-500 font-semibold mt-0.5">{activeFilterCount} active</p>
                        )}
                    </div>
                </div>
                {activeFilterCount > 0 && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-[10px] text-slate-500 font-bold hover:text-violet-700 transition px-2.5 py-1.5 rounded-lg hover:bg-violet-50 border border-transparent hover:border-violet-100"
                    >
                        <RotateCcw size={9} /> Reset all
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-0">
                {/* Search */}
                <FilterSection title="Search" badge={filters.search ? 1 : 0}>
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <input
                            type="text"
                            defaultValue={filters.search}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder="Search products…"
                            className="w-full pl-9 pr-3 py-2.5 text-[12px] border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition bg-slate-50 placeholder:text-slate-300 text-slate-700 font-medium"
                        />
                    </div>
                </FilterSection>

                {/* Categories (dynamic) */}
                <FilterSection
                    title="Category"
                    badge={filters.categories.length + filters.subCategories.length || undefined}
                >
                    {catsLoading ? (
                        <div className="space-y-2.5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <div className="w-4 h-4 bg-slate-100 rounded-[4px] animate-pulse shrink-0" />
                                    <div className="h-3 bg-slate-100 rounded animate-pulse flex-1" style={{ width: `${55 + i * 10}%` }} />
                                </div>
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-[12px] text-slate-400 italic py-2">No categories found</p>
                    ) : (
                        <div className="space-y-0.5">
                            {categories.map((cat) => (
                                <CategoryRow
                                    key={cat.id}
                                    cat={cat}
                                    selectedCategories={filters.categories}
                                    selectedSubCategories={filters.subCategories}
                                    onToggleCat={(slug) => toggleArr("categories", slug)}
                                    onToggleSub={(slug) => toggleArr("subCategories", slug)}
                                />
                            ))}
                        </div>
                    )}
                </FilterSection>

                {/* Price */}
                <FilterSection
                    title="Price Range"
                    badge={(filters.priceMin > 0 || filters.priceMax < PRICE_MAX) ? 1 : undefined}
                >
                    <PriceSlider value={priceRange} onChange={handlePriceChange} />
                </FilterSection>

                {/* Rating */}
                <FilterSection title="Min Rating" badge={filters.rating ?? undefined}>
                    <div className="space-y-1">
                        {[5, 4, 3, 2].map((r) => (
                            <button
                                key={r}
                                onClick={() => setFilter("rating", filters.rating === r ? null : r)}
                                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl border transition text-[12px]
                                    ${filters.rating === r
                                        ? "border-violet-300 bg-violet-50 text-violet-700"
                                        : "border-transparent hover:bg-slate-50 text-slate-500 hover:border-slate-200"
                                    }`}
                            >
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={12} className={s <= r ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"} />
                                    ))}
                                </div>
                                <span className="font-semibold">& above</span>
                            </button>
                        ))}
                    </div>
                </FilterSection>

                {/* Colors */}
                <FilterSection title="Color" badge={filters.colors.length || undefined}>
                    <div className="flex flex-wrap gap-2.5">
                        {defaultColors.map((color) => (
                            <button
                                key={color}
                                onClick={() => toggleArr("colors", color)}
                                style={{ backgroundColor: color }}
                                title={color}
                                className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all relative
                                    ${color.toLowerCase() === "#ffffff" ? "border-slate-200" : "border-white"}
                                    ${filters.colors.includes(color)
                                        ? "ring-2 ring-violet-500 scale-110 shadow-md"
                                        : "hover:scale-110 hover:ring-2 hover:ring-slate-300"
                                    }`}
                            >
                                {filters.colors.includes(color) && (
                                    <div className={`absolute inset-0 flex items-center justify-center ${color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#eab308" ? "text-slate-800" : "text-white"}`}>
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </FilterSection>

                {/* Sizes */}
                <FilterSection title="Size" badge={filters.sizes.length || undefined}>
                    <div className="flex flex-wrap gap-2">
                        {defaultSizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => toggleArr("sizes", size)}
                                className={`min-w-[2.5rem] px-3 py-2 text-[11px] font-black rounded-xl border-2 transition
                                    ${filters.sizes.includes(size)
                                        ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </FilterSection>

                {/* Availability */}
                <FilterSection title="Availability" defaultOpen={false}>
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                        <div
                            onClick={() => setFilter("inStockOnly", !filters.inStockOnly)}
                            className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all
                                ${filters.inStockOnly ? "bg-violet-600 border-violet-600" : "border-slate-200 group-hover:border-violet-400"}`}
                        >
                            {filters.inStockOnly && (
                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="text-[13px] text-slate-600 group-hover:text-slate-900 transition-colors font-medium">In Stock Only</span>
                    </label>
                </FilterSection>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/70">

            {/* ── Sticky topbar ── */}
            <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
                <div className="w-[94%] xl:w-[88%] mx-auto py-3">
                    <div className="flex items-center gap-3 flex-wrap min-h-[42px]">

                        {/* Mobile: open filter drawer */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition"
                        >
                            <SlidersHorizontal size={13} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-violet-600 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Result count */}
                        <div className="text-[12px] text-slate-500">
                            {isFetching && !isInitLoading ? (
                                <span className="flex items-center gap-1.5 text-violet-500 font-semibold">
                                    <Loader2 size={12} className="animate-spin" />
                                    Updating…
                                </span>
                            ) : (
                                <>
                                    <span className="font-black text-slate-800">{total.toLocaleString()}</span>
                                    {" "}result{total !== 1 ? "s" : ""}
                                </>
                            )}
                        </div>

                        {/* Active pills */}
                        {pills.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {pills.map((p, i) => (
                                    <FilterPill key={i} label={p.label} color={p.color} onRemove={p.remove} />
                                ))}
                                <button
                                    onClick={resetFilters}
                                    className="text-[10px] text-slate-400 hover:text-slate-700 underline underline-offset-2 transition font-semibold"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Sort + View toggle */}
                        <div className="ml-auto flex items-center gap-2.5">
                            <div className="relative">
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilter("sortBy", e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 text-[12px] font-bold border border-slate-200 rounded-xl outline-none bg-white text-slate-700 hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition cursor-pointer"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`px-3 py-2 transition-colors ${viewMode === "grid" ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"}`}
                                >
                                    <Grid3X3 size={14} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"}`}
                                >
                                    <List size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="w-[94%] xl:w-[88%] mx-auto py-6 flex gap-6">

                {/* ── Desktop Sidebar — wider ── */}
                <aside className="hidden lg:block w-80 shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-[57px] max-h-[calc(100vh-76px)] overflow-hidden flex flex-col">
                        <SidebarContent />
                    </div>
                </aside>

                {/* ── Mobile Drawer ── */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-2xl flex flex-col">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                                        <Filter size={13} className="text-white" />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Filters</span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                <SidebarContent />
                            </div>
                            <div className="px-5 py-4 border-t border-slate-100 bg-white">
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="w-full py-3 bg-violet-600 text-white text-[13px] font-bold rounded-xl hover:bg-violet-700 transition shadow-sm shadow-violet-200 flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={14} />
                                    Show {total.toLocaleString()} Results
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Products area ── */}
                <div className="flex-1 min-w-0">
                    {isInitLoading ? (
                        viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {Array.from({ length: LIMIT }).map((_, i) => <Skeleton key={i} />)}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3.5">
                                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} list />)}
                            </div>
                        )
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-5">
                                <Package size={28} className="text-slate-300" />
                            </div>
                            <h3 className="text-[15px] font-bold text-slate-700 mb-1.5">No products found</h3>
                            <p className="text-[13px] text-slate-400 mb-6">Try adjusting or clearing your filters</p>
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-[12px] font-bold rounded-xl hover:bg-violet-700 transition shadow-sm shadow-violet-200"
                            >
                                <RotateCcw size={13} /> Reset Filters
                            </button>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 gap-4 transition-opacity duration-200 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}>
                            {products.map((p: any) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    ) : (
                        <div className={`flex flex-col gap-3.5 transition-opacity duration-200 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}>
                            {products.map((p: any) => (
                                <ProductListCard key={p.id} data={p} onQuickView={setQuickViewData} />
                            ))}
                        </div>
                    )}

                    {/* ── Pagination ── */}
                    {!isInitLoading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 mt-12 flex-wrap">
                            <button
                                disabled={filters.page <= 1}
                                onClick={() => setFilter("page", filters.page - 1)}
                                className="px-4 py-2 text-[12px] font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                ← Prev
                            </button>
                            {pageNumbers().map((p, i) =>
                                p === "..." ? (
                                    <span key={`e${i}`} className="px-1 text-slate-300 text-sm select-none">•••</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setFilter("page", p as number)}
                                        className={`w-9 h-9 rounded-xl text-[12px] font-bold transition border
                                            ${filters.page === p
                                                ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button
                                disabled={filters.page >= totalPages}
                                onClick={() => setFilter("page", filters.page + 1)}
                                className="px-4 py-2 text-[12px] font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick View Modal */}
            {quickViewData && (
                <ProductDetailCard data={quickViewData} setOpen={() => setQuickViewData(null)} />
            )}
        </div>
    );
};

const ProductsPage = () => (
    <Suspense
        fallback={
            <div className="min-h-screen bg-slate-50/70 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
            </div>
        }
    >
        <ProductsPageContent />
    </Suspense>
);

export default ProductsPage;