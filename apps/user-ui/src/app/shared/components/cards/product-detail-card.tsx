"use client";
import React, { useState } from "react";
import Image from "next/image";
import defaultAvatar from "../../../../assets/default-avatar.jpg";
import {
    X,
    Package,
    Clock,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    MapPin,
    Heart,
    ShoppingBag,
    Plus,
    Minus,
} from "lucide-react";
import Ratings from "../../ratings/ratings";
import useStore from 'apps/user-ui/src/store';
import { useUser } from 'apps/user-ui/src/hooks/useUser';
import useLocationTraking from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTraking from 'apps/user-ui/src/hooks/useDeviceTrackiong';

const ProductDetailCard = ({
    data,
    setOpen,
}: {
    data: any;
    setOpen: (open: boolean) => void;
}) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(
        data?.colors?.[0] || null
    );
    const [selectedSize, setSelectedSize] = useState<string | null>(
        data?.sizes?.[0] || null
    );
    const [quantity, setQuantity] = useState(1);


    const { user } = useUser();
    const location = useLocationTraking();
    const deviceInfo = useDeviceTraking();
    const addToWishlist = useStore((state: any) => state.addToWishlist);
    const wishlist = useStore((state: any) => state.wishlist);
    const isWishlist = wishlist?.some((item: any) => item.id === data?.id);

    // cart
    const addTocart = useStore((state: any) => state.addToCart);
    const updateCartQuantity = useStore((state: any) => state.updateCartQuantity);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
    const removeFromCart = useStore((state: any) => state.removeFromCart);
    const cart = useStore((state: any) => state.cart);
    const isCart = cart?.find((item: any) => item.id === data?.id);

    //if is cart add quantity in cart 
    React.useEffect(() => {
        if (isCart && typeof isCart.quantity === 'number') {
            setQuantity(isCart.quantity);
        }
    }, [isCart?.id]);


    const discount = data?.regular_price && data?.sale_price
        ? Math.round(((data.regular_price - data.sale_price) / data.regular_price) * 100)
        : null;

    const images = data?.images || [];

    // making sure quantity should not be less than 1 and also not more than stock
    const handleQuantity = (type: string) => {
        let newQty = quantity;
        if (type === 'decrease') {
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
    }

    //input also increase decrease the value of quantity
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 1;
        let newQty = value;
        if (value < 1) newQty = 1;
        else if (value > data?.stock) newQty = data?.stock;

        setQuantity(newQty);
        if (isCart) {
            updateCartQuantity(data.id, newQty, user, location, deviceInfo);
        }
    }


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setOpen(false)}
        >
            <div
                className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm"
                >
                    <X size={15} />
                </button>

                <div className="flex flex-col md:flex-row overflow-y-auto">
                    {/* ── Left: Images & Secondary Info ── */}
                    <div className="w-full md:w-[45%] p-6 flex flex-col bg-slate-50/50">

                        {/* Main image (takes full height) */}
                        <div className="relative flex-1 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">

                            {images[selectedImage]?.url ? (
                                <Image
                                    src={images[selectedImage].url}
                                    alt={data?.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Package size={48} />
                                </div>
                            )}

                            {/* Discount Badge */}
                            {discount && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                                    -{discount}% OFF
                                </div>
                            )}

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() =>
                                            setSelectedImage((p) => Math.max(0, p - 1))
                                        }
                                        disabled={selectedImage === 0}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 
                    w-8 h-8 rounded-full bg-white/90 border 
                    border-slate-200 flex items-center justify-center 
                    text-slate-600 hover:bg-white 
                    disabled:opacity-30 shadow-md"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            setSelectedImage((p) =>
                                                Math.min(images.length - 1, p + 1)
                                            )
                                        }
                                        disabled={selectedImage === images.length - 1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 
                    w-8 h-8 rounded-full bg-white/90 border 
                    border-slate-200 flex items-center justify-center 
                    text-slate-600 hover:bg-white 
                    disabled:opacity-30 shadow-md"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails at bottom */}
                        {images.length > 1 && (
                            <div className="flex gap-2.5 overflow-x-auto pt-4 mt-4 border-t border-slate-200 no-scrollbar">

                                {images.map((img: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`relative w-16 h-16 rounded-xl 
                    overflow-hidden border-2 transition-all 
                    flex-shrink-0 shadow-sm
                    ${i === selectedImage
                                                ? "border-violet-500 ring-2 ring-violet-500/20"
                                                : "border-white hover:border-slate-300"
                                            }`}
                                    >
                                        <Image
                                            src={img.url}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}

                            </div>
                        )}

                    </div>

                    {/* ── Right: Main Selection Info ── */}
                    <div className="w-full md:w-[55%] p-8 flex flex-col gap-6">
                        {data?.shop && (
                            <div className="mt-auto pt-4 border-slate-200">
                                <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">

                                    {/* Shop Logo */}
                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                        <Image
                                            src={data?.shop?.avatar || defaultAvatar}
                                            alt={data.shop.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Shop Details */}
                                    <div className="flex-1 min-w-0">

                                        {/* Shop Name */}
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {data.shop.name}
                                        </p>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs font-semibold text-slate-700">
                                                <Ratings
                                                    rating={data.shop.rating || 4.5}
                                                />
                                            </span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-1 mt-1">
                                            <MapPin size={13} className="text-slate-400" />
                                            <span className="text-[11px] text-slate-500 truncate">
                                                {data.shop.address}
                                            </span>
                                        </div>

                                    </div>

                                    {/* Right Side */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">

                                        {/* Open Status */}
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} className="text-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase">
                                                Open Now <span className="text-xs font-normal text-slate-500">{`(${data.shop.opening_hours})`}</span>
                                            </span>
                                        </div>

                                        {/* Chat Button */}
                                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition">
                                            <MessageCircle size={14} />
                                            Chat Seller
                                        </button>

                                    </div>

                                </div>
                            </div>
                        )}

                        {/* Category + badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-violet-600 text-white px-3 py-1 rounded-full shadow-sm">
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

                        {/* Title & Brand */}
                        <div className="space-y-1.5">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                {data?.title}
                            </h2>
                            <p className="text-slate-700 text-sm font-medium py-2">{data?.short_description}</p>
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="text-sm font-medium">Brand:</span>
                                <span className="text-sm font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">{data?.brand || "Premium Selection"}</span>
                            </div>
                        </div>

                        {/* Attributes (Color & Size) */}
                        <div className="space-y-4">
                            {/* Colors */}
                            {data?.colors?.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Color</p>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {data.colors.map((color: string) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                style={{ backgroundColor: color }}
                                                className={`w-9 h-9 rounded-full border-4 transition-all shadow-sm
                          ${selectedColor === color
                                                        ? "border-white ring-2 ring-violet-500 scale-110"
                                                        : "border-white ring-1 ring-slate-200 hover:scale-105"
                                                    }`}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {data?.sizes?.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Size</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {data.sizes.map((size: string) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`min-w-[44px] h-11 px-4 text-xs font-bold rounded-xl border-2 transition-all
                          ${selectedSize === size
                                                        ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200"
                                                        : "bg-white text-slate-600 border-slate-100 hover:border-violet-200"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pricing (More prominent) */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                {data?.sale_price ? (
                                    <>
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
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
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                        Rs. {data?.regular_price?.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Quantity
                            </p>

                            <div className="flex items-center gap-3 flex-wrap">

                                {/* Quantity Selector */}
                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">

                                    {/* Decrease */}
                                    <button
                                        disabled={quantity <= 1}
                                        onClick={() => handleQuantity('decrease')}
                                        className={`px-3 py-2 flex items-center justify-center 
      border-r border-slate-200 transition
      ${quantity <= 1
                                                ? "text-slate-300 cursor-not-allowed bg-slate-50"
                                                : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        <Minus size={16} />
                                    </button>

                                    {/* Input */}
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(e)}
                                        className="w-16 text-center text-sm font-semibold 
                 outline-none appearance-none"
                                        min={1}
                                        max={data?.stock || 1}
                                    />

                                    {/* Increase */}
                                    <button
                                        disabled={quantity >= data?.stock}
                                        onClick={() => handleQuantity('increase')}
                                        className={`px-3 py-2 flex items-center justify-center 
      border-l border-slate-200 transition
      ${quantity >= data?.stock
                                                ? "text-slate-300 cursor-not-allowed bg-slate-50"
                                                : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        <Plus size={16} />
                                    </button>

                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    disabled={data?.stock === 0}
                                    onClick={() => isCart
                                        ? removeFromCart(data.id, user, location, deviceInfo)
                                        : addTocart({ ...data, quantity: quantity, selectedOptions: { color: selectedColor, size: selectedSize } }, user, location, deviceInfo)}
                                    className={`flex items-center gap-2 px-5 py-2.5 
    text-sm font-semibold rounded-lg transition shadow-sm
    ${data?.stock === 0
                                            ? "bg-slate-300 text-white cursor-not-allowed"
                                            : "bg-violet-600 hover:bg-violet-700 text-white"
                                        }`}
                                >
                                    <ShoppingBag size={18} />
                                    {data?.stock === 0 ? "Out of Stock" : isCart ? "Already in Cart" : "Add to Cart"}
                                </button>

                                {/* Wishlist Button */}
                                <button
                                    onClick={() => isWishlist
                                        ? removeFromWishlist(data.id, user, location, deviceInfo)
                                        : addToWishlist({ ...data, quantity: quantity, selectedOptions: { color: selectedColor, size: selectedSize } }, user, location, deviceInfo)}
                                    className={`w-10 h-10 flex items-center justify-center 
               border border-slate-200 rounded-lg 
               text-slate-600 hover:bg-red-50 
               hover:text-red-500 transition ${isWishlist ? "text-red-500" : ""}`}
                                >
                                    <Heart size={18} fill={isWishlist ? "red" : "transparent"} stroke={isWishlist ? "red" : "currentColor"} strokeWidth={2} />
                                </button>

                            </div>
                            {/* In stock or out of stock  */}
                            {data?.stock > 0 ? (
                                <p className="text-sm font-medium text-emerald-600">In stock</p>
                            ) : (
                                <p className="text-sm font-medium text-red-600">Out of stock</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailCard;