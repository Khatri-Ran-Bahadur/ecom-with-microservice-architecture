"use client"
import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Package, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import {
    Spinner,
} from 'apps/seller-ui/src/app/shared/confirmation'
import { ConfirmModal } from 'packages/compoenents/ConfirmModal'

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
    id: string
    title: string
    short_description: string
    images: any[]
    regular_price: number
    sale_price: number
    stock: number
    status: 'Active' | 'Pending' | 'Draft'
    category: string
    createdAt: string
}

const ProductsPage = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['products', page, search, statusFilter],
        queryFn: async () => {
            const res = await axiosInstance.get(`products/api/get-products`, {
                params: {
                    page,
                    search,
                    status: statusFilter,
                    limit: 10
                }
            })
            return res.data
        }
    })

    const products = data?.products || []
    const pagination = data?.pagination || { total: 0, totalPages: 1 }

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axiosInstance.delete(`products/api/delete-product/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success("Product deleted successfully")
        },
        onError: () => {
            toast.error("Failed to delete product")
        }
    })

    const handleDelete = () => {
        if (selectedProduct) {
            deleteMutation.mutate(selectedProduct.id)
        }
        setShowDeleteModal(false)
    }

    const openDelete = (product: Product) => {
        setSelectedProduct(product)
        setShowDeleteModal(true)
    }

    return (
        <div className="w-full min-h-screen bg-[#F5F4F0] px-6 py-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* Page Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
                        <span className="text-xs font-medium text-[#888] tracking-widest uppercase">Inventory</span>
                    </div>
                    <h1 className="text-[28px] text-black leading-tight"
                        style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                        Products
                    </h1>
                    <p className="text-sm text-[#888] mt-1">Manage your product catalog and inventory</p>
                </div>
                <button 
                    type="button" 
                    onClick={() => router.push('/seller/products/create')}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all shadow-lg shadow-violet-100"
                >
                    <Plus size={16} />
                    Add Product
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full h-11 pl-11 pr-4 bg-white border border-black/[0.07] rounded-xl text-sm outline-none focus:border-violet-300 transition-all shadow-sm"
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="h-11 px-4 bg-white border border-black/[0.07] rounded-xl text-sm outline-none focus:border-violet-300 transition-all shadow-sm"
                >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>

            {/* Table Card */}
            <div className="w-full bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-[#999] text-sm gap-3">
                        <Spinner color="#8B5CF6" />
                        Loading products...
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center py-20 text-sm text-red-500">
                        Failed to load products. Please try again.
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#F5F4F0] flex items-center justify-center mb-4">
                            <Package size={22} className="text-[#bbb]" />
                        </div>
                        <p className="text-sm font-medium text-[#555] mb-1">No products found</p>
                        <p className="text-xs text-[#aaa] mb-5">Try adjusting your filters or search</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-black/[0.05]">
                                        <th className="px-6 py-4 text-left text-xs font-medium text-[#999] tracking-wide">Product</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-[#999] tracking-wide">Category</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-[#999] tracking-wide">Stock</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-[#999] tracking-wide">Price</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-[#999] tracking-wide">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-[#999] tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/[0.04]">
                                    {products.map((product: Product) => (
                                        <tr key={product.id} className="hover:bg-[#FAFAFA] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0 border border-black/[0.05]">
                                                        {product.images?.[0]?.url ? (
                                                            <Image 
                                                                src={product.images[0].url} 
                                                                alt={product.title} 
                                                                fill 
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package size={16} className="text-slate-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-slate-800 truncate max-w-[240px]">{product.title}</h3>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">ID: {product.id.slice(-8).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-600 font-medium">{product.category}</span>
                                            </td>
                                            <td className="px-6 py-4 tabular-nums">
                                                <span className={`${product.stock < 10 ? 'text-red-500 font-bold' : 'text-slate-600'}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">Rs.{product.sale_price || product.regular_price}</span>
                                                    {product.sale_price && product.sale_price < product.regular_price && (
                                                        <span className="text-[10px] text-slate-400 line-through tracking-tight">Rs.{product.regular_price}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <ProductStatusBadge status={product.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => router.push(`/seller/products/${product.id}`)}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => router.push(`/seller/products/edit/${product.id}`)}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openDelete(product)}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-black/[0.05] flex items-center justify-between">
                            <p className="text-xs text-[#aaa]">
                                Showing <span className="font-medium text-[#777]">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-[#777]">{Math.min(page * 10, pagination.total)}</span> of <span className="font-medium text-[#777]">{pagination.total}</span> products
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 rounded-lg border border-black/[0.07] text-[#777] disabled:opacity-30 hover:bg-[#FAFAFA] transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-bold text-slate-700 w-8 text-center">{page}</span>
                                <button 
                                    disabled={page >= pagination.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 rounded-lg border border-black/[0.07] text-[#777] disabled:opacity-30 hover:bg-[#FAFAFA] transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <ConfirmModal 
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Product"
                description={`Are you sure you want to delete "${selectedProduct?.title}"? This action cannot be undone.`}
                confirmLabel="Delete Product"
                cancelLabel="Cancel"
                variant="danger"
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}

const ProductStatusBadge = ({ status }: { status: string }) => {
    const config = {
        Active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        Pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
        Draft: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
    }[status as 'Active' | 'Pending' | 'Draft'] || { bg: 'bg-slate-50', text: 'text-slate-400', dot: 'bg-slate-300' }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight uppercase ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {status}
        </span>
    )
}

export default ProductsPage