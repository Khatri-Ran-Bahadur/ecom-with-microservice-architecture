import React, { useState, useEffect } from 'react'
import { Package, User, Mail, Phone, Gift, TrendingUp, Heart, ChevronRight } from 'lucide-react'
import axiosInstance from '@/utils/axiosInstance'

const statusStyle: Record<string, string> = {
    Delivered: "bg-emerald-100 text-emerald-700",
    Shipped: "bg-blue-100 text-blue-700",
    Cancelled: "bg-rose-100 text-rose-700",
    Pending: "bg-amber-100 text-amber-700",
    Processing: "bg-indigo-100 text-indigo-700"
};

const Overview = ({ user }: { user: any }) => {
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axiosInstance.get("/order/api/user-orders");
                if (res.data.success) {
                    setRecentOrders(res.data.orders.slice(0, 4));
                }
            } catch (err) {
                console.error("Failed to fetch recent orders", err);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="space-y-5">
            {/* Recent Orders */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Package size={14} className="text-blue-600" />
                        </div>
                        <h2 className="text-[14px] font-black text-slate-800">Recent Orders</h2>
                    </div>
                    <button className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1">
                        View all <ChevronRight size={12} />
                    </button>
                </div>
                <div className="divide-y divide-slate-50">
                    {recentOrders.length > 0 ? recentOrders.map((order) => {
                        const firstItem = order.items?.[0]?.product;
                        const firstImage = firstItem?.images?.[0]?.url || (typeof firstItem?.images?.[0] === 'string' ? firstItem?.images?.[0] : null);
                        return (
                            <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 text-xl flex items-center justify-center">
                                    {firstImage ? (
                                        <img src={firstImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={20} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                                        {firstItem?.name || "Order Items"} {order.items?.length > 1 ? `+${order.items.length - 1} more` : ""}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] text-slate-400 font-medium">#{order.id.slice(-6).toUpperCase()}</span>
                                        <span className="text-slate-200 text-[10px]">•</span>
                                        <span className="text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <span className="text-[13px] font-black text-slate-800">
                                        ${order.total?.toFixed(2) || "0.00"}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[order.status] ?? "bg-slate-100 text-slate-700"}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="px-6 py-8 text-center">
                            <p className="text-sm text-slate-500 font-medium">No recent orders found.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick info row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Account info */}
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                            <User size={14} className="text-violet-600" />
                        </div>
                        <h2 className="text-[14px] font-black text-slate-800">Account Info</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { icon: User, label: "Name", value: user?.name ?? "—" },
                            { icon: Mail, label: "Email", value: user?.email ?? "—" },
                            { icon: Phone, label: "Phone", value: user?.phone ?? "Not set" },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                    <Icon size={13} className="text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
                                    <p className="text-[12px] font-semibold text-slate-700 truncate">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-5 w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-[11px] font-bold text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-colors">
                        Update Info
                    </button>
                </section>

                {/* Rewards & loyalty */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-sm p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-violet-500/10 blur-2xl" />
                    <div className="relative">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                                <Gift size={14} className="text-amber-400" />
                            </div>
                            <h2 className="text-[14px] font-black text-white">Reward Points</h2>
                        </div>

                        <div className="mb-4">
                            <p className="text-4xl font-black text-white tracking-tight">2,400</p>
                            <p className="text-[11px] text-slate-400 mt-1 font-medium">≈ $24.00 value · 600 pts to next tier</p>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1.5">
                                <span>Gold Member</span>
                                <span>Platinum →</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
                                    style={{ width: "80%" }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <TrendingUp size={12} className="text-emerald-400" />
                            <span className="text-[11px] text-emerald-400 font-bold">+120 pts this month</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Wishlist preview */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                            <Heart size={14} className="text-rose-500" />
                        </div>
                        <h2 className="text-[14px] font-black text-slate-800">Wishlist</h2>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">17 items</span>
                    </div>
                    <button className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1">
                        See all <ChevronRight size={12} />
                    </button>
                </div>
                <div className="p-6">
                    {/* Placeholder wishlist chips */}
                    <div className="flex flex-wrap gap-2.5">
                        {["Sony WH-1000XM5", "iPad Pro 13\"", "Nike Air Max 90", "Dyson V15", "Apple Watch Ultra"].map((item) => (
                            <span key={item} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer group">
                                {item}
                                <Heart size={10} className="text-slate-300 group-hover:text-rose-400 group-hover:fill-rose-400 transition-colors" />
                            </span>
                        ))}
                        <span className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-200 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                            +12 more
                        </span>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Overview