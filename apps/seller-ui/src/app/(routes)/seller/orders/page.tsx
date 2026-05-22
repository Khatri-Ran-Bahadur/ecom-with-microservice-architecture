"use client"
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Eye, Calendar, Filter, ShoppingBag, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
    Spinner,
} from 'apps/seller-ui/src/app/shared/confirmation'

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderItem = {
    id: string
    productId: string
    quantity: number
    price: number
    product: {
        title: string
        images: any[]
    }
}

type Order = {
    id: string
    status: string
    total: number
    paymentStatus: string
    deliveryStatus: string
    createdAt: string
    user: {
        name: string
        email: string
        avatar: any
    }
    items: OrderItem[]
}

const STATUS_CONFIG: any = {
    Paid: { label: 'Paid', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    Pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    processing: { label: 'Processing', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
    delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
}

const OrdersPage = () => {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const { data, isLoading, isError } = useQuery({
        queryKey: ['seller-orders', page, statusFilter, startDate, endDate],
        queryFn: async () => {
            const res = await axiosInstance.get(`/order/api/get-seller-orders`, {
                params: {
                    page,
                    status: statusFilter,
                    startDate,
                    endDate,
                    limit: 10
                }
            })
            return res.data
        }
    })

    const orders = data?.data || []
    const meta = data?.meta || { total: 0, totalPages: 1 }

    return (
        <div className="w-full min-h-screen bg-[#F5F4F0] px-6 py-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* Page Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                        <span className="text-xs font-medium text-[#888] tracking-widest uppercase">Sales</span>
                    </div>
                    <h1 className="text-[28px] text-black leading-tight"
                        style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                        Orders
                    </h1>
                    <p className="text-sm text-[#888] mt-1">Monitor and manage your customer orders</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-black/[0.07] shadow-sm">
                    <Filter size={14} className="text-[#aaa]" />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-transparent text-sm outline-none font-medium text-[#555]"
                    >
                        <option value="all">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-black/[0.07] shadow-sm">
                    <Calendar size={14} className="text-[#aaa]" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                        className="bg-transparent text-sm outline-none font-medium text-[#555]"
                    />
                    <span className="text-[#ccc] px-1">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                        className="bg-transparent text-sm outline-none font-medium text-[#555]"
                    />
                </div>

                {(startDate || endDate || statusFilter !== 'all') && (
                    <button 
                        onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('all'); setPage(1); }}
                        className="text-xs text-blue-600 hover:underline font-medium"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Table Card */}
            <div className="w-full bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-[#999] text-sm gap-3">
                        <Spinner color="#3B82F6" />
                        Loading orders...
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center py-20 text-sm text-red-500">
                        Failed to load orders. Please try again.
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#F5F4F0] flex items-center justify-center mb-4">
                            <ShoppingBag size={22} className="text-[#bbb]" />
                        </div>
                        <p className="text-sm font-medium text-[#555] mb-1">No orders found</p>
                        <p className="text-xs text-[#aaa]">Try adjusting your filters or wait for new orders</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-black/[0.05] bg-[#FAFAFA]">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#999] tracking-wider uppercase">Order</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#999] tracking-wider uppercase">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#999] tracking-wider uppercase">Items</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#999] tracking-wider uppercase">Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#999] tracking-wider uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#999] tracking-wider uppercase">Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-[#999] tracking-wider uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/[0.04]">
                                    {orders.map((order: Order) => (
                                        <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-bold text-gray-400">
                                                    #{order.id.slice(-6).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                                                        {order.user?.name?.substring(0, 2).toUpperCase() || 'C'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 truncate">{order.user?.name}</p>
                                                        <p className="text-[10px] text-slate-400 truncate">{order.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="font-medium text-slate-700 truncate max-w-[180px]">
                                                        {order.items[0]?.product?.title || 'Multiple Items'}
                                                    </p>
                                                    {order.items.length > 1 && (
                                                        <p className="text-[10px] text-slate-400">+{order.items.length - 1} more items</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900">Rs.{order.total.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => router.push(`/seller/orders/${order.id}`)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-black/[0.05] flex items-center justify-between bg-[#FAFAFA]">
                            <p className="text-xs text-[#aaa]">
                                Showing <span className="font-medium text-[#777]">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-[#777]">{Math.min(page * 10, meta.total)}</span> of <span className="font-medium text-[#777]">{meta.total}</span> orders
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 rounded-lg border border-black/[0.07] text-[#777] disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-bold text-slate-700 w-8 text-center">{page}</span>
                                <button
                                    disabled={page >= meta.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 rounded-lg border border-black/[0.07] text-[#777] disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

const StatusBadge = ({ status }: { status: string }) => {
    const config = STATUS_CONFIG[status] || { label: status, color: 'text-slate-600', bg: 'bg-slate-50', dot: 'bg-slate-400' }
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${config.bg} ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    )
}

export default OrdersPage