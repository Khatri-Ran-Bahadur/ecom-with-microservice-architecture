"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Eye, Heart, ShoppingBag, Star, Zap } from "lucide-react";
import useStore from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTraking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTraking from "apps/user-ui/src/hooks/useDeviceTrackiong";

interface ProductGridCardProps {
    data: any;
    onQuickView?: (data: any) => void;
}

const ProductGridCard = ({ data: product, onQuickView }: ProductGridCardProps) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [hovered, setHovered] = useState(false);

    const { user } = useUser();
    const location = useLocationTraking();
    const deviceInfo = useDeviceTraking();

    const addToWishlist = useStore((state: any) => state.addToWishlist);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
    const isWishlist = useStore((state: any) => state.isWishlist(product));
    const addToCart = useStore((state: any) => state.addToCart);
    const removeFromCart = useStore((state: any) => state.removeFromCart);
    const isCart = useStore((state: any) => state.isCart(product));

    const discountPct =
        product?.regular_price && product?.sale_price
            ? Math.round(
                ((product.regular_price - product.sale_price) /
                    product.regular_price) *
                100
            )
            : null;

    const rating = product?.ratings ?? 0;
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-300 flex flex-col"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* ── Image container ── */}
            <div className="relative overflow-hidden bg-slate-50 aspect-[4/3]">
                <Link href={`/product/${product?.slug}`}>
                    <img
                        src={
                            product?.images?.[0]?.url ||
                            "https://placehold.co/400x300?text=No+Image"
                        }
                        alt={product?.title}
                        onLoad={() => setImgLoaded(true)}
                        className={`w-full h-full object-cover transition-all duration-500 ${hovered ? "scale-110" : "scale-100"
                            } ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                    />
                </Link>

                {/* Skeleton shimmer while loading */}
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {discountPct && discountPct > 0 && (
                        <span className="flex items-center gap-1 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            <Zap size={8} className="fill-white" />
                            {discountPct}% OFF
                        </span>
                    )}
                    {product?.stock <= 5 && product?.stock > 0 && (
                        <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            Only {product.stock} left
                        </span>
                    )}
                    {product?.stock === 0 && (
                        <span className="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            Sold Out
                        </span>
                    )}
                </div>

                {/* Action buttons — slide in on hover */}
                <div
                    className={`absolute top-3 right-3 flex flex-col gap-2 z-10 transition-all duration-300 ${hovered
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-4"
                        }`}
                >
                    {/* Wishlist */}
                    <button
                        onClick={() =>
                            isWishlist
                                ? removeFromWishlist(product.id, user, location, deviceInfo)
                                : addToWishlist({ ...product }, user, location, deviceInfo)
                        }
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${isWishlist
                                ? "bg-rose-500 text-white"
                                : "bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-500"
                            }`}
                        title="Add to Wishlist"
                    >
                        <Heart
                            size={15}
                            className={isWishlist ? "fill-white" : ""}
                        />
                    </button>

                    {/* Quick view */}
                    <button
                        onClick={() => onQuickView?.(product)}
                        className="w-8 h-8 rounded-full bg-white text-slate-500 hover:bg-violet-50 hover:text-violet-600 flex items-center justify-center shadow-md transition-all duration-200"
                        title="Quick View"
                    >
                        <Eye size={15} />
                    </button>

                    {/* Add to cart */}
                    <button
                        onClick={() =>
                            isCart
                                ? removeFromCart(product.id, user, location, deviceInfo)
                                : addToCart({ ...product }, user, location, deviceInfo)
                        }
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${isCart
                                ? "bg-violet-600 text-white"
                                : "bg-white text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                            }`}
                        title={isCart ? "Remove from Cart" : "Add to Cart"}
                    >
                        <ShoppingBag size={15} />
                    </button>
                </div>

                {/* Quick-add bar — slides up from bottom on hover */}
                <div
                    className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                        }`}
                >
                    <button
                        onClick={() =>
                            isCart
                                ? removeFromCart(product.id, user, location, deviceInfo)
                                : addToCart({ ...product }, user, location, deviceInfo)
                        }
                        className={`w-full py-2.5 text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 ${isCart
                                ? "bg-violet-700 text-white"
                                : "bg-violet-600 hover:bg-violet-700 text-white"
                            }`}
                    >
                        <ShoppingBag size={13} />
                        {isCart ? "Remove from Cart" : "Add to Cart"}
                    </button>
                </div>
            </div>

            {/* ── Card body ── */}
            <div className="flex flex-col flex-1 p-4 gap-2">
                {/* Shop name */}
                <Link
                    href={`/shop/${product?.shop?.id}`}
                    className="text-[11px] font-semibold text-violet-500 hover:text-violet-700 transition-colors leading-none tracking-wide truncate"
                >
                    {product?.shop?.name ?? "Unknown Shop"}
                </Link>

                {/* Title */}
                <Link href={`/product/${product?.slug}`} className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug hover:text-violet-700 transition-colors">
                        {product?.title}
                    </h3>
                </Link>

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
                    <span className="text-[11px] text-slate-400 font-medium">
                        ({product?.totalSales ?? 0} sold)
                    </span>
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-slate-900">
                            ₹{product?.sale_price?.toLocaleString()}
                        </span>
                        {product?.regular_price && (
                            <span className="text-xs text-slate-400 line-through">
                                ₹{product?.regular_price?.toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Inline wishlist for easy access on mobile */}
                    <button
                        onClick={() =>
                            isWishlist
                                ? removeFromWishlist(product.id, user, location, deviceInfo)
                                : addToWishlist({ ...product }, user, location, deviceInfo)
                        }
                        className={`lg:hidden w-7 h-7 rounded-full flex items-center justify-center transition ${isWishlist
                                ? "bg-rose-100 text-rose-500"
                                : "bg-slate-100 text-slate-400"
                            }`}
                    >
                        <Heart
                            size={13}
                            className={isWishlist ? "fill-rose-500" : ""}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductGridCard;