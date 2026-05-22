"use client";
import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, ChevronLeft, MapPin, Clock, Copy, DollarSign, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';

const TrackOrderPage = () => {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axiosInstance.get(`/order/api/user-order/${params.id}`);
                if (res.data.success) {
                    setOrder(res.data.order);
                }
            } catch (error) {
                toast.error("Failed to fetch order details");
            } finally {
                setIsLoading(false);
            }
        };
        if (params?.id) {
            fetchOrder();
        }
    }, [params]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Order ID copied to clipboard");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <Package size={48} className="text-slate-300 mb-4" />
                <h1 className="text-xl font-black text-slate-800 mb-2">Order Not Found</h1>
                <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">We couldn't find the order you're looking for. It might have been deleted or the ID is incorrect.</p>
                <Link href="/profile" className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors">
                    Back to Profile
                </Link>
            </div>
        );
    }

    // Determine tracking steps based on status
    const statuses = ["Processing", "Shipped", "Delivered"];
    const currentStatusIndex = statuses.indexOf(order.status) >= 0 ? statuses.indexOf(order.status) : 0;

    const steps = [
        { label: "Order Confirmed", icon: Package, date: new Date(order.createdAt).toLocaleDateString(), completed: true },
        { label: "Processing", icon: Clock, date: "In progress", completed: currentStatusIndex >= 0 },
        { label: "Shipped", icon: Truck, date: order.status === "Shipped" || order.status === "Delivered" ? "Completed" : "Pending", completed: currentStatusIndex >= 1 },
        { label: "Delivered", icon: CheckCircle2, date: order.status === "Delivered" ? "Completed" : "Pending", completed: currentStatusIndex >= 2 }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600">
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-[16px] font-black text-slate-800">Track Order</h1>
                            <p className="text-[12px] font-medium text-slate-400">View your order details and delivery status</p>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Order ID</span>
                        <div className="flex items-center gap-2 text-[14px] font-black text-slate-800 mt-0.5">
                            #{order.id.slice(-8).toUpperCase()}
                            <button onClick={() => handleCopy(order.id)} className="text-slate-400 hover:text-blue-500 transition-colors">
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Tracking & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tracking Timeline */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-[15px] font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Truck size={18} className="text-blue-500" />
                                Delivery Status
                            </h2>
                            
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                                <div className="absolute left-[21px] top-4 w-0.5 bg-blue-500 transition-all duration-500" style={{ height: `${(currentStatusIndex + 1) * 33.33}%`, maxHeight: '100%' }}></div>

                                <div className="space-y-8 relative">
                                    {steps.map((step, idx) => {
                                        const isCompleted = step.completed;
                                        const Icon = step.icon;

                                        return (
                                            <div key={idx} className="flex gap-4">
                                                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${isCompleted ? 'bg-blue-500 text-white ring-4 ring-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="pt-2.5">
                                                    <h3 className={`text-[14px] font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                                        {step.label}
                                                    </h3>
                                                    <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{step.date}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-[15px] font-black text-slate-800 flex items-center gap-2">
                                    <Package size={18} className="text-slate-400" />
                                    Items in Order
                                </h2>
                                <span className="text-[12px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{order.items?.length || 0} Items</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item: any, idx: number) => {
                                    const product = item.product;
                                    const imageUrl = product?.images?.[0]?.url || (typeof product?.images?.[0] === 'string' ? product.images[0] : null);
                                    
                                    return (
                                        <div key={idx} className="p-6 flex gap-4">
                                            <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={product?.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                ) : (
                                                    <Package size={24} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-[14px] font-bold text-slate-800 truncate mb-1">
                                                        {product?.name || "Product Name"}
                                                    </h3>
                                                    <p className="text-[12px] text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-[14px] font-black text-slate-900">${(product?.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary & Info */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-[15px] font-black text-slate-800 mb-5 flex items-center gap-2">
                                <DollarSign size={18} className="text-slate-400" />
                                Order Summary
                            </h2>
                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-slate-500 font-medium">Subtotal</span>
                                    <span className="text-slate-800 font-bold">${order.total?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-slate-500 font-medium">Shipping</span>
                                    <span className="text-emerald-600 font-bold">Free</span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-slate-500 font-medium">Tax</span>
                                    <span className="text-slate-800 font-bold">$0.00</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-[14px] font-black text-slate-800">Total</span>
                                <span className="text-[20px] font-black text-blue-600">${order.total?.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-[15px] font-black text-slate-800 mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-slate-400" />
                                Shipping Address
                            </h2>
                            {order.shippingAddress ? (
                                <div className="text-[13px] text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl">
                                    <p className="font-bold text-slate-800 mb-1">{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.address1}</p>
                                    {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                    <p className="mt-2 text-slate-500">{order.shippingAddress.country}</p>
                                </div>
                            ) : (
                                <p className="text-[13px] text-slate-500 bg-slate-50 p-4 rounded-xl">No shipping address provided for this order.</p>
                            )}
                        </div>

                        {/* Order Info */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-[15px] font-black text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-slate-400" />
                                Order Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Date</p>
                                    <p className="text-[13px] font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-5 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                                            <span className="text-[8px] font-black italic">CARD</span>
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-800">{order.paymentInfo?.status || "Paid"}</p>
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

export default TrackOrderPage;
