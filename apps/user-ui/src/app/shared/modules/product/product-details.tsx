"use client";
import React, { useState, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
    Package,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    MapPin,
    Heart,
    ShoppingBag,
    Plus,
    Minus,
    Star,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Play,
    Shield,
    Truck,
    RefreshCw,
    ThumbsUp,
    Eye,
} from "lucide-react";
import Ratings from "../../ratings/ratings";
import useStore from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTraking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTraking from "apps/user-ui/src/hooks/useDeviceTrackiong";
import Link from "next/link";
import ProductCard from "../../components/cards/product-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

// ─── Mock reviews data ────────────────────────────────────────────────────────
const mockReviews = [
    {
        id: 1,
        user: "Alex M.",
        avatar: null,
        rating: 5,
        date: "April 20, 2026",
        title: "Exactly as described!",
        body: "Fast delivery and product quality exceeded my expectations. Would definitely buy again.",
        helpful: 12,
    },
    {
        id: 2,
        user: "Priya K.",
        avatar: null,
        rating: 4,
        date: "April 15, 2026",
        title: "Great value for money",
        body: "Very good build quality. Setup was straightforward. Minor issue with packaging but product itself is perfect.",
        helpful: 7,
    },
    {
        id: 3,
        user: "James R.",
        avatar: null,
        rating: 5,
        date: "March 30, 2026",
        title: "Highly recommend",
        body: "Solid product. The colors are vibrant and matches the photos perfectly.",
        helpful: 4,
    },
];

// ─── Star renderer ────────────────────────────────────────────────────────────
const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <Star
                key={s}
                size={size}
                className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
            />
        ))}
    </div>
);

// ─── Rating bar chart ─────────────────────────────────────────────────────────
const RatingBars = ({ reviews }: { reviews: typeof mockReviews }) => {
    const counts = [5, 4, 3, 2, 1].map((n) => ({
        star: n,
        count: reviews.filter((r) => r.rating === n).length,
    }));
    const max = Math.max(...counts.map((c) => c.count), 1);
    return (
        <div className="space-y-1.5 w-full max-w-[220px]">
            {counts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-slate-500 font-medium">{star}</span>
                    <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-700"
                            style={{ width: `${(count / max) * 100}%` }}
                        />
                    </div>
                    <span className="w-3 text-slate-400">{count}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetails = ({ productDetails }: { productDetails: any }) => {
    const data = productDetails;

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(data?.colors?.[0] || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(data?.sizes?.[0] || null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews" | "video">("description");
    const [, setShowVideo] = useState(false);
    const [helpfulMap, setHelpfulMap] = useState<Record<number, boolean>>({});
    const [mounted, setMounted] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
    const [priceRange] = useState<number[]>([0, 1199]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { user } = useUser();
    const location = useLocationTraking();
    const deviceInfo = useDeviceTraking();
    const addToWishlist = useStore((state: any) => state.addToWishlist);
    const wishlist = useStore((state: any) => state.wishlist);
    const isWishlist = mounted ? wishlist?.some((item: any) => item.id === data?.id) : false;
    const addToCart = useStore((state: any) => state.addToCart);
    const updateCartQuantity = useStore((state: any) => state.updateCartQuantity);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
    const removeFromCart = useStore((state: any) => state.removeFromCart);
    const cart = useStore((state: any) => state.cart);
    const isCart = mounted ? cart?.find((item: any) => item.id === data?.id) : null;

    //if is cart add quantity in cart 
    useEffect(() => {
        if (isCart && typeof isCart.quantity === 'number') {
            setQuantity(isCart.quantity);
        }
    }, [isCart?.id]); // Only sync when the product in cart changes or is first found



    const images = data?.images || [];
    const discount =
        data?.regular_price && data?.sale_price
            ? Math.round(((data.regular_price - data.sale_price) / data.regular_price) * 100)
            : null;

    const handleQuantity = (type: "increase" | "decrease") => {
        let newQty = quantity;
        if (type === "decrease") {
            if (quantity <= 1) return;
            newQty = quantity - 1;
        } else {
            if (quantity >= data?.stock) return;
            newQty = quantity + 1;
        }
        setQuantity(newQty);
        if (isCart) {
            updateCartQuantity(data.id, newQty, user, location, deviceInfo);
        }

    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 1;
        let newQty = value;
        if (value < 1) newQty = 1;
        else if (value > data?.stock) newQty = data?.stock;

        setQuantity(newQty);
        //update to cart
        if (isCart) {
            updateCartQuantity(data.id, newQty, user, location, deviceInfo);
        }
    };

    const fetchRecommendedProducts = async () => {
        try {
            const query = new URLSearchParams();
            query.set('priceRange', priceRange.join(","));
            query.set('page', "1");
            query.set('limit', "8");
            const response = await axiosInstance.get(`/products/api/get-filtered-products?${query.toString()}`);
            setRecommendedProducts(response.data.products);
        } catch (error) {
            console.error("Error fetching recommended products:", error);

        }
    };

    useEffect(() => {
        fetchRecommendedProducts();
    }, [priceRange]);


    return (
        <div className="min-h-screen bg-[#f7f7f8] font-sans">
            {/* ── Breadcrumb ── */}
            <div className="w-full bg-white border-b border-slate-100">
                <div className="w-[90%] lg:w-[85%] mx-auto py-3 flex items-center gap-2 text-xs text-slate-400">
                    <span className="hover:text-violet-600 cursor-pointer transition">Home</span>
                    <span>/</span>
                    <span className="hover:text-violet-600 cursor-pointer transition">{data?.category}</span>
                    <span>/</span>
                    <span className="hover:text-violet-600 cursor-pointer transition">{data?.subCategory}</span>
                    <span>/</span>
                    <span className="text-slate-700 font-medium truncate max-w-[180px]">{data?.title}</span>
                </div>
            </div>

            {/* ── Main Product Section ── */}
            <div className="w-[90%] lg:w-[85%] mx-auto py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[42%_58%]">

                        {/* ── Left: Image Gallery ── */}
                        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col gap-4">

                            {/* Main Zoom Image */}
                            <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square group">
                                {images[selectedImage]?.url ? (
                                    <TransformWrapper
                                        initialScale={1}
                                        minScale={1}
                                        maxScale={4}
                                        centerOnInit
                                    >
                                        {({ zoomIn, zoomOut, resetTransform }) => (
                                            <>
                                                <TransformComponent
                                                    wrapperStyle={{ width: "100%", height: "100%" }}
                                                    contentStyle={{ width: "100%", height: "100%" }}
                                                >
                                                    <img
                                                        src={images[selectedImage].url}
                                                        alt={data?.title}
                                                        className="w-full h-full object-contain select-none"
                                                        draggable={false}
                                                    />
                                                </TransformComponent>

                                                {/* Zoom Controls */}
                                                <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                    <button
                                                        onClick={() => zoomIn()}
                                                        className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white shadow-sm"
                                                    >
                                                        <ZoomIn size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => zoomOut()}
                                                        className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white shadow-sm"
                                                    >
                                                        <ZoomOut size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => resetTransform()}
                                                        className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white shadow-sm"
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                </div>

                                                {/* Zoom hint */}
                                                <div className="absolute top-3 left-3 bg-black/40 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                                                    Scroll to zoom
                                                </div>
                                            </>
                                        )}
                                    </TransformWrapper>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                        <Package size={64} />
                                    </div>
                                )}

                                {/* Discount badge */}
                                {discount && (
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow pointer-events-none">
                                        -{discount}% OFF
                                    </div>
                                )}

                                {/* Arrow navigation */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImage((p) => Math.max(0, p - 1))}
                                            disabled={selectedImage === 0}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 shadow"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedImage((p) => Math.min(images.length - 1, p + 1))}
                                            disabled={selectedImage === images.length - 1}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 shadow"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                                    {images.map((img: any, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0
                        ${i === selectedImage
                                                    ? "border-violet-500 ring-2 ring-violet-500/20"
                                                    : "border-transparent hover:border-slate-300"
                                                }`}
                                        >
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}

                                    {/* Video thumbnail if available */}
                                    {data?.video_url && (
                                        <button
                                            onClick={() => { setShowVideo(true); setActiveTab("video"); }}
                                            className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-transparent hover:border-violet-300 flex-shrink-0 bg-slate-800 flex items-center justify-center"
                                        >
                                            <Play size={20} className="text-white fill-white" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Trust badges */}
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {[
                                    { icon: Shield, label: "Secure Pay" },
                                    { icon: Truck, label: "Fast Delivery" },
                                    { icon: RefreshCw, label: "Easy Return" },
                                ].map(({ icon: Icon, label }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                                    >
                                        <Icon size={16} className="text-violet-500" />
                                        <span className="text-[10px] font-semibold text-slate-500 text-center">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: Product Info ── */}
                        <div className="p-6 lg:p-8 flex flex-col gap-5">

                            {/* Category chips */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-violet-600 text-white px-3 py-1 rounded-full">
                                    {data?.category}
                                </span>
                                {data?.subCategory && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                                        {data.subCategory}
                                    </span>
                                )}
                                <div className="ml-auto flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${data?.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${data?.status === "Active" ? "text-emerald-600" : "text-red-600"}`}>
                                        {data?.status}
                                    </span>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                                    {data?.title}
                                </h1>
                                <p className="text-slate-500 text-sm mt-2 leading-relaxed">{data?.short_description}</p>
                            </div>

                            {/* Rating summary */}
                            <div className="flex items-center gap-3">
                                <Ratings rating={productDetails?.rating || 0} />
                                <span className="text-sm font-bold text-slate-700">{productDetails?.rating?.toFixed(1)}</span>
                                <span className="text-sm text-slate-400">({productDetails?.reviewCount || 0} reviews)</span>
                                <span className="text-sm text-slate-400">·</span>
                                <span className="text-sm text-emerald-600 font-medium">{data?.totalSales} sold</span>
                            </div>

                            {/* Pricing */}
                            <div className="flex items-center gap-3">
                                {data?.sale_price ? (
                                    <>
                                        <span className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                                            Rs. {data.sale_price.toLocaleString()}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-slate-400 line-through font-medium">
                                                Rs. {data.regular_price.toLocaleString()}
                                            </span>
                                            <span className="text-xs font-bold text-emerald-600">
                                                Save Rs. {(data.regular_price - data.sale_price).toLocaleString()}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-3xl font-black text-slate-900">
                                        Rs. {data?.regular_price?.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-100" />

                            {/* Colors */}
                            {data?.colors?.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Color: <span className="text-slate-700 normal-case font-semibold ml-1">{selectedColor}</span>
                                    </p>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {data.colors.map((color: string) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                style={{ backgroundColor: color }}
                                                className={`w-9 h-9 rounded-full border-4 border-white transition-all shadow
                          ${selectedColor === color ? "ring-2 ring-violet-500 scale-110" : "ring-1 ring-slate-200 hover:scale-105"}`}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {data?.sizes?.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Size</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {data.sizes.map((size: string) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`min-w-[44px] h-10 px-4 text-xs font-bold rounded-xl border-2 transition-all
                          ${selectedSize === size
                                                        ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Brand & Warranty */}
                            <div className="flex items-center gap-4 flex-wrap">
                                {data?.brand && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-400">Brand:</span>
                                        <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">{data.brand}</span>
                                    </div>
                                )}
                                {data?.warranty && (
                                    <div className="flex items-center gap-2">
                                        <Shield size={12} className="text-emerald-500" />
                                        <span className="text-xs text-slate-500">{data.warranty}</span>
                                    </div>
                                )}
                                {data?.cash_on_delivery && (
                                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-lg font-semibold">COD Available</span>
                                )}
                            </div>

                            {/* Quantity + Actions */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity</p>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Qty selector */}
                                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-11">
                                        <button
                                            disabled={quantity <= 1}
                                            onClick={() => handleQuantity("decrease")}
                                            className={`px-3 h-full flex items-center justify-center border-r border-slate-200 transition
                        ${quantity <= 1 ? "text-slate-300 cursor-not-allowed bg-slate-50" : "text-slate-600 hover:bg-slate-50"}`}
                                        >
                                            <Minus size={15} />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            className="w-14 text-center text-sm font-bold outline-none appearance-none"
                                            min={1}
                                            max={data?.stock || 1}
                                        />
                                        <button
                                            disabled={quantity >= data?.stock}
                                            onClick={() => handleQuantity("increase")}
                                            className={`px-3 h-full flex items-center justify-center border-l border-slate-200 transition
                        ${quantity >= data?.stock ? "text-slate-300 cursor-not-allowed bg-slate-50" : "text-slate-600 hover:bg-slate-50"}`}
                                        >
                                            <Plus size={15} />
                                        </button>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        disabled={data?.stock === 0}
                                        onClick={() =>
                                            isCart
                                                ? removeFromCart(data.id, user, location, deviceInfo)
                                                : addToCart(
                                                    { ...data, quantity, selectedOptions: { color: selectedColor, size: selectedSize } },
                                                    user, location, deviceInfo
                                                )
                                        }
                                        className={`flex items-center gap-2 px-6 py-2.5 h-11 text-sm font-bold rounded-xl transition shadow-sm
                      ${data?.stock === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700 text-white"}`}
                                    >
                                        <ShoppingBag size={17} />
                                        {data?.stock === 0 ? "Out of Stock" : isCart ? "Already in Cart" : "Add to Cart"}
                                    </button>

                                    {/* Wishlist */}
                                    <button
                                        onClick={() =>
                                            isWishlist
                                                ? removeFromWishlist(data.id, user, location, deviceInfo)
                                                : addToWishlist({ ...data, quantity, selectedOptions: { color: selectedColor, size: selectedSize } }, user, location, deviceInfo)
                                        }
                                        className={`w-11 h-11 flex items-center justify-center border rounded-xl transition
                      ${isWishlist ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"}`}
                                    >
                                        <Heart size={18} fill={isWishlist ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                {/* Stock indicator */}
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${data?.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                                    <span className={`text-sm font-semibold ${data?.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                                        {data?.stock > 0 ? `In stock (${data.stock} available)` : "Out of stock"}
                                    </span>
                                </div>
                            </div>

                            {/* Shop card */}
                            {data?.shop && (
                                <div className="mt-2 p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                        <img
                                            src={data.shop.avatar?.url || `https://ui-avatars.com/api/?name=${data.shop.name}&background=random`}
                                            alt={data.shop.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900">{data.shop.name}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <StarRow rating={data.shop.rating || 4.5} size={11} />
                                        </div>
                                        {data.shop.address && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <MapPin size={11} className="text-slate-400" />
                                                <span className="text-[11px] text-slate-400 truncate">{location?.city + ", " + location?.country + ", " + data.shop.address}</span>
                                            </div>
                                        )}

                                    </div>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition">
                                        <MessageCircle size={13} />
                                        Chat
                                    </button>
                                    {/* goto shop */}
                                    <Link href={`/shop/${data.shop.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition">
                                        <Eye size={13} />
                                        Go to store
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Tabs: Description / Specs / Reviews / Video ── */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Tab headers */}
                    <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
                        {(["description", "specs", "reviews", "video"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); if (tab === "video") setShowVideo(true); }}
                                className={`px-6 py-4 text-sm font-bold capitalize transition whitespace-nowrap
                  ${activeTab === tab
                                        ? "text-violet-600 border-b-2 border-violet-600"
                                        : "text-slate-400 hover:text-slate-700"
                                    }`}
                            >
                                {tab === "reviews" ? `Reviews (${mockReviews.length})` : tab === "video" ? "Video" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 lg:p-8">
                        {/* Description */}
                        {activeTab === "description" && (
                            <div
                                className="prose prose-sm max-w-none text-slate-600 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: data?.detailed_description || "<p>No detailed description available.</p>",
                                }}
                            />
                        )}

                        {/* Specs */}
                        {activeTab === "specs" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { label: "Brand", value: data?.brand },
                                    { label: "Category", value: data?.category },
                                    { label: "Sub-category", value: data?.subCategory },
                                    { label: "Stock", value: `${data?.stock} units` },
                                    { label: "Warranty", value: data?.warranty },
                                    { label: "Tags", value: data?.tags?.join(", ") },
                                    { label: "Cash on Delivery", value: data?.cash_on_delivery ? "Available" : "Not available" },
                                    { label: "Status", value: data?.status },
                                ]
                                    .filter((spec) => spec.value)
                                    .map(({ label, value }) => (
                                        <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide w-28 shrink-0 mt-0.5">{label}</span>
                                            <span className="text-sm text-slate-700 font-medium">{value}</span>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Reviews */}
                        {activeTab === "reviews" && (
                            <div className="space-y-8">
                                {/* Summary */}
                                <div className="flex flex-col sm:flex-row items-start gap-8 pb-8 border-b border-slate-100">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-6xl font-black text-slate-900">{productDetails?.rating?.toFixed(1)}</span>
                                        <Ratings rating={productDetails?.rating} />
                                        <span className="text-sm text-slate-400">{productDetails?.total_reviews} reviews</span>
                                    </div>
                                    <RatingBars reviews={mockReviews} />
                                </div>

                                {/* Individual reviews */}
                                <div className="space-y-6">
                                    {mockReviews.map((review) => (
                                        <div key={review.id} className="border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-bold shrink-0">
                                                    {review.user[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{review.user}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <StarRow rating={review.rating} size={12} />
                                                                <span className="text-xs text-slate-400">{review.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-800 mt-2">{review.title}</p>
                                                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{review.body}</p>
                                                    <button
                                                        onClick={() => setHelpfulMap((m) => ({ ...m, [review.id]: !m[review.id] }))}
                                                        className={`flex items-center gap-1.5 mt-3 text-xs font-medium transition
                              ${helpfulMap[review.id] ? "text-violet-600" : "text-slate-400 hover:text-slate-600"}`}
                                                    >
                                                        <ThumbsUp size={12} />
                                                        Helpful ({review.helpful + (helpfulMap[review.id] ? 1 : 0)})
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Video */}
                        {activeTab === "video" && (
                            <div className="aspect-video w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                                {data?.video_url ? (
                                    <iframe
                                        src={data.video_url}
                                        title="Product video"
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Play size={48} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Related Products ── */}
                <div className="mt-6">
                    <h2 className="text-xl font-extrabold text-slate-900 mb-4">Related Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {recommendedProducts.length > 0 && recommendedProducts?.map((product: any) => <ProductCard key={`related-${product.id}`} product={product} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;