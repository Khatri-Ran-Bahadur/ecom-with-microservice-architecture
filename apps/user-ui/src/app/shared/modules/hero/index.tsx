"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroSlide {
    id: number
    eyebrow: string
    title: string
    titleAccent: string
    offerPrefix: string
    offerHighlight: string
    offerSuffix: string
    cta: string
    ctaHref: string
    badge: string
    bgFrom: string
    bgVia: string
    bgTo: string
    accentColor: string
    // Replace these string values with real image paths e.g. "/images/hero-watch.png"
    productImage: string | null
}

// ─── Slide Data ───────────────────────────────────────────────────────────────
// Set productImage to a real path like "/images/hero-watch.png" for production.
// Currently uses inline SVG illustration as fallback.

const slides: HeroSlide[] = [
    {
        id: 1,
        eyebrow: 'Starting from $40',
        title: 'The Best Watch',
        titleAccent: 'Collection 2025',
        offerPrefix: 'Exclusive offer ',
        offerHighlight: '10% off',
        offerSuffix: ' this week.',
        cta: 'Shop Now',
        ctaHref: '/products',
        badge: 'New Arrival',
        bgFrom: '#0c5460',
        bgVia: '#0a4550',
        bgTo: '#062e38',
        accentColor: '#f6c64e',
        productImage: null,
    },
    {
        id: 2,
        eyebrow: 'Limited stock available',
        title: 'Premium Audio',
        titleAccent: 'Experience 2025',
        offerPrefix: 'Save up to ',
        offerHighlight: '20% off',
        offerSuffix: ' this weekend.',
        cta: 'Explore Now',
        ctaHref: '/products?category=audio',
        badge: 'Hot Deal',
        bgFrom: '#1a0e40',
        bgVia: '#130b30',
        bgTo: '#0b0620',
        accentColor: '#a78bfa',
        productImage: null,
    },
    {
        id: 3,
        eyebrow: 'Flash sale — ends soon',
        title: 'Next-Gen',
        titleAccent: 'Smartphones',
        offerPrefix: 'Up to ',
        offerHighlight: '30% off',
        offerSuffix: ' today only.',
        cta: 'Buy Now',
        ctaHref: '/products?category=phones',
        badge: 'Flash Sale',
        bgFrom: '#083d2e',
        bgVia: '#052518',
        bgTo: '#021510',
        accentColor: '#34d399',
        productImage: null,
    },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconArrow = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
)

const IconChevronLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
)

const IconChevronRight = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
    </svg>
)

// ─── Watch SVG Illustrations ──────────────────────────────────────────────────
// Swap WatchIllustration with a real <Image> when productImage is available.

const Watch1 = () => (
    <svg viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Strap top */}
        <rect x="78" y="0" width="64" height="48" rx="12" fill="#7dd3fc" />
        {/* Strap bottom */}
        <rect x="78" y="232" width="64" height="48" rx="12" fill="#7dd3fc" />
        {/* Case */}
        <rect x="14" y="44" width="192" height="192" rx="44" fill="#111827" />
        {/* Screen bezel */}
        <rect x="24" y="54" width="172" height="172" rx="36" fill="#1e293b" />
        {/* Screen face */}
        <circle cx="110" cy="140" r="72" fill="#0f172a" />
        {/* Clock text */}
        <text x="110" y="122" textAnchor="middle" fill="#94a3b8" fontSize="14"
            fontFamily="'Courier New', monospace" fontWeight="500">MON 12</text>
        <text x="110" y="155" textAnchor="middle" fill="#ffffff" fontSize="32"
            fontFamily="'Courier New', monospace" fontWeight="700">09:30</text>
        <text x="110" y="176" textAnchor="middle" fill="#475569" fontSize="11"
            fontFamily="'Courier New', monospace">Digital Watch</text>
        {/* Crown button */}
        <rect x="206" y="112" width="10" height="26" rx="5" fill="#334155" />
    </svg>
)

const Watch2 = ({ accentColor }: { accentColor: string }) => (
    <svg viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Strap top */}
        <rect x="78" y="0" width="64" height="48" rx="12" fill="#86efac" />
        {/* Strap bottom */}
        <rect x="78" y="232" width="64" height="48" rx="12" fill="#86efac" />
        {/* Case */}
        <rect x="14" y="44" width="192" height="192" rx="44" fill="#111827" />
        {/* Screen bezel */}
        <rect x="24" y="54" width="172" height="172" rx="36" fill="#1e293b" />
        {/* Screen face */}
        <circle cx="110" cy="140" r="72" fill="#0f172a" />
        {/* Activity rings */}
        <circle cx="110" cy="140" r="52" fill="none" stroke="#1e293b" strokeWidth="11" />
        <circle cx="110" cy="140" r="52" fill="none" stroke={accentColor} strokeWidth="11"
            strokeDasharray="220 110" strokeDashoffset="-20" strokeLinecap="round" />
        <circle cx="110" cy="140" r="36" fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx="110" cy="140" r="36" fill="none" stroke="#22d3ee" strokeWidth="10"
            strokeDasharray="155 75" strokeDashoffset="-10" strokeLinecap="round" />
        <circle cx="110" cy="140" r="20" fill="none" stroke="#1e293b" strokeWidth="9" />
        <circle cx="110" cy="140" r="20" fill="none" stroke="#f472b6" strokeWidth="9"
            strokeDasharray="90 40" strokeDashoffset="-5" strokeLinecap="round" />
        {/* Time text top-right corner style */}
        <text x="148" y="108" textAnchor="middle" fill="#ffffff" fontSize="22"
            fontFamily="'Courier New', monospace" fontWeight="700">02</text>
        <text x="148" y="132" textAnchor="middle" fill="#ffffff" fontSize="22"
            fontFamily="'Courier New', monospace" fontWeight="700">50</text>
        {/* Crown button */}
        <rect x="206" y="112" width="10" height="26" rx="5" fill="#334155" />
    </svg>
)

const ProductVisual = ({ slide }: { slide: HeroSlide }) => {
    // If you have a real image path, use Next Image:
    // if (slide.productImage) {
    //   return (
    //     <div className="relative w-full h-full">
    //       <Image src={slide.productImage} alt={slide.titleAccent} fill
    //         className="object-contain drop-shadow-2xl" priority />
    //     </div>
    //   )
    // }

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Back watch — positioned top-right, rotated */}
            <div
                className="absolute"
                style={{
                    width: '42%',
                    right: '2%',
                    top: '-4%',
                    transform: 'rotate(-14deg)',
                    filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))',
                }}
            >
                <Watch1 />
            </div>

            {/* Front watch — positioned center-left, rotated opposite */}
            <div
                className="absolute"
                style={{
                    width: '52%',
                    left: '4%',
                    bottom: '-4%',
                    transform: 'rotate(12deg)',
                    filter: 'drop-shadow(0 28px 56px rgba(0,0,0,0.6))',
                }}
            >
                <Watch2 accentColor={slide.accentColor} />
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const HeroSection = () => {
    const [active, setActive] = useState(0)
    const [show, setShow] = useState(true)
    const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const goTo = useCallback((idx: number) => {
        setShow(false)
        fadeRef.current = setTimeout(() => {
            setActive(idx)
            setShow(true)
        }, 320)
    }, [])

    const next = useCallback(() => goTo((active + 1) % slides.length), [active, goTo])
    const prev = useCallback(() => goTo((active - 1 + slides.length) % slides.length), [active, goTo])

    useEffect(() => {
        autoRef.current = setTimeout(next, 5500)
        return () => {
            if (autoRef.current) clearTimeout(autoRef.current)
            if (fadeRef.current) clearTimeout(fadeRef.current)
        }
    }, [active, next])

    const slide = slides[active]

    return (
        <div
            className="relative w-full overflow-hidden transition-colors duration-700"
            style={{
                background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgVia} 55%, ${slide.bgTo} 100%)`,
                minHeight: '480px',
            }}
        >
            {/* Subtle dot texture */}
            <div
                className="absolute inset-0 pointer-events-none select-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '26px 26px',
                }}
            />

            {/* Top-right atmospheric glow */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: '-120px',
                    right: '-120px',
                    width: '520px',
                    height: '520px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${slide.accentColor}18 0%, transparent 68%)`,
                }}
            />
            {/* Bottom-left glow */}
            <div
                className="absolute pointer-events-none"
                style={{
                    bottom: '-80px',
                    left: '-80px',
                    width: '380px',
                    height: '380px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
                }}
            />

            {/* ── Main Grid ── */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
                <div
                    className="grid items-center gap-0"
                    style={{ gridTemplateColumns: '1fr 1fr', minHeight: '480px' }}
                >

                    {/* LEFT: Text content */}
                    <div
                        className="flex flex-col gap-6 py-16"
                        style={{
                            opacity: show ? 1 : 0,
                            transform: show ? 'translateY(0)' : 'translateY(16px)',
                            transition: 'opacity 0.35s ease, transform 0.35s ease',
                        }}
                    >
                        {/* Eyebrow row */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-white/55 text-sm font-medium tracking-wide">
                                {slide.eyebrow}
                            </span>
                            <span
                                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border text-white"
                                style={{ borderColor: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)' }}
                            >
                                {slide.badge}
                            </span>
                        </div>

                        {/* Headline */}
                        <h1
                            className="text-white font-extrabold leading-[1.06] tracking-tight"
                            style={{ fontSize: 'clamp(36px, 4.5vw, 58px)' }}
                        >
                            {slide.title}
                            <br />
                            {slide.titleAccent}
                        </h1>

                        {/* Offer line */}
                        <p className="text-white/65 text-base sm:text-lg font-medium">
                            {slide.offerPrefix}
                            <span className="font-extrabold" style={{ color: slide.accentColor }}>
                                {slide.offerHighlight}
                            </span>
                            {slide.offerSuffix}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-5 pt-1">
                            <Link
                                href={slide.ctaHref}
                                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg border-2 border-white text-white text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 group hover:text-slate-900"
                                style={{ transition: 'background 0.2s, color 0.2s' }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLAnchorElement
                                    el.style.background = 'white'
                                    el.style.color = '#0f172a'
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLAnchorElement
                                    el.style.background = 'transparent'
                                    el.style.color = 'white'
                                }}
                            >
                                {slide.cta}
                                <span className="group-hover:translate-x-1 transition-transform duration-200">
                                    <IconArrow />
                                </span>
                            </Link>

                            <Link
                                href="/products"
                                className="text-sm text-white/45 font-medium hover:text-white transition-colors underline underline-offset-4"
                            >
                                Browse all
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT: Product Visual — no border radius, full bleed */}
                    <div
                        className="relative"
                        style={{
                            height: '480px',
                            opacity: show ? 1 : 0,
                            transform: show ? 'translateX(0) scale(1)' : 'translateX(24px) scale(0.97)',
                            transition: 'opacity 0.35s ease, transform 0.35s ease',
                        }}
                    >
                        <ProductVisual slide={slide} />
                    </div>

                </div>
            </div>

            {/* ── Bottom Bar: Dots + Arrows ── */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-8 sm:px-12 lg:px-20 pb-5">

                {/* Dot indicators */}
                <div className="flex items-center gap-2">
                    {slides.map((s, i) => (
                        <button
                            key={s.id}
                            onClick={() => goTo(i)}
                            aria-label={`Slide ${i + 1}`}
                            style={{
                                width: i === active ? '28px' : '8px',
                                height: '8px',
                                borderRadius: '99px',
                                background: i === active ? slide.accentColor : 'rgba(255,255,255,0.28)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'width 0.3s ease, background 0.3s ease',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>

                {/* Slide counter + arrows */}
                <div className="flex items-center gap-2">
                    <span className="text-white/35 text-xs font-medium mr-2 tabular-nums">
                        {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                    </span>
                    <button
                        onClick={prev}
                        aria-label="Previous"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
                    >
                        <IconChevronLeft />
                    </button>
                    <button
                        onClick={next}
                        aria-label="Next"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
                    >
                        <IconChevronRight />
                    </button>
                </div>
            </div>


            <style jsx>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    )
}

export default HeroSection