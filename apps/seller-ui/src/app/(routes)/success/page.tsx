"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const SuccessPage = () => {
    const router = useRouter()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Trigger entrance animation after mount
        const t = setTimeout(() => setVisible(true), 100)
        return () => clearTimeout(t)
    }, [])

    const steps = [
        { label: 'Seller account created', done: true },
        { label: 'Shop profile set up', done: true },
        { label: 'Bank account connected', done: true },
    ]

    const nextSteps = [
        {
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                </svg>
            ),
            title: 'Go to your dashboard',
            desc: 'Manage your shop, products and orders.',
            action: () => router.push('/seller/dashboard'),
            cta: 'Open dashboard',
            primary: true,
        },
        {
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            ),
            title: 'Add your first product',
            desc: 'Start listing items and reach customers.',
            action: () => router.push('/seller/products/new'),
            cta: 'Add product',
            primary: false,
        },
        {
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
            ),
            title: 'Complete your profile',
            desc: 'Add a logo and cover banner to build trust.',
            action: () => router.push('/seller/settings'),
            cta: 'Edit profile',
            primary: false,
        },
    ]

    return (
        <div
            className="w-full min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center px-4 py-12"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');

                @keyframes pop-in {
                    0%   { opacity: 0; transform: scale(0.6); }
                    70%  { transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes draw-circle {
                    from { stroke-dashoffset: 220; }
                    to   { stroke-dashoffset: 0; }
                }
                @keyframes draw-check {
                    from { stroke-dashoffset: 40; }
                    to   { stroke-dashoffset: 0; }
                }
                @keyframes pulse-ring {
                    0%   { transform: scale(1);   opacity: 0.4; }
                    100% { transform: scale(1.55); opacity: 0; }
                }

                .animate-pop-in   { animation: pop-in  0.55s cubic-bezier(.34,1.56,.64,1) both; }
                .animate-fade-up  { animation: fade-up 0.5s ease both; }
                .circle-path      { stroke-dasharray: 220; animation: draw-circle 0.7s ease 0.2s both; }
                .check-path       { stroke-dasharray: 40;  animation: draw-check  0.4s ease 0.85s both; }
                .pulse-ring       { animation: pulse-ring 1.4s ease-out 0.3s infinite; }
            `}</style>

            <div
                className="w-full max-w-[480px] bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden"
                style={{
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            >
                {/* ── Green top band ── */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#378ADD] via-[#34c57a] to-[#378ADD]" />

                <div className="px-10 pt-10 pb-8 flex flex-col items-center">

                    {/* ── Animated checkmark ── */}
                    <div className="relative flex items-center justify-center mb-7">
                        {/* pulse rings */}
                        <div className="absolute w-[88px] h-[88px] rounded-full border-2 border-[#34c57a]/30 pulse-ring" />
                        <div className="absolute w-[88px] h-[88px] rounded-full border-2 border-[#34c57a]/20 pulse-ring" style={{ animationDelay: '0.4s' }} />

                        <div className="animate-pop-in">
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                {/* background circle */}
                                <circle cx="40" cy="40" r="38" fill="#F0FDF6" />
                                {/* animated border */}
                                <circle
                                    cx="40" cy="40" r="35"
                                    stroke="#34c57a" strokeWidth="2.5"
                                    fill="none"
                                    strokeLinecap="round"
                                    className="circle-path"
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
                                />
                                {/* animated checkmark */}
                                <path
                                    d="M25 41L36 52L55 30"
                                    stroke="#34c57a" strokeWidth="3.5"
                                    strokeLinecap="round" strokeLinejoin="round"
                                    fill="none"
                                    className="check-path"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* ── Heading ── */}
                    <div className="animate-fade-up text-center mb-1" style={{ animationDelay: '0.5s' }}>
                        <h1
                            className="text-[28px] text-black leading-tight"
                            style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
                        >
                            You&apos;re all set!
                        </h1>
                    </div>

                    <div className="animate-fade-up text-center mb-7" style={{ animationDelay: '0.6s' }}>
                        <p className="text-sm text-[#888] leading-relaxed">
                            Your Stripe account has been connected successfully.<br />
                            Your shop is live and ready to receive payouts.
                        </p>
                    </div>

                    {/* ── Completed steps ── */}
                    <div
                        className="animate-fade-up w-full rounded-xl border border-black/[0.07] bg-[#FAFAFA] divide-y divide-black/[0.05] mb-7"
                        style={{ animationDelay: '0.65s' }}
                    >
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-5 h-5 rounded-full bg-[#34c57a]/15 flex items-center justify-center flex-shrink-0">
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6.5L5 9.5L10 3" stroke="#34c57a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-sm text-[#555]">{step.label}</span>
                                <span className="ml-auto text-xs font-medium text-[#34c57a]">Done</span>
                            </div>
                        ))}
                    </div>

                    {/* ── Stripe badge ── */}
                    <div
                        className="animate-fade-up flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F6F9FF] border border-[#D6E8FF] w-full mb-8"
                        style={{ animationDelay: '0.7s' }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span className="text-xs text-[#378ADD] font-medium">
                            Payouts secured &amp; encrypted by Stripe
                        </span>
                        <svg className="ml-auto" width="28" height="12" viewBox="0 0 60 25" fill="none">
                            <text x="0" y="19" fontFamily="Arial" fontWeight="700" fontSize="20" fill="#635BFF">stripe</text>
                        </svg>
                    </div>

                    {/* ── Next steps ── */}
                    <div className="animate-fade-up w-full" style={{ animationDelay: '0.75s' }}>
                        <p className="text-xs font-medium text-[#aaa] uppercase tracking-widest mb-3">What&apos;s next</p>
                        <div className="space-y-2.5">
                            {nextSteps.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={item.action}
                                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-left transition-all active:scale-[0.985]
                                        ${item.primary
                                            ? 'bg-[#378ADD] border-[#378ADD] hover:bg-[#185FA5] text-white'
                                            : 'bg-white border-black/10 hover:border-[#378ADD]/40 hover:bg-[#F6F9FF] text-black'
                                        }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${item.primary ? 'bg-white/15 text-white' : 'bg-[#EBF4FF] text-[#378ADD]'}`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium leading-tight ${item.primary ? 'text-white' : 'text-black'}`}>
                                            {item.title}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${item.primary ? 'text-white/70' : 'text-[#888]'}`}>
                                            {item.desc}
                                        </p>
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke={item.primary ? 'white' : '#aaa'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className="flex-shrink-0">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* ── Footer ── */}
                <div className="px-10 pb-6 text-center">
                    <p className="text-xs text-[#ccc]">
                        Need help?{' '}
                        <a href="mailto:support@eshop.com" className="text-[#378ADD] hover:underline">
                            Contact support
                        </a>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default SuccessPage