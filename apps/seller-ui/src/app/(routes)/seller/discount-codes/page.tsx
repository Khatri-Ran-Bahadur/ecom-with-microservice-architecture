"use client"
import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { toast } from 'react-hot-toast'
import {
    Spinner,
    TypeBadge,
    StatusBadge,
} from 'apps/seller-ui/src/app/shared/confirmation'
import DiscountModal from './_components/DiscountModal'
import { ConfirmModal } from 'packages/compoenents/ConfirmModal'

// ─── Types ────────────────────────────────────────────────────────────────────

type DiscountCode = {
    id: string
    public_name: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    discountCode: string
    usageLimit: number
    usedCount: number
    isActive: boolean
    expiryDate: string | null
    sellerId: string
    createdAt: string
    updatedAt: string
}



const DiscountCodesPage = () => {
    const [modalOpen, setModalOpen] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)
    const queryClient = useQueryClient()

    const { data, isLoading, isError } = useQuery<DiscountCode[]>({
        queryKey: ['discount-codes'],
        queryFn: async () => {
            const res = await axiosInstance.get(
                `products/api/get-discount-codes`
            )
            return res.data
        }
    })

    const discountCodes = Array.isArray(data)
        ? data
        : (data as any)?.discount_codes || [];


    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axiosInstance.delete(`products/api/delete-discount-code/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discount-codes'] })
            toast.success("Deleted successfully")
        },
        onError: () => {
            toast.error("Delete failed")
        }
    })

    const openCreate = () => { setEditingCode(null); setModalOpen(true) }
    const openEdit = (code: DiscountCode) => { setEditingCode(code); setModalOpen(true) }
    const closeModal = () => {
        setModalOpen(false)
        setEditingCode(null)
    }

    const closeDeleteModal = () => {
        setShowDeleteModal(false)
        setEditingCode(null)
    }

    const openDelete = (code: DiscountCode) => {
        setEditingCode(code)
        setShowDeleteModal(true)
    }

    const handleDeleteCode = () => {
        if (editingCode?.id) {
            deleteMutation.mutate(editingCode.id)
        }
        closeDeleteModal()
    }

    return (
        <div className="w-full min-h-screen bg-[#F5F4F0] px-6 py-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* Page Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#378ADD] inline-block" />
                        <span className="text-xs font-medium text-[#888] tracking-widest uppercase">Promotions</span>
                    </div>
                    <h1 className="text-[28px] text-black leading-tight"
                        style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                        Discount codes
                    </h1>
                    <p className="text-sm text-[#888] mt-1">Manage your coupons and promotional codes</p>
                </div>
                <button type="button" onClick={openCreate}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl bg-[#378ADD] hover:bg-[#185FA5] active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all">
                    <Plus size={16} />
                    New code
                </button>
            </div>

            {/* Table Card */}
            <div className="w-full bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">

                {isLoading && (
                    <div className="flex items-center justify-center py-20 text-[#999] text-sm gap-3">
                        <Spinner color="#378ADD" />
                        Loading codes...
                    </div>
                )}

                {isError && (
                    <div className="flex items-center justify-center py-20 text-sm text-red-500">
                        Failed to load discount codes. Please try again.
                    </div>
                )}

                {!isLoading && !isError && (!discountCodes || discountCodes.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#F5F4F0] flex items-center justify-center mb-4">
                            <Tag size={22} className="text-[#bbb]" />
                        </div>
                        <p className="text-sm font-medium text-[#555] mb-1">No discount codes yet</p>
                        <p className="text-xs text-[#aaa] mb-5">Create your first promotional code to get started</p>
                        <button type="button" onClick={openCreate}
                            className="flex items-center gap-1.5 text-sm text-[#378ADD] hover:text-[#185FA5] font-medium transition-colors">
                            <Plus size={14} /> Create one
                        </button>
                    </div>
                )}

                {!isLoading && discountCodes && discountCodes.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-black/[0.05]">
                                    {['Name', 'Code', 'Type', 'Value', 'Usage', 'Expiry', 'Status', ''].map((h) => (
                                        <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-[#999] tracking-wide whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {discountCodes.map((code: DiscountCode, i: number) => {
                                    const isExpired = code.expiryDate && new Date(code.expiryDate) < new Date()
                                    return (
                                        <tr key={code.id}
                                            className={`transition-colors hover:bg-[#FAFAFA] ${i !== discountCodes.length - 1 ? 'border-b border-black/[0.04]' : ''}`}>

                                            {/* Name */}
                                            <td className="px-5 py-4 font-medium text-black whitespace-nowrap">
                                                {code.public_name}
                                            </td>

                                            {/* Code */}
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-xs bg-[#F5F4F0] text-[#555] px-2.5 py-1 rounded-lg tracking-widest uppercase">
                                                    {code.discountCode}
                                                </span>
                                            </td>

                                            {/* Type */}
                                            <td className="px-5 py-4">
                                                <TypeBadge type={code.discountType} />
                                            </td>

                                            {/* Value */}
                                            <td className="px-5 py-4 font-medium text-[#333]">
                                                {code.discountType === 'percentage'
                                                    ? `${code.discountValue}%`
                                                    : `$${code.discountValue.toFixed(2)}`}
                                            </td>

                                            {/* Usage: usedCount / usageLimit */}
                                            <td className="px-5 py-4 text-[#666] tabular-nums whitespace-nowrap">
                                                {code.usedCount}
                                                <span className="text-[#bbb]">
                                                    {' / '}{code.usageLimit === 0 ? '∞' : code.usageLimit}
                                                </span>
                                            </td>

                                            {/* Expiry */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {code.expiryDate ? (
                                                    <span className={`text-xs ${isExpired ? 'text-red-400' : 'text-[#888]'}`}>
                                                        {isExpired ? '⚠ ' : ''}
                                                        {new Date(code.expiryDate).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-[#ccc]">No expiry</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <StatusBadge isActive={code.isActive} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button type="button" onClick={() => openEdit(code)}
                                                        className="p-2 rounded-lg text-[#aaa] hover:text-[#378ADD] hover:bg-blue-50 transition-colors"
                                                        title="Edit">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => openDelete(code)}
                                                        className="p-2 rounded-lg text-[#aaa] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                                                        title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer count */}
            {data && data.length > 0 && (
                <p className="text-xs text-[#bbb] mt-4 px-1">
                    {data.length} code{data.length !== 1 ? 's' : ''} total
                </p>
            )}

            {/* Modal */}
            <DiscountModal open={modalOpen} onClose={closeModal} editingCode={editingCode} />

            {/* delete confimation modal */}
            <ConfirmModal
                open={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteCode}
                isPending={deleteMutation.isPending}
                title="Delete Discount Code"
                description="Are you sure you want to delete this discount code?"
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
            />
        </div>
    )
}

export default DiscountCodesPage