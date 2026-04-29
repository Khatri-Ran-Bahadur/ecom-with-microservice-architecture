"use client"
import React, { useState } from 'react'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
    TrendingUp, TrendingDown, ShoppingBag, DollarSign,
    Package, Star, Eye, ArrowUpRight, ArrowDownRight,
    MoreHorizontal, Clock, CheckCircle2, XCircle, Truck
} from 'lucide-react'

// ── Mock data ──
const revenueData = [
    { month: 'Jan', revenue: 4200, orders: 38 },
    { month: 'Feb', revenue: 5800, orders: 52 },
    { month: 'Mar', revenue: 4900, orders: 45 },
    { month: 'Apr', revenue: 7200, orders: 68 },
    { month: 'May', revenue: 6100, orders: 57 },
    { month: 'Jun', revenue: 8900, orders: 84 },
    { month: 'Jul', revenue: 7600, orders: 72 },
    { month: 'Aug', revenue: 9400, orders: 91 },
    { month: 'Sep', revenue: 8200, orders: 78 },
    { month: 'Oct', revenue: 11200, orders: 106 },
    { month: 'Nov', revenue: 13800, orders: 132 },
    { month: 'Dec', revenue: 15400, orders: 147 },
]

const categoryData = [
    { name: 'Electronics', value: 38, color: '#378ADD' },
    { name: 'Fashion', value: 24, color: '#34c57a' },
    { name: 'Home', value: 18, color: '#f59e0b' },
    { name: 'Beauty', value: 12, color: '#ec4899' },
    { name: 'Other', value: 8, color: '#8b5cf6' },
]

const weeklyOrders = [
    { day: 'Mon', orders: 14 },
    { day: 'Tue', orders: 22 },
    { day: 'Wed', orders: 18 },
    { day: 'Thu', orders: 31 },
    { day: 'Fri', orders: 27 },
    { day: 'Sat', orders: 38 },
    { day: 'Sun', orders: 19 },
]

const recentOrders = [
    { id: '#ORD-7821', customer: 'Alice Johnson', product: 'Wireless Headphones Pro', amount: 129.99, status: 'delivered', time: '2 hrs ago', avatar: 'AJ' },
    { id: '#ORD-7820', customer: 'Bob Martinez', product: 'Running Sneakers X9', amount: 84.50, status: 'shipped', time: '4 hrs ago', avatar: 'BM' },
    { id: '#ORD-7819', customer: 'Carol White', product: 'Minimalist Watch', amount: 249.00, status: 'pending', time: '6 hrs ago', avatar: 'CW' },
    { id: '#ORD-7818', customer: 'David Lee', product: 'Yoga Mat Premium', amount: 45.99, status: 'processing', time: '8 hrs ago', avatar: 'DL' },
    { id: '#ORD-7817', customer: 'Eva Chen', product: 'Smart Home Speaker', amount: 189.00, status: 'cancelled', time: '10 hrs ago', avatar: 'EC' },
]

const topProducts = [
    { name: 'Wireless Headphones Pro', sales: 342, revenue: 44258, trend: 12, stock: 48 },
    { name: 'Minimalist Watch', sales: 218, revenue: 54282, trend: 8, stock: 22 },
    { name: 'Smart Home Speaker', sales: 195, revenue: 36855, trend: -3, stock: 67 },
    { name: 'Running Sneakers X9', sales: 167, revenue: 14122, trend: 21, stock: 12 },
    { name: 'Yoga Mat Premium', sales: 143, revenue: 6577, trend: 5, stock: 89 },
]

const STATUS_CONFIG = {
    delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    pending: { label: 'Pending', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    processing: { label: 'Processing', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
} as const

type OrderStatus = keyof typeof STATUS_CONFIG

const STAT_CARDS = [
    {
        label: 'Total Revenue',
        value: '$94,280',
        change: '+18.2%',
        up: true,
        icon: DollarSign,
        iconBg: 'bg-[#378ADD]/10',
        iconColor: 'text-[#378ADD]',
        sub: 'vs last month',
    },
    {
        label: 'Total Orders',
        value: '1,429',
        change: '+12.5%',
        up: true,
        icon: ShoppingBag,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        sub: 'vs last month',
    },
    {
        label: 'Products Listed',
        value: '248',
        change: '+4',
        up: true,
        icon: Package,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
        sub: 'new this month',
    },
    {
        label: 'Avg. Rating',
        value: '4.8',
        change: '+0.2',
        up: true,
        icon: Star,
        iconBg: 'bg-pink-500/10',
        iconColor: 'text-pink-500',
        sub: 'from 892 reviews',
    },
    {
        label: 'Store Visits',
        value: '28,491',
        change: '-3.1%',
        up: false,
        icon: Eye,
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        sub: 'vs last month',
    },
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0D1117] border border-white/10 rounded-xl px-3.5 py-2.5 shadow-xl">
                <p className="text-white/50 text-xs mb-1.5">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
                        {p.name === 'revenue' ? '$' : ''}{p.value.toLocaleString()}
                        <span className="text-white/30 text-xs ml-1">{p.name}</span>
                    </p>
                ))}
            </div>
        )
    }
    return null
}

const DashboardPage = () => {
    const [revenueRange, setRevenueRange] = useState<'6m' | '12m'>('12m')
    const displayData = revenueRange === '6m' ? revenueData.slice(6) : revenueData

    return (
        <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');`}</style>

            {/* ── Page header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[22px] font-semibold text-gray-900 leading-tight"
                        style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                        Good morning, John 👋
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">Here&apos;s what&apos;s happening with your store today.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden sm:block text-xs text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {STAT_CARDS.map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                                <card.icon size={16} className={card.iconColor} strokeWidth={2} />
                            </div>
                            <span className={`flex items-center gap-0.5 text-xs font-semibold
                                ${card.up ? 'text-emerald-500' : 'text-red-400'}`}>
                                {card.up
                                    ? <ArrowUpRight size={12} />
                                    : <ArrowDownRight size={12} />}
                                {card.change}
                            </span>
                        </div>
                        <p className="text-[22px] font-bold text-gray-900 leading-none mb-1">{card.value}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{card.label}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Revenue chart + Category pie ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Revenue area chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Revenue Overview</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Monthly revenue & order trends</p>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
                            {(['6m', '12m'] as const).map(r => (
                                <button key={r} onClick={() => setRevenueRange(r)}
                                    className={`px-2.5 py-1 rounded-md transition-all
                                        ${revenueRange === r ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {r === '6m' ? '6 Months' : '12 Months'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={displayData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#378ADD" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#378ADD" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34c57a" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#34c57a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="revenue" stroke="#378ADD" strokeWidth={2.5}
                                fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#378ADD', strokeWidth: 0 }} />
                            <Area type="monotone" dataKey="orders" name="orders" stroke="#34c57a" strokeWidth={2}
                                fill="url(#ordGrad)" dot={false} activeDot={{ r: 4, fill: '#34c57a', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="flex items-center gap-5 mt-3">
                        {[{ color: '#378ADD', label: 'Revenue ($)' }, { color: '#34c57a', label: 'Orders' }].map(l => (
                            <div key={l.label} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                                <span className="text-xs text-gray-400">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category pie */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">Sales by Category</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Revenue distribution</p>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                                paddingAngle={3} dataKey="value" strokeWidth={0}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v: any) => [`${v}%`, '']} contentStyle={{
                                background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 12, fontSize: 12, color: '#fff'
                            }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-1">
                        {categoryData.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                                <span className="text-xs text-gray-500 flex-1">{cat.name}</span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${cat.value}%`, background: cat.color }} />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 w-7 text-right">{cat.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Weekly orders bar + Top products ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Weekly orders */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">Orders This Week</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Daily order volume</p>
                    </div>
                    <ResponsiveContainer width="100%" height={170}>
                        <BarChart data={weeklyOrders} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={22}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="orders" name="orders" fill="#378ADD" radius={[6, 6, 0, 0]}>
                                {weeklyOrders.map((_, i) => (
                                    <Cell key={i} fill={i === 5 ? '#378ADD' : '#EBF4FF'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">169</p>
                            <p className="text-[10px] text-gray-400">This week</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">24.1</p>
                            <p className="text-[10px] text-gray-400">Daily avg</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-emerald-500">+18%</p>
                            <p className="text-[10px] text-gray-400">vs last wk</p>
                        </div>
                    </div>
                </div>

                {/* Top products */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Top Products</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Best performing this month</p>
                        </div>
                        <button className="text-xs text-[#378ADD] hover:text-[#185FA5] font-medium transition-colors">
                            View all →
                        </button>
                    </div>
                    <div className="space-y-1">
                        {/* Header */}
                        <div className="grid grid-cols-12 text-[10px] font-semibold uppercase tracking-wider text-gray-300 px-2 pb-1">
                            <span className="col-span-5">Product</span>
                            <span className="col-span-2 text-right">Sales</span>
                            <span className="col-span-3 text-right">Revenue</span>
                            <span className="col-span-2 text-right">Trend</span>
                        </div>
                        {topProducts.map((product, i) => (
                            <div key={product.name}
                                className="grid grid-cols-12 items-center px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                                    <span className="text-xs font-bold text-gray-200 w-4 flex-shrink-0">#{i + 1}</span>
                                    <div className="w-7 h-7 rounded-lg bg-[#EBF4FF] flex items-center justify-center flex-shrink-0">
                                        <Package size={12} className="text-[#378ADD]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                                        <p className="text-[10px] text-gray-400">{product.stock} in stock</p>
                                    </div>
                                </div>
                                <span className="col-span-2 text-xs font-semibold text-gray-700 text-right">{product.sales}</span>
                                <span className="col-span-3 text-xs font-semibold text-gray-700 text-right">
                                    ${product.revenue.toLocaleString()}
                                </span>
                                <span className={`col-span-2 flex items-center justify-end gap-0.5 text-xs font-semibold
                                    ${product.trend > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                    {product.trend > 0
                                        ? <ArrowUpRight size={12} />
                                        : <ArrowDownRight size={12} />}
                                    {Math.abs(product.trend)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Recent orders ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Latest customer purchases</p>
                    </div>
                    <button className="text-xs text-[#378ADD] hover:text-[#185FA5] font-medium transition-colors">
                        View all →
                    </button>
                </div>

                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 text-[10px] font-semibold uppercase tracking-wider text-gray-300 px-3 pb-2 border-b border-gray-50">
                    <span className="col-span-1">Order</span>
                    <span className="col-span-3">Customer</span>
                    <span className="col-span-4">Product</span>
                    <span className="col-span-1 text-right">Amount</span>
                    <span className="col-span-2 text-center">Status</span>
                    <span className="col-span-1 text-right">Time</span>
                </div>

                <div className="space-y-1 mt-1">
                    {recentOrders.map((order) => {
                        const status = STATUS_CONFIG[order.status as OrderStatus]
                        const StatusIcon = status.icon
                        return (
                            <div key={order.id}
                                className="grid grid-cols-12 items-center px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">

                                {/* Order ID */}
                                <span className="col-span-1 text-xs font-mono font-semibold text-gray-400 hidden md:block">
                                    {order.id.replace('#ORD-', '#')}
                                </span>

                                {/* Customer */}
                                <div className="col-span-5 md:col-span-3 flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#378ADD] to-[#185FA5] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                        {order.avatar}
                                    </div>
                                    <span className="text-xs font-medium text-gray-800 truncate">{order.customer}</span>
                                </div>

                                {/* Product */}
                                <span className="col-span-4 text-xs text-gray-500 truncate hidden md:block">
                                    {order.product}
                                </span>

                                {/* Amount */}
                                <span className="col-span-3 md:col-span-1 text-xs font-bold text-gray-900 text-right">
                                    ${order.amount.toFixed(2)}
                                </span>

                                {/* Status */}
                                <div className="col-span-2 flex justify-center">
                                    <span className={`hidden md:flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                                        <StatusIcon size={10} strokeWidth={2.5} />
                                        {status.label}
                                    </span>
                                    <StatusIcon size={14} className={`md:hidden ${status.color}`} strokeWidth={2} />
                                </div>

                                {/* Time */}
                                <span className="col-span-2 md:col-span-1 text-[10px] text-gray-300 text-right hidden md:block">
                                    {order.time}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Quick stats bottom row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-2">
                {[
                    { label: 'Pending Orders', value: '12', color: 'bg-amber-500', light: 'bg-amber-50 text-amber-600' },
                    { label: 'Low Stock Items', value: '7', color: 'bg-red-500', light: 'bg-red-50 text-red-600' },
                    { label: 'Avg. Order Value', value: '$66.00', color: 'bg-[#378ADD]', light: 'bg-blue-50 text-blue-600' },
                    { label: 'Return Rate', value: '2.4%', color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-600' },
                ].map(item => (
                    <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                        <div className={`w-2 self-stretch rounded-full ${item.color}`} />
                        <div>
                            <p className={`text-xl font-bold ${item.light.split(' ')[1]}`}>{item.value}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default DashboardPage