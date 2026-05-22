"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import useStore from "apps/user-ui/src/store";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import AddressSelector from "./address-selector";
import CheckoutForm from "./checkout-form";
import {
    ChevronLeft,
    ShoppingBag,
    CreditCard,
    MapPin,
    ArrowRight,
    Loader2
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

const CheckoutContent = () => {
    const { cart } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSessionId = searchParams.get("sessionId");

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Address, 2: Payment
    const [cartItems, setCartItems] = useState<Array<any>>([]);
    const { coupon } = useStore();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const createPaymentSession = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.post("/order/api/create-payment-session", {
                cart,
                selectedAddressId,
                coupon: coupon
            })
            const sessionId = res.data.sessionId;
            router.push(`/checkout?sessionId=${sessionId}`);
        } catch (err: any) {
            console.log(err);
            toast.error("Failed to create payment session" + err);
        } finally {
            setLoading(false);
        }
    };
    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.sale_price * (item.quantity || 1), 0);
    }, [cart]);

    const shippingFee = subtotal >= 2000 ? 0 : 120;
    const totalAmount = subtotal + shippingFee;

    // Fetch Client Secret when sessionId is present in URL
    useEffect(() => {
        const initializePayment = async () => {
            if (urlSessionId) {
                try {
                    setLoading(true);
                    setSessionId(urlSessionId);

                    const verifyRes = await axiosInstance.get(`/order/api/verifying-payment-session?sessionId=${urlSessionId}`);
                    console.log(verifyRes.data)
                    const { totalAmount, sellers, cart, coupon } = verifyRes.data.session;

                    if (!sellers || sellers.length === 0 || totalAmount === undefined || totalAmount === null || cart.length === 0) {
                        throw new Error("Invalid payment session data.");
                    }

                    setCartItems(cart);
                    const sellerStripeAccountId = sellers[0].stripeAccountId;


                    const intentRes = await axiosInstance.post("/order/api/create-payment-intent", {
                        amount: coupon?.discountAmount ? totalAmount - coupon.discountAmount : totalAmount,
                        sellerStripeAccountId: sellerStripeAccountId,
                        sessionId: urlSessionId
                    });

                    setClientSecret(intentRes.data.clientSecret);
                    setStep(2); // Automatically move to payment step
                } catch (err: any) {
                    console.error("Payment initialization error:", err);
                    toast.error("Failed to initialize payment form");
                } finally {
                    setLoading(false);
                }
            }
        };

        if (urlSessionId && cart.length > 0) {
            initializePayment();
        }
    }, [urlSessionId, cart, totalAmount]);

    //
    const appearance: Appearance = {
        theme: "stripe",
    }


    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="text-slate-300" size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h2>
                <p className="text-slate-500 mb-8 text-center max-w-xs font-medium">Add some items to your cart before proceeding to checkout.</p>
                <Link
                    href="/products"
                    className="h-12 px-8 bg-violet-600 text-white rounded-2xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-violet-100"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-10">
            <div className="w-[94%] xl:w-[80%] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/cart" className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                            <ChevronLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Secure Transaction</p>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? "text-violet-600" : "text-slate-300"}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${step >= 1 ? "border-violet-600 bg-violet-50" : "border-slate-200"}`}>1</div>
                            <span className="text-xs font-bold uppercase tracking-wider">Shipping</span>
                        </div>
                        <div className="w-8 h-px bg-slate-200" />
                        <div className={`flex items-center gap-2 ${step >= 2 ? "text-violet-600" : "text-slate-300"}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${step >= 2 ? "border-violet-600 bg-violet-50" : "border-slate-200"}`}>2</div>
                            <span className="text-xs font-bold uppercase tracking-wider">Payment</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Flow */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Shipping Address */}
                        <div className={`bg-white rounded-3xl border ${step === 1 ? "border-violet-200 shadow-xl shadow-slate-200/50" : "border-slate-100 opacity-60"} transition-all duration-300 overflow-hidden`}>
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${step === 1 ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                                        <MapPin size={16} />
                                    </div>
                                    <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">Shipping Address</h2>
                                </div>
                                {step > 1 && (
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-xs font-bold text-violet-600 hover:underline"
                                    >
                                        Change
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                {step === 1 ? (
                                    <div className="space-y-6">
                                        <AddressSelector
                                            selectedAddressId={selectedAddressId}
                                            onSelect={setSelectedAddressId}
                                        />
                                        <button
                                            onClick={createPaymentSession}
                                            disabled={!selectedAddressId || loading}
                                            className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    Continue to Payment
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-xs font-medium text-slate-600">
                                        Address selected and verified.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Payment */}
                        <div className={`bg-white rounded-3xl border ${step === 2 ? "border-violet-200 shadow-xl shadow-slate-200/50" : "border-slate-100"} transition-all duration-300 overflow-hidden`}>
                            <div className="p-6 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${step === 2 ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                                        <CreditCard size={16} />
                                    </div>
                                    <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">Payment Method</h2>
                                </div>
                            </div>

                            <div className="p-6">
                                {step === 2 && clientSecret && sessionId ? (
                                    <Elements
                                        stripe={stripePromise}
                                        options={{ clientSecret, appearance }}
                                    >
                                        <CheckoutForm
                                            clientSecret={clientSecret}
                                            sessionId={sessionId}
                                            cartItems={cartItems}
                                            coupon={coupon}
                                            onSuccess={() => {
                                                router.push(`/order-confirmation?session_id=${sessionId}`);
                                            }}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="flex items-center gap-3 py-4 text-slate-400">
                                        <div className="w-10 h-6 bg-slate-50 rounded" />
                                        <p className="text-xs font-bold uppercase tracking-wider">Select shipping address first</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 sticky top-24 shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 mb-6">Order Summary</h2>

                            {/* Items Preview */}
                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden">
                                            <img src={item.images?.[0]?.url || ""} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{item.title}</p>
                                            <p className="text-[11px] text-slate-400 font-medium">Qty: {item.quantity}</p>
                                            <p className="text-[13px] font-black text-slate-900 mt-1">Rs. {item.sale_price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <div className="flex justify-between text-sm text-slate-500 font-medium">
                                    <span>Subtotal</span>
                                    <span>Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                {isHydrated && coupon && Number(coupon.discountAmount) > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                        <span>Discount ({coupon.code})</span>
                                        <span>- Rs. {Number(coupon.discountAmount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-slate-500 font-medium">
                                    <span>Shipping</span>
                                    {shippingFee === 0 ? (
                                        <span className="text-emerald-500">Free</span>
                                    ) : (
                                        <span>Rs. {shippingFee.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="pt-4 flex justify-between items-end border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Amount</p>
                                        <p className="text-2xl font-black text-slate-900">
                                            Rs. {(isHydrated && coupon?.discountAmount ? totalAmount - Number(coupon.discountAmount) : totalAmount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50/50 py-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-violet-600" size={40} />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
};

export default CheckoutPage;