"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, Package } from "lucide-react";

interface CartItemProps {
    item: any;
    onRemove: (id: string) => void;
    onQuantityChange: (id: string, qty: number) => void;
}

const CartItem = ({ item, onRemove, onQuantityChange }: CartItemProps) => {
    const discount =
        item.regular_price && item.sale_price
            ? Math.round(((item.regular_price - item.sale_price) / item.regular_price) * 100)
            : null;

    const qty = item.quantity ?? 1;

    return (
        <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group">
            {/* Image */}
            <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    {item.images?.[0]?.url ? (
                        <Image
                            src={item.images[0].url}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-slate-300" />
                        </div>
                    )}
                    {discount && (
                        <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                            -{discount}%
                        </span>
                    )}
                </div>
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                <div>
                    <Link href={`/product/${item.slug}`}>
                        <h3 className="text-sm font-medium text-slate-800 line-clamp-2 hover:text-violet-600 transition-colors leading-snug">
                            {item.title}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.brand && (
                            <span className="text-xs text-slate-400">{item.brand}</span>
                        )}
                        {item.selectedOptions?.color && (
                            <>
                                <span className="text-xs text-slate-300">·</span>
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <span
                                        className="w-4 h-4 rounded-full border border-slate-200 inline-block"
                                        style={{ backgroundColor: item.selectedOptions?.color }}
                                    />
                                    {item.selectedOptions?.color}
                                </span>
                            </>
                        )}
                        {item.selectedOptions?.size && (
                            <>
                                <span className="text-xs text-slate-300">·</span>
                                <span className="text-xs text-slate-500">Size: {item.selectedOptions?.size}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => onQuantityChange(item.id, Math.max(1, qty - 1))}
                            disabled={qty <= 1}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm font-medium text-slate-800 select-none">
                            {qty}
                        </span>
                        <button
                            onClick={() => onQuantityChange(item.id, Math.min(item.stock ?? 99, qty + 1))}
                            disabled={qty >= (item.stock ?? 99)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus size={13} />
                        </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                        <p className="text-base font-bold text-slate-900">
                            <span className="text-sm">
                                Rs.{" "}
                                {(item.sale_price ?? item.regular_price ?? 0).toLocaleString()}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Remove */}
            <button
                onClick={() => onRemove(item.id)}
                className="flex-shrink-0 self-start p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                title="Remove item"
            >
                <Trash2 size={15} />
            </button>
        </div>
    );
};

export default CartItem;