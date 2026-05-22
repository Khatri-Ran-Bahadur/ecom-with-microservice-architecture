"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Search,
    Heart,
    ShoppingCart,
    X,
    Clock,
    TrendingUp,
    ArrowUpRight,
    Loader2,
    Tag,
    Package,
} from "lucide-react";
import Image from "next/image";
import ProfileIcon from "../../../assets/svgs/profile-icon";
import HeaderBottom from "./header-bottom";
import { useUser } from "apps/user-ui/src/hooks/useUser";
import useStore from "apps/user-ui/src/store";
import axiosInstance from "../../../utils/axiosInstance";
import { useRouter } from "next/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────
const TRENDING_SEARCHES = [
    "Wireless Earbuds",
    "Running Shoes",
    "Laptop Stand",
    "Yoga Mat",
    "Sunglasses",
];
const MAX_HISTORY = 6;

// ─── Search History Hook ──────────────────────────────────────────────────────
const useSearchHistory = () => {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        try {
            if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
                const stored = JSON.parse(
                    localStorage.getItem("eshop_search_history") || "[]"
                );
                setHistory(stored);
            }
        } catch {
            setHistory([]);
        }
    }, []);

    const add = (query: string) => {
        setHistory((prev) => {
            const next = [query, ...prev.filter((h) => h !== query)].slice(
                0,
                MAX_HISTORY
            );
            if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
                localStorage.setItem("eshop_search_history", JSON.stringify(next));
            }
            return next;
        });
    };

    const remove = (query: string) => {
        setHistory((prev) => {
            const next = prev.filter((h) => h !== query);
            if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
                localStorage.setItem("eshop_search_history", JSON.stringify(next));
            }
            return next;
        });
    };

    const clear = () => {
        setHistory([]);
        if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
            localStorage.removeItem("eshop_search_history");
        }
    };

    return { history, add, remove, clear };
};

// ─── Highlight matching text ──────────────────────────────────────────────────
const HighlightText = ({
    text,
    query,
}: {
    text: string;
    query: string;
}) => {
    if (!query.trim()) return <span>{text}</span>;
    const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
    );
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark
                        key={i}
                        className="bg-violet-100 text-violet-700 rounded-sm not-italic font-semibold px-0.5"
                    >
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = () => {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const wishlist = useStore((state: any) => state.wishlist);
    const cart = useStore((state: any) => state.cart);

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const { history, add: addHistory, remove: removeHistory, clear: clearHistory } =
        useSearchHistory();

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // ── Fetch suggestions ──
    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSuggestions([]);
            setLoadingSuggestions(false);
            return;
        }
        setLoadingSuggestions(true);
        try {
            const res = await axiosInstance.get(
                `/products/api/get-all-products?search=${encodeURIComponent(query)}&limit=6`
            );
            setSuggestions(res.data.products || []);
        } catch {
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    }, []);

    // ── Debounce ──
    useEffect(() => {
        if (debounceRef.current !== null) {
            clearTimeout(debounceRef.current);
        }
        if (searchQuery.trim()) {
            debounceRef.current = setTimeout(
                () => fetchSuggestions(searchQuery),
                350
            );
        } else {
            setSuggestions([]);
            setLoadingSuggestions(false);
        }
        return () => {
            if (debounceRef.current !== null) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchQuery, fetchSuggestions]);

    // ── Close on outside click ──
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsDropdownOpen(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Submit search ──
    const handleSubmit = (query: string) => {
        if (!query.trim()) return;
        addHistory(query.trim());
        setIsDropdownOpen(false);
        setActiveIndex(-1);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    // ── Select a product ──
    const handleSelectProduct = (product: any) => {
        addHistory(product.title);
        setSearchQuery(product.title);
        setIsDropdownOpen(false);
        router.push(`/product/${product.slug}`);
    };

    // ── Keyboard nav ──
    const allNavigableItems = searchQuery.trim() ? suggestions : history;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isDropdownOpen) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, allNavigableItems.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, -1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && allNavigableItems[activeIndex]) {
                const item = allNavigableItems[activeIndex];
                if (searchQuery.trim() && (item as any).slug) {
                    handleSelectProduct(item);
                } else {
                    handleSubmit(typeof item === "string" ? item : (item as any).title);
                }
            } else {
                handleSubmit(searchQuery);
            }
        } else if (e.key === "Escape") {
            setIsDropdownOpen(false);
            setActiveIndex(-1);
            inputRef.current?.blur();
        }
    };

    const hasResults = suggestions.length > 0;
    const showNoResults =
        searchQuery.trim() && !loadingSuggestions && !hasResults;
    const showEmptyState = !searchQuery.trim();

    return (
        <div className="w-full bg-white sticky top-0 z-50 shadow-sm">
            <div className="w-[85%] max-w-screen-xl py-4 mx-auto flex items-center justify-between gap-8">

                {/* ── Logo ── */}
                <Link href="/" className="flex-shrink-0 select-none">
                    <span className="text-2xl font-semibold text-violet-700">E-</span>
                    <span className="text-2xl font-semibold text-slate-600">Shop</span>
                </Link>

                {/* ── Search ── */}
                <div ref={containerRef} className="flex-1 max-w-2xl relative">
                    {/* Input */}
                    <div
                        className={`flex items-center rounded-xl border-2 transition-all duration-150
              ${isDropdownOpen
                                ? "border-violet-500 rounded-b-none border-b-transparent"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        <div className="pl-4 flex items-center flex-shrink-0 text-slate-400">
                            {loadingSuggestions ? (
                                <Loader2 size={18} className="animate-spin text-violet-500" />
                            ) : (
                                <Search size={18} />
                            )}
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                                setActiveIndex(-1);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search products, brands, categories..."
                            className="flex-1 px-3 py-3 text-sm text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
                            autoComplete="off"
                            spellCheck={false}
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSuggestions([]);
                                    inputRef.current?.focus();
                                }}
                                className="mr-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => handleSubmit(searchQuery)}
                            className={`flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700
                active:bg-violet-800 text-white text-sm font-medium transition-colors flex-shrink-0
                ${isDropdownOpen ? "rounded-tr-[10px]" : "rounded-r-[10px]"}`}
                        >
                            <Search size={15} />
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </div>

                    {/* ── Dropdown panel ── */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 bg-white border-2 border-t-0 border-violet-500 rounded-b-xl z-50 overflow-hidden">

                            {/* Loading */}
                            {loadingSuggestions && (
                                <div className="flex items-center gap-3 px-4 py-3.5">
                                    <Loader2
                                        size={15}
                                        className="animate-spin text-violet-500 flex-shrink-0"
                                    />
                                    <span className="text-sm text-slate-500">
                                        Searching for&nbsp;
                                        <span className="font-medium text-slate-700">
                                            "{searchQuery}"
                                        </span>
                                        ...
                                    </span>
                                </div>
                            )}

                            {/* Results */}
                            {!loadingSuggestions && hasResults && (
                                <>
                                    <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            <Package size={11} />
                                            Products
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            {suggestions.length} results
                                        </span>
                                    </div>

                                    {suggestions.map((product, i) => (
                                        <button
                                            key={product.id || i}
                                            type="button"
                                            onClick={() => handleSelectProduct(product)}
                                            onMouseEnter={() => setActiveIndex(i)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${activeIndex === i ? "bg-violet-50" : "hover:bg-slate-50"}`}
                                        >
                                            {/* Thumb */}
                                            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {product.images?.[0]?.url ? (
                                                    <Image
                                                        src={product.images[0].url}
                                                        alt={product.title}
                                                        width={44}
                                                        height={44}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package size={18} className="text-slate-400" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-800 truncate">
                                                    <HighlightText
                                                        text={product.title}
                                                        query={searchQuery}
                                                    />
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                    {product.category && (
                                                        <span className="text-xs text-slate-400">
                                                            {product.category}
                                                        </span>
                                                    )}
                                                    {product.brand && (
                                                        <>
                                                            <span className="text-xs text-slate-300">·</span>
                                                            <span className="text-xs text-slate-400">
                                                                {product.brand}
                                                            </span>
                                                        </>
                                                    )}
                                                    {product.stock <= 5 && product.stock > 0 && (
                                                        <>
                                                            <span className="text-xs text-slate-300">·</span>
                                                            <span className="text-xs text-amber-500 font-medium">
                                                                Only {product.stock} left
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right flex-shrink-0">
                                                {product.sale_price ? (
                                                    <>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            Rs.{" "}
                                                            {product.sale_price.toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-slate-400 line-through">
                                                            Rs.{" "}
                                                            {product.regular_price?.toLocaleString()}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        Rs. {product.regular_price?.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            <ArrowUpRight
                                                size={14}
                                                className="text-slate-300 flex-shrink-0"
                                            />
                                        </button>
                                    ))}

                                    {/* View all */}
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(searchQuery)}
                                        className="w-full flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors"
                                    >
                                        <span>
                                            View all results for&nbsp;
                                            <span className="font-semibold">"{searchQuery}"</span>
                                        </span>
                                        <ArrowUpRight size={15} />
                                    </button>
                                </>
                            )}

                            {/* No results */}
                            {showNoResults && (
                                <div className="py-8 text-center">
                                    <Package
                                        size={32}
                                        className="mx-auto text-slate-200 mb-3"
                                    />
                                    <p className="text-sm font-medium text-slate-600">
                                        No products found
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Try a different keyword or browse categories
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(searchQuery)}
                                        className="mt-3 text-xs text-violet-600 hover:underline font-medium"
                                    >
                                        Search anyway →
                                    </button>
                                </div>
                            )}

                            {/* Empty state */}
                            {showEmptyState && (
                                <div className="py-2">
                                    {/* Recent searches */}
                                    {history.length > 0 && (
                                        <>
                                            <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                                                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                    <Clock size={11} />
                                                    Recent searches
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={clearHistory}
                                                    className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    Clear all
                                                </button>
                                            </div>

                                            {history.map((item, i) => (
                                                <div
                                                    key={item}
                                                    onMouseEnter={() => setActiveIndex(i)}
                                                    onClick={() => handleSubmit(item)}
                                                    className={`flex items-center gap-3 px-4 py-2.5 group cursor-pointer transition-colors
                            ${activeIndex === i ? "bg-slate-50" : "hover:bg-slate-50"}`}
                                                >
                                                    <Clock
                                                        size={14}
                                                        className="text-slate-400 flex-shrink-0"
                                                    />
                                                    <span className="flex-1 text-sm text-slate-700">
                                                        {item}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeHistory(item);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}

                                            <div className="mx-4 my-2 border-t border-slate-100" />
                                        </>
                                    )}

                                    {/* Trending */}
                                    <div>
                                        <div className="px-4 pt-2 pb-1.5">
                                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                <TrendingUp size={11} />
                                                Trending searches
                                            </span>
                                        </div>
                                        <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2">
                                            {TRENDING_SEARCHES.map((term) => (
                                                <button
                                                    key={term}
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchQuery(term);
                                                        setIsDropdownOpen(true);
                                                        fetchSuggestions(term);
                                                    }}
                                                    className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-violet-50 hover:text-violet-700 border border-slate-200 hover:border-violet-200 px-3 py-1.5 rounded-full transition-all"
                                                >
                                                    <Tag size={10} />
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right: User + Cart ── */}
                <div className="flex items-center gap-6 flex-shrink-0">
                    {/* User */}
                    <div className="flex items-center gap-2.5">
                        {!isLoading && user ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="w-10 h-10 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center text-sm font-semibold text-violet-700 hover:border-violet-400 transition-colors"
                                >
                                    {user.name?.charAt(0).toUpperCase()}
                                </Link>
                                <Link href="/profile" className="leading-tight">
                                    <span className="block text-xs text-slate-500">Hello,</span>
                                    <span className="block text-sm font-semibold text-slate-800">
                                        {user.name?.split(" ")[0]}
                                    </span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
                                >
                                    <ProfileIcon />
                                </Link>
                                <Link href="/login" className="leading-tight">
                                    <span className="block text-xs text-slate-500">Hello,</span>
                                    <span className="block text-sm font-semibold text-slate-800">
                                        {isLoading ? "..." : "Sign in"}
                                    </span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        className="relative p-1.5 text-slate-600 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                    >
                        <Heart size={24} />
                        {(wishlist?.length ?? 0) > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-semibold px-1">
                                {wishlist.length > 99 ? "99+" : wishlist.length}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        className="relative p-1.5 text-slate-600 hover:text-violet-600 transition-colors rounded-xl hover:bg-violet-50"
                    >
                        <ShoppingCart size={24} />
                        {(cart?.length ?? 0) > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-semibold px-1">
                                {cart.length > 99 ? "99+" : cart.length}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            <div className="border-t border-slate-100" />
            <HeaderBottom />
        </div>
    );
};

export default Header;