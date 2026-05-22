"use client";
import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface CheckoutFormProps {
    clientSecret: string;
    sessionId: string;
    onSuccess: () => void;
    cartItems: any[];
    coupon: any;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, cartItems, coupon, sessionId, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Redirecting is handled by success callback or standard Stripe redirect
                return_url: `${window.location.origin}/order-confirmation?session_id=${sessionId}`,
            },
            redirect: "if_required",
        });

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred.");
            toast.error(error.message || "Payment failed");
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            toast.success("Payment successful!");
            onSuccess();
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                        <CreditCard className="text-violet-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Card Information</h3>
                        <p className="text-[11px] text-slate-400 font-medium">Secure payment processed by Stripe</p>
                    </div>
                </div>

                <PaymentElement
                    options={{
                        layout: "tabs",
                    }}
                />

                {errorMessage && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
                        {errorMessage}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium px-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                Your transaction is secured with 256-bit encryption
            </div>

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200 flex items-center justify-center gap-3"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing Payment...
                    </>
                ) : (
                    "Complete Order"
                )}
            </button>
        </form>
    );
};

export default CheckoutForm;
