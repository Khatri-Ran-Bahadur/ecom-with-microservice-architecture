"use client"
import React, { useState, useMemo } from 'react'
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
    TrendingUp, ShoppingBag, DollarSign,
    Eye, ArrowUpRight, ArrowDownRight,
    ArrowRight, Users, Calendar
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { format, subDays, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import { Spinner } from 'apps/seller-ui/src/app/shared/confirmation'
import Link from 'next/link'
import useSeller from 'apps/seller-ui/src/hooks/useSeller'

const COLORS = ['#378ADD', '#34c57a', '#f59e0b', '#ec4899', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0D1117] border border-white/10 rounded-xl px-3.5 py-2.5 shadow-xl">
                <p className="text-white/50 text-xs mb-1.5">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
                        {p.name === 'Revenue' ? 'Rs.' : ''}{p.value.toLocaleString()}
                        <span className="text-white/30 text-xs ml-1">{p.name}</span>
                    </p>
                ))}
            </div>
        )
    }
    return null
}

const DashboardPage = () => {
    const { seller, isLoading: sellerLoading } = useSeller()
    const [revenueRange, setRevenueRange] = useState<'7d' | '30d'>('30d')

    // Fetch orders for metrics
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['seller-dashboard-orders'],
        queryFn: async () => {
            const res = await axiosInstance.get('/order/api/get-seller-orders?limit=100')
            return res.data.data
        }
    })

    const metrics = useMemo(() => {
        if (!ordersData) return null

        const now = new Date()
        const thisMonthStart = startOfMonth(now)
        const lastMonthStart = startOfMonth(subDays(thisMonthStart, 1))
        const lastMonthEnd = endOfMonth(lastMonthStart)

        const thisMonthOrders = ordersData.filter((o: any) => isWithinInterval(new Date(o.createdAt), { start: thisMonthStart, end: now }))
        const lastMonthOrders = ordersData.filter((o: any) => isWithinInterval(new Date(o.createdAt), { start: lastMonthStart, end: lastMonthEnd }))

        const thisMonthRevenue = thisMonthOrders.reduce((acc: number, o: any) => acc + o.total, 0)
        const lastMonthRevenue = lastMonthOrders.reduce((acc: number, o: any) => acc + o.total, 0)

        const revenueChange = lastMonthRevenue === 0 ? 100 : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        const ordersChange = lastMonthOrders.length === 0 ? 100 : ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100

        // Daily chart data for the last 30 days
        const last30Days = Array.from({ length: 30 }).map((_, i) => {
            const date = subDays(now, 29 - i)
            const dateStr = format(date, 'MMM dd')
            const dayOrders = ordersData.filter((o: any) => {
                const oDate = new Date(o.createdAt)
                return oDate.getDate() === date.getDate() && oDate.getMonth() === date.getMonth()
            })
            return {
                name: dateStr,
                Revenue: dayOrders.reduce((acc: number, o: any) => acc + o.total, 0),
                Orders: dayOrders.length
            }
        })

        // Status breakdown
        const statusBreakdown = [
            { name: 'Delivered', value: ordersData.filter((o: any) => o.status === 'delivered').length },
            { name: 'Shipped', value: ordersData.filter((o: any) => o.status === 'shipped').length },
            { name: 'Pending', value: ordersData.filter((o: any) => o.status === 'Paid' || o.status === 'Ordered').length },
            { name: 'Processing', value: ordersData.filter((o: any) => o.status === 'Packed').length },
            { name: 'Cancelled', value: ordersData.filter((o: any) => o.status === 'cancelled').length },
        ].filter(s => s.value > 0)

        return {
            totalRevenue: ordersData.reduce((acc: number, o: any) => acc + o.total, 0),
            thisMonthRevenue,
            revenueChange,
            totalOrders: ordersData.length,
            thisMonthOrders: thisMonthOrders.length,
            ordersChange,
            chartData: last30Days,
            statusBreakdown,
            recentOrders: ordersData.slice(0, 5)
        }
    }, [ordersData])

    if (ordersLoading || sellerLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Spinner color="#3B82F6" />
                <p className="text-sm text-slate-400">Loading dashboard data...</p>
            </div>
        )
    }

    const data = metrics!

    return (
        <div className="space-y-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Welcome back, <span className="text-[#378ADD]">{seller?.shop?.name || 'Seller'}</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Here's what's happening with your store today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-black/[0.07] rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar size={14} />
                        Jan 01 - Dec 31
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#378ADD] text-white rounded-xl text-xs font-bold hover:bg-[#2d76be] transition-all shadow-lg shadow-[#378ADD]/20">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `Rs.${data.totalRevenue.toLocaleString()}`, change: `${data.revenueChange.toFixed(1)}%`, up: data.revenueChange >= 0, icon: DollarSign, color: 'text-[#378ADD]', bg: 'bg-[#378ADD]/10' },
                    { label: 'Total Orders', value: data.totalOrders.toLocaleString(), change: `${data.ordersChange.toFixed(1)}%`, up: data.ordersChange >= 0, icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Avg. Order Value', value: `Rs.${(data.totalRevenue / (data.totalOrders || 1)).toFixed(0)}`, change: '+4.2%', up: true, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Total Customers', value: '1,284', change: '+12%', up: true, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-black/[0.07] shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon size={22} />
                            </div>
                            <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-black/[0.07] shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-black/[0.05] flex items-center justify-between bg-[#FAFAFA]">
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Revenue Analytics</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Sales performance over time</p>
                        </div>
                        <div className="flex bg-white p-1 rounded-xl border border-black/[0.05]">
                            {['7d', '30d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setRevenueRange(range as any)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${revenueRange === range ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {range.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#378ADD" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#378ADD" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                    tickFormatter={(v) => `Rs.${v >= 1000 ? (v/1000).toFixed(1) + 'k' : v}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="Revenue" 
                                    stroke="#378ADD" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-3xl border border-black/[0.07] shadow-sm p-8 flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 mb-1">Order Status</h3>
                    <p className="text-xs text-slate-400 mb-8">Delivery distribution</p>
                    
                    <div className="flex-1 h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.statusBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {data.statusBreakdown.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 mt-6">
                        {data.statusBreakdown.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-xs font-bold text-slate-500">{item.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900">{item.value} orders</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-black/[0.07] shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-black/[0.05] flex items-center justify-between bg-[#FAFAFA]">
                        <h3 className="text-lg font-black text-slate-900">Recent Orders</h3>
                        <Link href="/seller/orders" className="text-xs font-black text-[#378ADD] hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left bg-white border-b border-black/[0.03]">
                                    <th className="px-8 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Order ID</th>
                                    <th className="px-8 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Customer</th>
                                    <th className="px-8 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Amount</th>
                                    <th className="px-8 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.03]">
                                {data.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-4 font-mono text-xs font-medium text-slate-400">
                                            #{order.id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white">
                                                    {order.user?.name?.substring(0, 2).toUpperCase() || 'C'}
                                                </div>
                                                <span className="font-bold text-slate-900">{order.user?.name || 'Customer'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 font-black text-slate-900">Rs.{order.total.toLocaleString()}</td>
                                        <td className="px-8 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight
                                                ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                                                  order.status === 'Paid' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <Link href={`/seller/orders/${order.id}`} className="p-2 rounded-xl text-slate-300 hover:text-slate-900 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100">
                                                <Eye size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Popular Products Sidebar */}
                <div className="bg-white rounded-3xl border border-black/[0.07] shadow-sm p-8">
                    <h3 className="text-lg font-black text-slate-900 mb-6">Top Products</h3>
                    <div className="space-y-6">
                        {data.recentOrders.slice(0, 4).map((order: any, i: number) => {
                            const item = order.items?.[0]
                            if (!item) return null
                            return (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-black/[0.05]">
                                        {item.product?.images?.[0]?.url && (
                                            <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.product?.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-emerald-500">+{Math.floor(Math.random() * 20)}%</span>
                                            <span className="text-[10px] text-slate-400">trend</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900">{item.quantity} sales</p>
                                        <p className="text-[10px] text-slate-400">Rs.{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <button className="w-full mt-8 py-3 rounded-2xl border border-black/[0.07] text-xs font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                        View All Products
                    </button>
                </div>

            </div>
        </div>
    )
}

export default DashboardPage