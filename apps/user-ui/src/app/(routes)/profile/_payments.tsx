import React from 'react'
import { CreditCard, Plus, MoreHorizontal, CheckCircle2 } from 'lucide-react'

const PaymentMethods = () => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <CreditCard size={16} className="text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-black text-slate-800 leading-tight">Payment Methods</h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Manage your saved cards and billing options</p>
                    </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-colors">
                    <Plus size={14} />
                    Add New
                </button>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Card */}
                    <div className="relative p-5 rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden group cursor-pointer">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                        
                        <div className="relative flex items-start justify-between mb-8">
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full w-fit">
                                    <CheckCircle2 size={10} /> Default
                                </span>
                            </div>
                            <div className="w-10 h-6 bg-white/20 rounded backdrop-blur-sm flex items-center justify-center">
                                {/* Visa Logo Placeholder */}
                                <span className="text-[10px] font-black italic text-white">VISA</span>
                            </div>
                        </div>

                        <div className="relative">
                            <p className="text-[16px] font-black text-white tracking-[0.2em] mb-1">
                                **** **** **** 4242
                            </p>
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] text-slate-400 font-medium tracking-wider">
                                    EXPIRES 12/28
                                </p>
                                <button className="text-slate-400 hover:text-white transition-colors p-1">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Card */}
                    <div className="relative p-5 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden group cursor-pointer hover:border-slate-300 transition-colors">
                        <div className="relative flex items-start justify-between mb-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full w-fit">
                                    Secondary
                                </span>
                            </div>
                            <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center">
                                {/* Mastercard Logo Placeholder */}
                                <div className="flex items-center -space-x-1">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/80 mix-blend-multiply"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80 mix-blend-multiply"></div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <p className="text-[16px] font-black text-slate-700 tracking-[0.2em] mb-1">
                                **** **** **** 5531
                            </p>
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] text-slate-400 font-medium tracking-wider">
                                    EXPIRES 08/26
                                </p>
                                <button className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-blue-700">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CreditCard size={12} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[12px] font-bold mb-0.5">Secure Payments</p>
                        <p className="text-[11px] opacity-80 leading-relaxed">
                            Your payment information is encrypted and securely stored by Stripe. We never store your full credit card number on our servers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaymentMethods