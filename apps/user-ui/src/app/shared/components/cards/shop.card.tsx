"use client";
import React from "react";
import Link from "next/link";
import { MapPin, Star, Users, ChevronRight, ShoppingBag, BadgeCheck } from "lucide-react";

interface ShopCardProps {
    shop: {
        id: string;
        name: string;
        description?: string;
        avatar: string;
        coverBanner?: string;
        address?: string;
        followers?: any[];
        rating?: number;
        category?: string;
    };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
    const rating = shop.rating ?? 0;
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const followerCount = shop.followers?.length ?? 0;

    const formatFollowers = (n: number) =>
        n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

    return (
        <Link
            href={`/shop/${shop.id}`}
            className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300"
        >
            {/* Cover banner */}
            <div className="relative h-28 overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-100 to-slate-200">
                {shop.coverBanner ? (
                    <img
                        src={shop.coverBanner}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    /* Decorative fallback pattern */
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-indigo-100/60" />
                        <div className="absolute -bottom-6 -left-4 w-40 h-40 rounded-full bg-slate-200/60" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-indigo-50/80" />
                    </div>
                )}

                {/* Category badge */}
                {shop.category && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-indigo-700 px-2.5 py-1 rounded-full shadow-sm border border-white/60">
                        <ShoppingBag size={9} />
                        {shop.category}
                    </span>
                )}

                {/* Avatar — overlapping the banner bottom */}
                <div className="absolute -bottom-7 left-5">
                    <div className="relative w-14 h-14 rounded-2xl border-[3px] border-white shadow-lg overflow-hidden bg-white">
                        <img
                            src={shop.avatar || "https://placehold.co/56x56?text=S"}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="pt-10 px-5 pb-5">
                {/* Name row */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-[14px] font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                            {shop.name}
                        </h3>
                        <BadgeCheck size={14} className="text-indigo-500 shrink-0" />
                    </div>
                    <ChevronRight
                        size={15}
                        className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5"
                    />
                </div>

                {/* Description */}
                {shop.description && (
                    <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {shop.description}
                    </p>
                )}

                {/* Address */}
                {shop.address && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="text-[11px] text-slate-400 truncate">{shop.address}</span>
                    </div>
                )}

                {/* Divider */}
                <div className="border-t border-slate-100 my-3" />

                {/* Stats row */}
                <div className="flex items-center justify-between">
                    {/* Stars */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={11}
                                    className={
                                        s <= fullStars
                                            ? "fill-amber-400 text-amber-400"
                                            : s === fullStars + 1 && hasHalf
                                                ? "fill-amber-200 text-amber-300"
                                                : "fill-slate-100 text-slate-200"
                                    }
                                />
                            ))}
                        </div>
                        {rating > 0 && (
                            <span className="text-[11px] font-bold text-slate-700">
                                {rating.toFixed(1)}
                            </span>
                        )}
                    </div>

                    {/* Followers */}
                    <div className="flex items-center gap-1 text-slate-500">
                        <Users size={11} className="text-slate-400" />
                        <span className="text-[11px] font-semibold">
                            {formatFollowers(followerCount)}
                        </span>
                        <span className="text-[10px] text-slate-400">followers</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ShopCard;