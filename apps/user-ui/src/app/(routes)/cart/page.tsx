"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { ShoppingCart, Package } from "lucide-react";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTrackiong";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useStore from "apps/user-ui/src/store";
import { useUser } from "apps/user-ui/src/hooks/useUser";
import CartItem from "apps/user-ui/src/app/shared/components/cart/cart-item";
import CartSummary from "apps/user-ui/src/app/shared/components/cart/cart-summery";

const Cart = () => {
    const { user } = useUser();
    useLocationTracking();
    useDeviceTracking();

    const cart = useStore((state: any) => state.cart);
    const removeFromCart = useStore((state: any) => state.removeFromCart);
    const updateCartQuantity = useStore((state: any) => state.updateCartQuantity);

    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const subtotal: number = cart.reduce((acc: number, item: any) => {
        const price = item.sale_price ?? item.regular_price ?? 0;
        return acc + price * (item.quantity ?? 1);
    }, 0);


    const onQuantityChange = useCallback(
        (id: string, qty: number) => {
            updateCartQuantity(id, qty);
        },
        [updateCartQuantity]
    );

    const handleRemove = useCallback(
        (id: string) => {
            removeFromCart(id);
        },
        [removeFromCart]
    );

    const handleCheckout = async () => {
        if (!user) {
            // Redirect to login or show auth prompt
            window.location.href = "/login?redirect=/cart";
            return;
        }
        setCheckoutLoading(true);
        try {
            // Replace with real checkout logic (e.g., create order, redirect to payment)
            await new Promise((r) => setTimeout(r, 1200));
            window.location.href = "/checkout";
        } catch (err) {
            console.error("Checkout error:", err);
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                        <ShoppingCart size={24} className="text-violet-600" />
                        Your Cart
                        {cart.length > 0 && (
                            <span className="ml-1 text-base font-medium text-slate-400">
                                ({cart.length} item{cart.length !== 1 ? "s" : ""})
                            </span>
                        )}
                    </h1>
                </div>

                {cart.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Package size={32} className="text-slate-300" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-700 mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-sm text-slate-400 mb-6 max-w-xs">
                            Looks like you haven't added anything yet. Start shopping and find
                            something you love!
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                        >
                            <ShoppingCart size={16} />
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    /* Cart layout */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-3">
                            {cart.map((item: any) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onRemove={handleRemove}
                                    onQuantityChange={onQuantityChange}
                                />
                            ))}

                            {/* Clear cart hint */}
                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={() => cart.forEach((item: any) => removeFromCart(item.id))}
                                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    Clear all items
                                </button>
                            </div>
                        </div>

                        {/* Sticky Summary */}
                        <div className="lg:sticky lg:top-6">
                            <CartSummary
                                cart={cart}
                                subtotal={subtotal}
                                itemCount={cart.length}
                                onCheckout={handleCheckout}
                                checkoutLoading={checkoutLoading}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;