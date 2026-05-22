"use client";
import React from "react";
import useDeviceTraking from "apps/user-ui/src/hooks/useDeviceTrackiong";
import useLocationTraking from "apps/user-ui/src/hooks/useLocationTracking";
import useStore from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";

const WishlistPage = () => {
    const { user } = useUser();
    const location = useLocationTraking();
    const deviceInfo = useDeviceTraking();
    const wishlist = useStore((state: any) => state.wishlist);
    const addToCart = useStore((state: any) => state.addToCart);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);

    const discount = (item: any) =>
        item.regular_price && item.sale_price
            ? Math.round(((item.regular_price - item.sale_price) / item.regular_price) * 100)
            : null;

    return (
        <div className="w-full bg-slate-50 min-h-screen">
            <div className="w-[90%] md:w-[85%] max-w-screen-xl mx-auto py-8">

                {/* ── Breadcrumb + Title ── */}
                <div className="mb-8">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                        <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-800 font-medium">Wishlist</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                            <Heart size={18} className="text-red-500 fill-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
                            {wishlist.length > 0 && (
                                <p className="text-sm text-slate-500">{wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Empty State ── */}
                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 py-20 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                            <Heart size={36} className="text-red-300" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Your wishlist is empty</h2>
                            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                                Save items you love by clicking the heart icon on any product.
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="mt-2 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                        >
                            <ShoppingBag size={15} />
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* ── Product Grid ── */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {wishlist.map((item: any) => {
                                const off = discount(item);
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-200"
                                    >
                                        {/* Image */}
                                        <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden">
                                            <Image
                                                src={item.images?.[0]?.url || "/placeholder.jpg"}
                                                alt={item.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {off && (
                                                <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-lg">
                                                    -{off}%
                                                </div>
                                            )}
                                            {/* Remove button */}
                                            <button
                                                onClick={() => removeFromWishlist(item.id)}
                                                className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                                title="Remove from wishlist"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <Link href={`/product/${item.slug}`}>
                                                <h3 className="text-sm font-medium text-slate-800 line-clamp-2 hover:text-violet-600 transition-colors leading-snug">
                                                    {item.title}
                                                </h3>
                                            </Link>

                                            {item.brand && (
                                                <p className="text-xs text-slate-400 mt-0.5">{item.brand}</p>
                                            )}

                                            {/* Price */}
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <span className="text-base font-bold text-slate-900">
                                                    Rs. {(item.sale_price ?? item.regular_price)?.toLocaleString()}
                                                </span>
                                                {item.sale_price && item.regular_price && (
                                                    <span className="text-xs text-slate-400 line-through">
                                                        Rs. {item.regular_price?.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Stock */}
                                            {item.stock !== undefined && (
                                                <p className={`text-xs mt-1 font-medium ${item.stock === 0 ? "text-red-500" : item.stock <= 5 ? "text-amber-500" : "text-emerald-600"}`}>
                                                    {item.stock === 0 ? "Out of stock" : item.stock <= 5 ? `Only ${item.stock} left` : "In stock"}
                                                </p>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-3">
                                                <button
                                                    onClick={() => addToCart(item, user, location, deviceInfo)}
                                                    disabled={item.stock === 0}
                                                    className="flex-1 flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-xl transition-colors"
                                                >
                                                    <ShoppingCart size={13} />
                                                    {item.stock === 0 ? "Unavailable" : "Add to Cart"}
                                                </button>
                                                <button
                                                    onClick={() => removeFromWishlist(item.id)}
                                                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Summary Panel ── */}
                        <div className="lg:col-span-1 space-y-4 sticky top-6">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                                <h2 className="font-semibold text-slate-800 text-sm">Summary</h2>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Items saved</span>
                                        <span className="font-medium text-slate-800">{wishlist.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>In stock</span>
                                        <span className="font-medium text-emerald-600">
                                            {wishlist.filter((i: any) => i.stock > 0).length}
                                        </span>
                                    </div>
                                    {wishlist.some((i: any) => i.stock === 0) && (
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>Out of stock</span>
                                            <span className="font-medium text-red-500">
                                                {wishlist.filter((i: any) => i.stock === 0).length}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                    <div className="flex justify-between text-sm font-semibold text-slate-800">
                                        <span>Total value</span>
                                        <span>
                                            Rs.{" "}
                                            {wishlist
                                                .reduce((acc: number, i: any) => acc + (i.sale_price ?? i.regular_price ?? 0), 0)
                                                .toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Add all in-stock to cart */}
                                <button
                                    onClick={() =>
                                        wishlist
                                            .filter((i: any) => i.stock > 0)
                                            .forEach((i: any) => addToCart(i, user, location, deviceInfo))
                                    }
                                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-3 rounded-xl transition-colors"
                                >
                                    <ShoppingCart size={15} />
                                    Add All to Cart
                                </button>

                                <Link
                                    href="/"
                                    className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-violet-300 hover:text-violet-600 text-slate-600 text-sm font-medium py-2.5 rounded-xl transition-colors"
                                >
                                    Continue Shopping
                                    <ArrowRight size={14} />
                                </Link>
                            </div>

                            {/* Tip */}
                            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex gap-3">
                                <Heart size={16} className="text-violet-500 fill-violet-200 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-violet-700 leading-relaxed">
                                    Items in your wishlist are not reserved. Add them to your cart to secure your order.
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;