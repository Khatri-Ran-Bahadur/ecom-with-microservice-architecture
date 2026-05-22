"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    ShoppingCart,
    Tag,
    ChevronRight,
    Truck,
    ShieldCheck,
    RotateCcw,
    Loader2,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import useStore from "@/store";

interface CartSummaryProps {
    cart: any;
    subtotal: number;
    itemCount: number;
    onCheckout: () => void;
    checkoutLoading?: boolean;
}

const PERKS = [
    { icon: <Truck size={14} />, label: "Free delivery on orders over Rs. 2,000" },
    { icon: <ShieldCheck size={14} />, label: "Secure checkout guaranteed" },
    { icon: <RotateCcw size={14} />, label: "Easy returns within 7 days" },
];

const CartSummary = ({
    cart,
    subtotal,
    itemCount,
    onCheckout,
    checkoutLoading = false,
}: CartSummaryProps) => {
    const [coupon, setCoupon] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [storeCouponCode, setStoreCouponCode] = useState("");

    const { storeCoupon, coupon: storeCouponData } = useStore();

    useEffect(() => {
        if (storeCouponData) {
            setCoupon(storeCouponData.code || "");
            setCouponApplied(true);
            setDiscountAmount(storeCouponData.discountAmount || 0);
            setStoreCouponCode(storeCouponData.code || "");
        }
    }, [storeCouponData]);

    const shipping = subtotal >= 2000 ? 0 : 120;
    const total = subtotal - discountAmount + shipping;

    const handleApplyCoupon = async () => {
        if (!coupon.trim()) {
            setCouponError("Please enter a coupon code.");
            return;
        };
        setCouponLoading(true);
        setCouponError("");
        // Simulated coupon check — replace with real API call
        try {
            const response = await axiosInstance.put("/order/api/verify-coupon", {
                couponCode: coupon.trim(),
                cart: cart,
            });
            if (response.data.valid) {
                const newDiscountAmount = Number(response.data.discountAmount);
                const appliedCode = coupon.trim();

                setCouponApplied(true);
                setStoreCouponCode(appliedCode);
                setDiscountAmount(newDiscountAmount);
                storeCoupon({
                    code: appliedCode,
                    discount: response.data.discount,
                    discountAmount: newDiscountAmount,
                    discountPercentage: response.data.discount,
                    discountedProductId: response.data.discountProductId
                })
            } else {
                setDiscountAmount(0);
                setCouponError(response.data.message);
                storeCoupon(null);
            }
        } catch (error) {
            setDiscountAmount(0);
            setCouponError("Invalid or expired coupon code.");
            setCouponApplied(false);
            storeCoupon(null);
        }
        setCouponLoading(false);
    };

    const handleRemoveCoupon = () => {
        setCoupon("");
        setCouponApplied(false);
        setDiscountAmount(0);
        setStoreCouponCode("");
        storeCoupon(null);
        setCouponError("");
    };

    return (
        <div className="space-y-4">
            {/* Summary card */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                    <h2 className="text-sm font-semibold text-slate-800">Order Summary</h2>
                </div>

                <div className="p-5 space-y-3">
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                        <span className="font-medium text-slate-800">Rs. {subtotal.toLocaleString()}</span>
                    </div>

                    {discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                            <span>Discount ({storeCouponCode})</span>
                            <span className="font-medium">- Rs. {discountAmount.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Shipping</span>
                        {shipping === 0 ? (
                            <span className="font-medium text-emerald-600">Free</span>
                        ) : (
                            <span className="font-medium text-slate-800">Rs. {shipping.toLocaleString()}</span>
                        )}
                    </div>

                    {shipping > 0 && (
                        <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                            Add Rs. {(2000 - subtotal).toLocaleString()} more for free shipping
                        </p>
                    )}

                    <div className="border-t border-slate-100 pt-3 flex justify-between">
                        <span className="text-sm font-semibold text-slate-800">Total</span>
                        <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">Rs. {total.toLocaleString()}</p>
                            <p className="text-xs text-slate-400">VAT included</p>
                        </div>
                    </div>
                </div>

                {/* Coupon */}
                <div className="px-5 pb-5 space-y-2">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                        <Tag size={12} />
                        Coupon code
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={coupon}
                            onChange={(e) => { setCoupon(e.target.value); setCouponError(""); setCouponApplied(false); }}
                            placeholder="Enter code (try SAVE10)"
                            disabled={couponApplied}
                            className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                        />
                        <button
                            onClick={couponApplied ? handleRemoveCoupon : handleApplyCoupon}
                            disabled={couponLoading || (!couponApplied && !coupon.trim())}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                        >
                            {couponLoading ? <Loader2 size={13} className="animate-spin" /> : couponApplied ? "Remove" : "Apply"}
                        </button>
                    </div>
                    {couponApplied && (
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            ✓ Coupon applied successfully!
                        </p>
                    )}
                    {couponError && (
                        <p className="text-xs text-red-500">{couponError}</p>
                    )}
                </div>

                {/* Checkout button */}
                <div className="px-5 pb-5">
                    <button
                        onClick={onCheckout}
                        disabled={checkoutLoading || itemCount === 0}
                        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-xl transition-colors"
                    >
                        {checkoutLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                <ShoppingCart size={16} />
                                Proceed to Checkout
                                <ChevronRight size={15} />
                            </>
                        )}
                    </button>

                    <Link
                        href="/"
                        className="mt-3 w-full flex items-center justify-center text-sm text-slate-500 hover:text-violet-600 transition-colors"
                    >
                        ← Continue Shopping
                    </Link>
                </div>
            </div>

            {/* Perks */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                {PERKS.map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="text-emerald-500 flex-shrink-0">{icon}</span>
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CartSummary;