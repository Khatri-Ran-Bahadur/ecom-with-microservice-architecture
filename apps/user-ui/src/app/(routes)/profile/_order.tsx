import React, { useState, useEffect } from 'react'
import { Package, Search, ChevronRight, Filter, ShoppingBag, Truck } from 'lucide-react'
import axiosInstance from '@/utils/axiosInstance'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const statusStyle: Record<string, string> = {
    Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Shipped: "bg-blue-100 text-blue-700 border-blue-200",
    Cancelled: "bg-rose-100 text-rose-700 border-rose-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Processing: "bg-indigo-100 text-indigo-700 border-indigo-200"
};

const Order = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [trackId, setTrackId] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axiosInstance.get("/order/api/user-orders");
                if (res.data.success) {
                    setOrders(res.data.orders);
                }
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-slate-500 font-medium">Loading your orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={24} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">No orders yet</h3>
                <p className="text-sm text-slate-500 max-w-sm">Looks like you haven't made your first purchase yet. Start shopping to see your orders here!</p>
                <button className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Package size={16} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-black text-slate-800 leading-tight">Order History</h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Track and manage your past purchases</p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* Track by Order ID */}
                    <div className="flex items-center w-full sm:w-auto gap-2">
                        <div className="relative flex-1 sm:w-48">
                            <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                            <input 
                                type="text" 
                                value={trackId}
                                onChange={(e) => setTrackId(e.target.value)}
                                placeholder="Track Order ID..." 
                                className="pl-9 pr-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full"
                            />
                        </div>
                        <button 
                            onClick={() => trackId && router.push(`/track-order/${trackId}`)}
                            disabled={!trackId}
                            className="px-4 py-2 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        >
                            Track
                        </button>
                    </div>

                    <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-48">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search history..." 
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all w-full"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {orders.map((order) => {
                    const firstItem = order.items?.[0]?.product;
                    const remainingItemsCount = (order.items?.length || 1) - 1;
                    const firstImage = firstItem?.images?.[0]?.url || (typeof firstItem?.images?.[0] === 'string' ? firstItem?.images?.[0] : null);
                    
                    return (
                        <div key={order.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                                
                                {/* Product Info */}
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/50 flex items-center justify-center p-1">
                                        {firstImage ? (
                                            <img src={firstImage} alt={firstItem?.name || ''} className="w-full h-full object-contain mix-blend-multiply" />
                                        ) : (
                                            <Package size={24} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="min-w-0 pt-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusStyle[order.status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                                {order.status}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-400">#{order.id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-[14px] font-black text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                                            {firstItem?.name || "Order Items"}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5 text-[12px] text-slate-500 font-medium">
                                            <span>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            {remainingItemsCount > 0 && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>+{remainingItemsCount} more item{remainingItemsCount > 1 ? 's' : ''}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions & Price */}
                                <div className="flex items-center justify-between lg:justify-end gap-6 lg:w-64 pl-20 lg:pl-0 shrink-0">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Amount</p>
                                        <p className="text-[16px] font-black text-slate-900">${order.total?.toFixed(2) || "0.00"}</p>
                                    </div>
                                    <button className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all group-hover:translate-x-1">
                                        <ChevronRight size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>

                            {/* Additional Actions (Track, Receipt) */}
                            <div className="flex items-center gap-3 mt-4 pl-20 lg:pl-0">
                                {order.status === "Processing" || order.status === "Shipped" ? (
                                    <Link href={`/track-order/${order.id}`} className="px-4 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 transition-colors">
                                        Track Package
                                    </Link>
                                ) : (
                                    <button className="px-4 py-1.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-200 transition-colors">
                                        Buy Again
                                    </button>
                                )}
                                <Link href={`/track-order/${order.id}`} className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-slate-50 transition-colors">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {orders.length > 5 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                    <button className="text-[12px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        Load More Orders
                    </button>
                </div>
            )}
        </div>
    )
}

export default Order