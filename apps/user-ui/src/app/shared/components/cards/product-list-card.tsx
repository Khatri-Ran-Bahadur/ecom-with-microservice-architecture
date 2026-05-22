"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Eye, Shield, Truck, Zap, MapPin } from "lucide-react";
import useStore from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTraking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTraking from "apps/user-ui/src/hooks/useDeviceTrackiong";

interface ProductListCardProps {
    data: any;
    onQuickView?: (data: any) => void;
}

const ProductListCard = ({ data, onQuickView }: ProductListCardProps) => {
    const [imgIdx, setImgIdx] = useState(0);

    const { user } = useUser();
    const location = useLocationTraking();
    const deviceInfo = useDeviceTraking();

    const addToWishlist = useStore((s: any) => s.addToWishlist);
    const removeFromWishlist = useStore((s: any) => s.removeFromWishlist);
    const isWishlist = useStore((s: any) => s.isWishlist(data));
    const addToCart = useStore((s: any) => s.addToCart);
    const removeFromCart = useStore((s: any) => s.removeFromCart);
    const isCart = useStore((s: any) => s.isCart(data));

    const images = data?.images || [];
    const discount =
        data?.regular_price && data?.sale_price
            ? Math.round(((data.regular_price - data.sale_price) / data.regular_price) * 100)
            : null;

    return (
        <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg
                        transition-all duration-300 flex flex-row overflow-hidden">

            {/* ── Image ── */}
            <div
                className="relative shrink-0 w-44 sm:w-52 md:w-60 bg-slate-50 overflow-hidden"
                onMouseEnter={() => { if (images[1]) setImgIdx(1); }}
                onMouseLeave={() => setImgIdx(0)}
            >
                {images[imgIdx]?.url ? (
                    <img
                        src={images[imgIdx].url}
                        alt={data?.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full min-h-[180px] flex items-center justify-center text-slate-200">
                        <ShoppingBag size={36} />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {discount && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
                            -{discount}%
                        </span>
                    )}
                    {data?.is_featured && (
                        <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Zap size={9} fill="currentColor" /> HOT
                        </span>
                    )}
                </div>

                {/* Wishlist over image */}
                <button
                    onClick={() =>
                        isWishlist
                            ? removeFromWishlist(data.id, user, location, deviceInfo)
                            : addToWishlist({ ...data }, user, location, deviceInfo)
                    }
                    className={`absolute top-3 right-3 w-8 h-8 rounded-xl border flex items-center justify-center shadow-sm transition-all
                        opacity-0 group-hover:opacity-100
                        ${isWishlist
                            ? "bg-rose-50 border-rose-200 text-rose-500"
                            : "bg-white border-slate-200 text-slate-400 hover:text-rose-500"
                        }`}
                >
                    <Heart size={14} fill={isWishlist ? "currentColor" : "none"} />
                </button>
            </div>

            {/* ── Content ── */}
            <div className="flex flex-col flex-1 p-5 min-w-0">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Category + Status */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
                                {data?.subCategory || data?.category}
                            </span>
                            {data?.brand && (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                    {data.brand}
                                </span>
                            )}
                            <div className={`flex items-center gap-1 ${data?.status === "Active" ? "text-emerald-500" : "text-red-500"}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${data?.status === "Active" ? "bg-emerald-500" : "bg-red-500"}`} />
                                <span className="text-[10px] font-bold uppercase">{data?.status}</span>
                            </div>
                        </div>

                        {/* Title */}
                        <Link href={`/product/${data?.slug}`}>
                            <h3 className="text-base font-extrabold text-slate-900 leading-snug hover:text-violet-600 transition-colors line-clamp-2">
                                {data?.title}
                            </h3>
                        </Link>

                        {/* Short description */}
                        {data?.short_description && (
                            <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {data.short_description}
                            </p>
                        )}
                    </div>

                    {/* Price block — desktop */}
                    <div className="hidden sm:flex flex-col items-end shrink-0 gap-1">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                            Rs. {(data?.sale_price || data?.regular_price)?.toLocaleString()}
                        </span>
                        {data?.sale_price && data?.regular_price && (
                            <>
                                <span className="text-xs text-slate-400 line-through">
                                    Rs. {data.regular_price.toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-emerald-500">
                                    Save Rs. {(data.regular_price - data.sale_price).toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Rating + sold */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                size={12}
                                className={s <= Math.round(data?.ratings || 0)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-200 fill-slate-200"}
                            />
                        ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{(data?.ratings || 0).toFixed(1)}</span>
                    <span className="text-xs text-slate-400">· {data?.totalSales || 0} sold</span>
                </div>

                {/* Colors + Sizes */}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {data?.colors?.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            {data.colors.slice(0, 6).map((c: string) => (
                                <div
                                    key={c}
                                    style={{ backgroundColor: c }}
                                    className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-slate-200"
                                />
                            ))}
                            {data.colors.length > 6 && (
                                <span className="text-[10px] text-slate-400">+{data.colors.length - 6}</span>
                            )}
                        </div>
                    )}
                    {data?.sizes?.length > 0 && (
                        <div className="flex items-center gap-1">
                            {data.sizes.slice(0, 5).map((s: string) => (
                                <span key={s} className="text-[10px] font-bold border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md">
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mini feature tags */}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {data?.warranty && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Shield size={11} className="text-emerald-400" />
                            {data.warranty}
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Truck size={11} className="text-blue-400" />
                        Fast Delivery
                    </div>
                    {data?.shop?.address && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin size={11} className="text-slate-400" />
                            {data.shop.address}
                        </div>
                    )}
                </div>

                {/* Mobile price */}
                <div className="flex items-center gap-2 mt-3 sm:hidden">
                    <span className="text-xl font-black text-slate-900">
                        Rs. {(data?.sale_price || data?.regular_price)?.toLocaleString()}
                    </span>
                    {data?.sale_price && (
                        <span className="text-xs text-slate-400 line-through">
                            Rs. {data.regular_price?.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* ── Actions row ── */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 flex-wrap">
                    {/* Add to Cart */}
                    <button
                        disabled={data?.stock === 0}
                        onClick={() =>
                            isCart
                                ? removeFromCart(data.id, user, location, deviceInfo)
                                : addToCart({ ...data, quantity: 1 }, user, location, deviceInfo)
                        }
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm
                            ${data?.stock === 0
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : isCart
                                    ? "bg-slate-800 text-white hover:bg-slate-700"
                                    : "bg-violet-600 text-white hover:bg-violet-700"
                            }`}
                    >
                        <ShoppingBag size={14} />
                        {data?.stock === 0 ? "Out of Stock" : isCart ? "Remove from Cart" : "Add to Cart"}
                    </button>

                    {/* Wishlist text button */}
                    <button
                        onClick={() =>
                            isWishlist
                                ? removeFromWishlist(data.id, user, location, deviceInfo)
                                : addToWishlist({ ...data }, user, location, deviceInfo)
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition
                            ${isWishlist
                                ? "border-rose-200 bg-rose-50 text-rose-500"
                                : "border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                            }`}
                    >
                        <Heart size={14} fill={isWishlist ? "currentColor" : "none"} />
                        {isWishlist ? "Wishlisted" : "Wishlist"}
                    </button>

                    {/* Quick View */}
                    {onQuickView && (
                        <button
                            onClick={() => onQuickView(data)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 transition"
                        >
                            <Eye size={14} />
                            Quick View
                        </button>
                    )}

                    {/* Stock indicator */}
                    <span className={`ml-auto text-xs font-semibold ${data?.stock > 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {data?.stock > 0 ? `${data.stock} in stock` : "Out of stock"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductListCard;