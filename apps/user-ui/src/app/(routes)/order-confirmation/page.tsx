"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import useStore from "apps/user-ui/src/store";

const OrderConfirmationContent = () => {
    const searchParams = useSearchParams();
    const { clearCart } = useStore();
    const sessionId = searchParams.get("session_id");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your payment...");
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId || verificationAttempted.current) return;

            verificationAttempted.current = true;
            try {
                    setStatus("success");
                    setMessage("Your order has been placed successfully!");
                    clearCart();
            } catch (error: any) {
                console.error("Verification error:", error);
                setStatus("error");
                setMessage(error.response?.data?.message || "Something went wrong during verification.");
            }
        };

        verifyPayment();
    }, [sessionId, clearCart]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-10 shadow-2xl shadow-slate-200/50 text-center">

                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6">
                            <Loader2 className="animate-spin text-violet-600" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Processing</h2>
                        <p className="text-slate-500 font-medium">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="text-emerald-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Order Confirmed!</h2>
                        <p className="text-slate-500 font-medium mb-8">{message}</p>

                        <div className="flex flex-col w-full gap-3">
                            <Link
                                href="/profile?tab=orders"
                                className="h-12 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98]"
                            >
                                View My Orders
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/"
                                className="h-12 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center justify-center hover:bg-slate-50 transition-all active:scale-[0.98]"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="text-red-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Failed</h2>
                        <p className="text-slate-500 font-medium mb-8">{message}</p>

                        <Link
                            href="/checkout"
                            className="w-full h-12 bg-violet-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-all active:scale-[0.98]"
                        >
                            Try Again
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

const OrderConfirmationPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <Loader2 className="animate-spin text-violet-600" size={40} />
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
};

export default OrderConfirmationPage;
