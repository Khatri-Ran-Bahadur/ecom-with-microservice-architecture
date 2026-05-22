"use client"
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
    ChevronLeft, Package, User, Mail, MapPin, 
    CreditCard, Calendar, ShoppingBag, ArrowLeft,
    Clock, CheckCircle2, XCircle, Truck, ExternalLink, Tag
} from 'lucide-react'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { format } from 'date-fns'
import { Spinner } from 'apps/seller-ui/src/app/shared/confirmation'
import { toast } from 'react-hot-toast'

const STATUS_CONFIG: any = {
    Paid: { label: 'Paid', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    Ordered: { label: 'Ordered', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    Packed: { label: 'Packed', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', dot: 'bg-indigo-500' },
    'Out For Delivery': { label: 'Out For Delivery', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
}

const OrderDetailPage = () => {
    const { id } = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [newStatus, setNewStatus] = React.useState('')

    const { data, isLoading, isError } = useQuery({
        queryKey: ['seller-order', id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/order/api/get-seller-order/${id}`)
            return res.data.data
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            await axiosInstance.put(`/order/api/update-order-status/${id}`, { 
                status, 
                deliveryStatus: status 
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-order', id] })
            toast.success('Order status updated successfully')
        },
        onError: () => {
            toast.error('Failed to update order status')
        }
    })

    const handleStatusUpdate = () => {
        if (!newStatus) return
        updateStatusMutation.mutate(newStatus)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Spinner color="#3B82F6" />
                <p className="text-sm text-slate-400 animate-pulse">Loading order details...</p>
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
                    <XCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Order Not Found</h2>
                <p className="text-sm text-slate-400 mb-6 max-w-xs">We couldn't find the order you're looking for. It might have been deleted or moved.</p>
                <button 
                    onClick={() => router.push('/seller/orders')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                >
                    <ArrowLeft size={16} />
                    Back to Orders
                </button>
            </div>
        )
    }

    const order = data
    const status = STATUS_CONFIG[order.status] || { label: order.status, color: 'text-slate-600', bg: 'bg-slate-50', dot: 'bg-slate-400', icon: Clock }
    const StatusIcon = status.icon

    // Tracking bar stages
    const STAGES = [
        { key: 'Ordered', label: 'Ordered', icon: ShoppingBag },
        { key: 'Packed', label: 'Packed', icon: Package },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'Out For Delivery', label: 'Out For Delivery', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    ]

    const currentStageIndex = STAGES.findIndex(s => s.key.toLowerCase() === (order.deliveryStatus || 'Ordered').toLowerCase())
    const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex

    return (
        <div className="w-full min-h-screen bg-[#F5F4F0] px-4 md:px-8 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 rounded-xl bg-white border border-black/[0.07] text-slate-400 hover:text-slate-800 hover:border-black/[0.15] transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-none mb-1">
                            Order <span className="font-mono text-slate-400 text-xl font-medium">#{order.id.slice(-8).toUpperCase()}</span>
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Calendar size={12} />
                            <span>Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy p')}</span>
                        </div>
                    </div>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider ${status.bg} ${status.color} border border-current opacity-70`}>
                    <StatusIcon size={14} />
                    {status.label}
                </div>
            </div>

            {/* Tracking Progress Bar */}
            <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-8 mb-8">
                <div className="relative flex items-center justify-between">
                    {/* Progress Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-0" />
                    <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0" 
                        style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
                    />

                    {STAGES.map((stage, idx) => {
                        const Icon = stage.icon
                        const isCompleted = idx <= activeIndex
                        const isActive = idx === activeIndex

                        return (
                            <div key={stage.key} className="relative z-10 flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 
                                    ${isCompleted ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-slate-50 text-slate-300'}`}>
                                    <Icon size={20} />
                                </div>
                                <div className="absolute top-14 text-center whitespace-nowrap">
                                    <p className={`text-[11px] font-bold uppercase tracking-tight
                                        ${isActive ? 'text-emerald-600' : isCompleted ? 'text-slate-600' : 'text-slate-300'}`}>
                                        {stage.label}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="h-6" /> {/* Spacer for labels */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Order Items & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Items Section */}
                    <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-black/[0.05] bg-[#FAFAFA] flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <ShoppingBag size={16} className="text-slate-400" />
                                Order Items
                            </h3>
                            <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-lg border border-black/[0.05]">
                                {order.items?.length || 0} Products
                            </span>
                        </div>
                        <div className="divide-y divide-black/[0.04]">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="p-6 flex items-start gap-4 hover:bg-[#FAFAFA] transition-colors">
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-black/[0.05] flex-shrink-0">
                                        {item.product?.images?.[0]?.url ? (
                                            <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={20} className="text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800 text-sm truncate">{item.product?.title || 'Product Deleted'}</h4>
                                        <p className="text-xs text-slate-400 mt-1">Quantity: {item.quantity}</p>
                                        
                                        {/* Selected Options */}
                                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => {
                                                    const isColor = key.toLowerCase() === 'color' && typeof value === 'string' && value.startsWith('#')
                                                    return (
                                                        <span key={key} className="group relative flex items-center gap-2 text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-lg border border-black/[0.03] hover:bg-white hover:shadow-sm transition-all cursor-default">
                                                            <span className="font-bold opacity-70 uppercase tracking-tighter">{key}:</span>
                                                            {isColor ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div 
                                                                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm transition-transform group-hover:scale-125" 
                                                                        style={{ backgroundColor: value }} 
                                                                    />
                                                                    <span className="font-mono group-hover:text-slate-900 transition-colors">{value}</span>
                                                                    
                                                                    {/* Tooltip Overlay */}
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-20">
                                                                        <div className="w-20 h-1 rounded-full mb-1" style={{ backgroundColor: value }} />
                                                                        {value}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="font-bold text-slate-700">{value}</span>
                                                            )}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 text-sm">Rs.{(item.price * item.quantity).toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Rs.{item.price.toLocaleString()} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Summary Footer */}
                        <div className="bg-[#FAFAFA] px-6 py-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="text-slate-800 font-medium">Rs.{(order.total + (order.discountAmount || 0)).toLocaleString()}</span>
                            </div>
                            
                            {/* Coupon Info */}
                            {order.couponCode && (
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                        <Tag size={14} />
                                        <span>Coupon ({order.couponCode})</span>
                                    </div>
                                    <span className="text-emerald-600 font-medium">- Rs.{order.discountAmount?.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Shipping</span>
                                <span className="text-slate-800 font-medium">Rs.0.00</span>
                            </div>
                            <div className="pt-3 border-t border-black/[0.05] flex justify-between items-end">
                                <span className="text-slate-800 font-bold">Total Amount</span>
                                <span className="text-2xl font-black text-[#378ADD]">Rs.{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6 flex flex-wrap gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-300 mb-0.5">Payment Method</p>
                                <p className="text-sm font-bold text-slate-800">Online Payment</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'} flex items-center justify-center`}>
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-300 mb-0.5">Payment Status</p>
                                <p className={`text-sm font-bold ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {order.paymentStatus}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer & Shipping */}
                <div className="space-y-6">
                    
                    {/* Customer Profile */}
                    <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <User size={16} className="text-slate-400" />
                            Customer Information
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg font-black shadow-lg">
                                {order.user?.name?.substring(0, 2).toUpperCase() || 'C'}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{order.user?.name}</h4>
                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-pointer">
                                    <Mail size={12} />
                                    {order.user?.email}
                                </p>
                            </div>
                        </div>
                        <button 
                            className="w-full py-2.5 rounded-xl border border-black/[0.07] text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <ExternalLink size={14} />
                            View Customer Profile
                        </button>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <MapPin size={16} className="text-slate-400" />
                            Shipping Address
                        </h3>
                        {order.shippingAddress ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-[#FAFAFA] rounded-xl border border-black/[0.03]">
                                    <p className="text-sm font-bold text-slate-800 mb-1">{order.shippingAddress.name}</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {order.shippingAddress.street},<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip},<br />
                                        {order.shippingAddress.country}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                                <XCircle size={16} className="text-amber-500" />
                                <p className="text-xs font-medium text-amber-700">No shipping info provided</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-900/20">
                        <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            Order Fulfillment
                        </h3>
                        <div className="space-y-3">
                            <select 
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full h-11 px-4 bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-slate-800 text-white">Update Status</option>
                                <option value="Ordered" className="bg-slate-800 text-white">Ordered</option>
                                <option value="Packed" className="bg-slate-800 text-white">Packed</option>
                                <option value="shipped" className="bg-slate-800 text-white">Shipped</option>
                                <option value="Out For Delivery" className="bg-slate-800 text-white">Out For Delivery</option>
                                <option value="delivered" className="bg-slate-800 text-white">Delivered</option>
                                <option value="cancelled" className="bg-slate-800 text-white text-red-400">Cancelled</option>
                            </select>
                            <button 
                                onClick={handleStatusUpdate}
                                disabled={!newStatus || updateStatusMutation.isPending}
                                className="w-full h-11 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {updateStatusMutation.isPending && <Spinner color="#000" />}
                                Save Fulfillment Changes
                            </button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default OrderDetailPage
