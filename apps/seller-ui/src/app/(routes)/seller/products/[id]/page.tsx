"use client"
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import {
    ChevronLeft, ChevronRight, Package, ShieldCheck,
    Pencil, Trash2, Tag, Info, Truck, Palette,
    Maximize2, Star, Calendar, BadgeCheck
} from 'lucide-react'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductImage {
    fileId: string
    url: string
}

interface CustomSpecification {
    name: string
    value: string
}

interface CustomProperty {
    label: string
    values: string[]
}

interface Product {
    id: string
    title: string
    slug: string
    category: string
    subCategory?: string
    short_description?: string
    detailed_description?: string
    images?: ProductImage[]
    video_url?: string
    tags?: string[]
    brand?: string
    colors?: string[]
    sizes?: string[]
    starting_date?: string | null
    ending_date?: string | null
    stock?: number
    sale_price?: number | null
    regular_price?: number
    ratings?: number
    warranty?: string
    custom_properties?: CustomProperty[]
    custom_specifications?: CustomSpecification[]
    isDeleted?: boolean
    cash_on_delivery?: boolean
    discount_codes?: string[]
    status?: string
    is_featured?: boolean
    shopId?: string
    createdAt?: string
    updatedAt?: string
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = ({ color = '#8B5CF6' }: { color?: string }) => (
    <div className="flex items-center justify-center w-full h-full">
        <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: `${color}33`, borderTopColor: color }}
        />
    </div>
)

// ─── Status Badge ─────────────────────────────────────────────────────────────

const ProductStatusBadge = ({ status }: { status?: string }) => {
    if (!status) return null
    const config: Record<string, { bg: string; text: string; dot: string }> = {
        Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
        Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
        Draft: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
    }
    const c = config[status] ?? { bg: 'bg-slate-50', text: 'text-slate-400', dot: 'bg-slate-300' }
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase ${c.bg} ${c.text} border border-black/5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
            {status}
        </span>
    )
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ label, accent = 'bg-violet-500' }: { label: string; accent?: string }) => (
    <h3 className="text-base font-bold text-slate-800 flex items-center gap-3 mb-5">
        <span className={`w-1 h-6 rounded-full ${accent}`} />
        {label}
    </h3>
)

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
    label,
    value,
    icon: Icon,
    iconBg,
    iconColor,
}: {
    label: string
    value: string
    icon: React.ElementType
    iconBg: string
    iconColor: string
}) => (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3 hover:border-violet-200 transition-colors">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} flex-shrink-0`}>
            <Icon size={20} />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
        </div>
    </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductDetailPage = () => {
    const { id } = useParams()
    const router = useRouter()
    const [activeImageIdx, setActiveImageIdx] = useState(0)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await axiosInstance.get(`products/api/get-product/${id}`)
            return res.data?.product as Product
        },
    })

    // ── Loading ──
    if (isLoading) return (
        <div className="w-full h-screen flex items-center justify-center bg-[#F8F9FA]">
            <Spinner />
        </div>
    )

    // ── Error / Not Found ──
    if (isError || !data) return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-400">
                <Info size={28} />
            </div>
            <p className="text-slate-600 font-bold text-lg">Product not found</p>
            <button
                onClick={() => router.back()}
                className="px-6 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-100"
            >
                Back to Inventory
            </button>
        </div>
    )

    const product = data
    const allImages: ProductImage[] = product.images ?? []
    const hasManyImages = allImages.length > 1

    const nextImage = () => setActiveImageIdx((p) => (p + 1) % allImages.length)
    const prevImage = () => setActiveImageIdx((p) => (p - 1 + allImages.length) % allImages.length)

    // ── Derived values ──
    const displayPrice = product.sale_price ?? product.regular_price
    const hasDiscount =
        product.sale_price != null &&
        product.regular_price != null &&
        product.sale_price < product.regular_price
    const discountPct = hasDiscount
        ? Math.round(((product.regular_price! - product.sale_price!) / product.regular_price!) * 100)
        : 0

    const normalizedTags: string[] =
        Array.isArray(product.tags)
            ? product.tags
            : typeof product.tags === 'string'
                ? (product.tags as string).split(',').map((t) => t.trim())
                : []

    const formatDate = (iso?: string | null) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    return (
        <div className="w-full min-h-screen bg-[#F8F9FA] pb-24" style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* ── Sticky Top Bar ── */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors font-semibold group"
                    >
                        <span className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-violet-50 transition-colors">
                            <ChevronLeft size={16} />
                        </span>
                        <span className="hidden sm:inline">Back to Inventory</span>
                    </button>



                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => router.push(`/seller/products/edit/${id}`)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:border-violet-300 hover:bg-violet-50 transition-all shadow-sm active:scale-95"
                        >
                            <Pencil size={14} />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-all active:scale-95 border border-red-100">
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start overflow-hidden">

                {/* ════ LEFT COLUMN ════ */}
                <div className="space-y-6 min-w-0 w-full">

                    {/* Image Gallery */}
                    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm w-full overflow-hidden">
                        {/* Main Image */}
                        <div className="relative aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-50 group border border-slate-100 w-full">
                            {allImages.length > 0 ? (
                                <>
                                    <Image
                                        src={allImages[activeImageIdx].url}
                                        alt={product.title}
                                        fill
                                        className="object-contain p-4 transition-all duration-500"
                                        priority
                                    />
                                    {hasManyImages && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-600 hover:text-white active:scale-90"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-600 hover:text-white active:scale-90"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </>
                                    )}
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Maximize2 size={16} />
                                    </div>
                                    {/* Image counter */}
                                    {hasManyImages && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {allImages.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveImageIdx(i)}
                                                    className={`h-1.5 rounded-full transition-all ${i === activeImageIdx ? 'w-5 bg-violet-500' : 'w-1.5 bg-white/60'}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                                    <Package size={56} strokeWidth={1} />
                                    <span className="text-xs font-bold uppercase tracking-widest">No Images Available</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {hasManyImages && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={img.fileId ?? idx}
                                        onClick={() => setActiveImageIdx(idx)}
                                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIdx === idx
                                            ? 'border-violet-500 ring-2 ring-violet-100 scale-105'
                                            : 'border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <Image
                                            src={img.url}
                                            alt={`Thumbnail ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {product.detailed_description && (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm w-full overflow-hidden">
                            <SectionHeader label="Product Story & Details" />
                            <div
                                className="text-slate-600 leading-relaxed text-sm prose prose-slate max-w-full break-words overflow-x-auto"
                                dangerouslySetInnerHTML={{ __html: product.detailed_description }}
                            />
                        </div>
                    )}

                    {/* Video */}
                    {product.video_url && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <SectionHeader label="Product Video" accent="bg-red-500" />
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-50">
                                <iframe
                                    src={product.video_url}
                                    title="Product Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Specs + Properties */}
                    {((product.custom_specifications?.length ?? 0) > 0 ||
                        (product.custom_properties?.length ?? 0) > 0) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Technical Specifications — array of { name, value } */}
                                {(product.custom_specifications?.length ?? 0) > 0 && (
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                        <SectionHeader label="Custom Specifications" accent="bg-blue-500" />
                                        <div className="space-y-2">
                                            {product.custom_specifications!.map((spec, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between items-center px-4 py-3 rounded-xl bg-slate-50/60 border border-slate-50 hover:bg-slate-50 transition-colors"
                                                >
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {spec.name}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-700">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Custom Properties — array of { label, values[] } */}
                                {(product.custom_properties?.length ?? 0) > 0 && (
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                        <SectionHeader label="Custom Properties" accent="bg-emerald-500" />
                                        <div className="space-y-4">
                                            {product.custom_properties!.map((prop, idx) => (
                                                <div key={idx}>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                        {prop.label}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {prop.values.map((v, vi) => (
                                                            <span
                                                                key={vi}
                                                                className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                                                            >
                                                                {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                </div>

                {/* ════ RIGHT COLUMN ════ */}
                <div className="space-y-4 xl:sticky xl:top-[72px] min-w-0 w-full">

                    {/* Main Info Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                        {/* Category + Status */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold uppercase tracking-widest border border-violet-100">
                                    {product.category}
                                </span>
                                {product.subCategory && (
                                    <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                                        {product.subCategory}
                                    </span>
                                )}
                            </div>
                            <ProductStatusBadge status={product.status} />
                        </div>

                        {/* Title & Short Description */}
                        <div className="space-y-3">
                            <h1 className="text-2xl font-black text-slate-900 leading-tight">{product.title}</h1>
                            {product.short_description && (
                                <p className="text-sm text-slate-500 font-medium leading-relaxed border-l-4 border-violet-100 pl-4 italic">
                                    {product.short_description}
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-black text-slate-900">
                                Rs. {displayPrice?.toLocaleString() ?? '—'}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-lg text-slate-300 line-through font-semibold">
                                        Rs. {product.regular_price?.toLocaleString()}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                        {discountPct}% off
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Tags */}
                        {normalizedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {normalizedTags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-[11px] font-semibold border border-slate-100"
                                    >
                                        <Tag size={11} className="text-slate-300" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Ratings */}
                        {product.ratings != null && (
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={16}
                                        className={s <= Math.round(product.ratings!) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                                    />
                                ))}
                                <span className="text-sm text-slate-400 font-medium ml-1">{product.ratings}/5</span>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                        <StatCard
                            label="Available Stock"
                            value={product.stock != null ? `${product.stock} units` : '—'}
                            icon={Package}
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                        />
                        <StatCard
                            label="Brand"
                            value={product.brand || 'Unknown'}
                            icon={Tag}
                            iconBg="bg-violet-50"
                            iconColor="text-violet-600"
                        />
                        <StatCard
                            label="Warranty"
                            value={product.warranty || 'None'}
                            icon={ShieldCheck}
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                        />
                        <StatCard
                            label="Cash on Delivery"
                            value={product.cash_on_delivery ? 'Enabled' : 'Prepaid Only'}
                            icon={Truck}
                            iconBg={product.cash_on_delivery ? 'bg-emerald-50' : 'bg-amber-50'}
                            iconColor={product.cash_on_delivery ? 'text-emerald-600' : 'text-amber-600'}
                        />
                        {product.is_featured && (
                            <StatCard
                                label="Featured"
                                value="Featured Product"
                                icon={BadgeCheck}
                                iconBg="bg-violet-50"
                                iconColor="text-violet-600"
                            />
                        )}
                        {(product.discount_codes?.length ?? 0) > 0 && (
                            <StatCard
                                label="Discount Codes"
                                value={`${product.discount_codes!.length} applied`}
                                icon={Tag}
                                iconBg="bg-pink-50"
                                iconColor="text-pink-600"
                            />
                        )}
                    </div>

                    {/* Colors + Sizes */}
                    {((product.colors?.length ?? 0) > 0 || (product.sizes?.length ?? 0) > 0) && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                            {(product.colors?.length ?? 0) > 0 && (
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                                        <Palette size={12} /> Available Colors
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors!.map((color, idx) => (
                                            <div
                                                key={idx}
                                                className="w-8 h-8 rounded-full border-4 border-white shadow-md ring-1 ring-slate-200 hover:scale-110 transition-transform cursor-pointer"
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {(product.sizes?.length ?? 0) > 0 && (
                                <div className="pt-4 border-t border-slate-50">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                                        Available Sizes
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes!.map((size, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold border border-slate-100 hover:border-violet-300 hover:bg-violet-50 transition-colors cursor-pointer"
                                            >
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sale Period */}
                    {(product.starting_date || product.ending_date) && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                                <Calendar size={12} /> Sale Period
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <span>{formatDate(product.starting_date)}</span>
                                <span className="text-slate-300">→</span>
                                <span>{formatDate(product.ending_date)}</span>
                            </div>
                        </div>
                    )}

                    {/* Meta */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Meta Info</p>
                        <div className="space-y-2 text-sm">
                            {[
                                { label: 'Created', value: formatDate(product.createdAt) },
                                { label: 'Updated', value: formatDate(product.updatedAt) },
                                { label: 'Slug', value: product.slug || '—' },
                                { label: 'Product ID', value: product.id ? `…${product.id.slice(-8)}` : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                    <span className="text-slate-400 font-medium">{label}</span>
                                    <span className="font-semibold text-slate-700 text-right max-w-[60%] truncate">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProductDetailPage