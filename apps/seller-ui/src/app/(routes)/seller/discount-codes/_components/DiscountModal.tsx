"use client"
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { X, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import {
    FieldError,
    Spinner,
    inputClass,
    labelClass,
} from 'apps/seller-ui/src/app/shared/confirmation/index'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiscountCode = {
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

type FormData = {
    public_name: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    discountCode: string
    usageLimit: number
    isActive: boolean
    expiryDate: string
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DiscountModalProps {
    open: boolean
    onClose: () => void
    editingCode: DiscountCode | null
}

// ─── Component ────────────────────────────────────────────────────────────────

const DiscountModal = ({ open, onClose, editingCode }: DiscountModalProps) => {
    const queryClient = useQueryClient()
    const [serverError, setServerError] = useState<string | null>(null)
    const isEditing = !!editingCode

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            public_name: '',
            discountType: 'percentage',
            discountValue: 0,
            discountCode: '',
            usageLimit: 0,
            isActive: true,
            expiryDate: '',
        },
    })

    // Autofill on edit, reset on create
    useEffect(() => {
        if (editingCode) {
            reset({
                public_name: editingCode.public_name,
                discountType: editingCode.discountType,
                discountValue: editingCode.discountValue,
                discountCode: editingCode.discountCode,
                usageLimit: editingCode.usageLimit,
                isActive: editingCode.isActive,
                expiryDate: editingCode.expiryDate
                    ? new Date(editingCode.expiryDate).toISOString().split('T')[0]
                    : '',
            })
        } else {
            reset({
                public_name: '',
                discountType: 'percentage',
                discountValue: 0,
                discountCode: '',
                usageLimit: 0,
                isActive: true,
                expiryDate: '',
            })
        }
    }, [editingCode, reset])

    const isActiveVal = watch('isActive')

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            const payload = {
                ...data,
                expiryDate: data.expiryDate
                    ? new Date(data.expiryDate).toISOString()
                    : null,
            }
            const url = isEditing
                ? `/products/api/update-discount-code/${editingCode?.id}`
                : `/products/api/create-discount-code`
            const method = isEditing ? axiosInstance.put : axiosInstance.post
            const res = await method(url, payload)
            return res.data
        },
        onSuccess: () => {
            setServerError(null)
            queryClient.invalidateQueries({ queryKey: ['discount-codes'] })
            toast.success(isEditing ? 'Updated successfully' : 'Created successfully')
            reset()
            onClose()
        },
        onError: (error: AxiosError) => {
            const msg =
                (error.response?.data as any)?.message || 'Something went wrong.'
            setServerError(msg)
            toast.error(msg)
        },
    })

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-[520px] bg-white rounded-2xl border border-black/[0.07] p-8 shadow-xl max-h-[90vh] overflow-y-auto">

                {/* Close */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-5 right-5 text-[#aaa] hover:text-[#555] transition-colors p-1 rounded-lg hover:bg-black/5"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#378ADD] inline-block" />
                    <span className="text-xs font-medium text-[#888] tracking-widest uppercase">
                        {isEditing ? 'Edit coupon' : 'New coupon'}
                    </span>
                </div>
                <h2
                    className="text-[22px] text-black leading-tight mb-1"
                    style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
                >
                    {isEditing ? 'Update discount code' : 'Create discount code'}
                </h2>
                <p className="text-sm text-[#888] mb-7">
                    {isEditing
                        ? 'Modify the details below'
                        : 'Fill in the details to generate a new code'}
                </p>

                {serverError && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                        {serverError}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit((d) => mutation.mutate(d))}
                    className="space-y-4"
                >
                    {/* Public Name */}
                    <div>
                        <label className={labelClass}>Public name</label>
                        <input
                            type="text"
                            placeholder="e.g. Summer Sale"
                            {...register('public_name', {
                                required: 'Public name is required',
                            })}
                            className={inputClass(!!errors.public_name)}
                        />
                        <FieldError message={errors.public_name?.message} />
                    </div>

                    {/* Discount Code */}
                    <div>
                        <label className={labelClass}>Discount code</label>
                        <input
                            type="text"
                            placeholder="e.g. SUMMER20"
                            {...register('discountCode', {
                                required: 'Discount code is required',
                            })}
                            className={inputClass(!!errors.discountCode)}
                            style={{ textTransform: 'uppercase' }}
                        />
                        <FieldError message={errors.discountCode?.message} />
                    </div>

                    {/* Type + Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Discount type</label>
                            <select
                                {...register('discountType', { required: 'Required' })}
                                className={inputClass(!!errors.discountType) + ' cursor-pointer'}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed amount</option>
                            </select>
                            <FieldError message={errors.discountType?.message} />
                        </div>
                        <div>
                            <label className={labelClass}>Discount value</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="e.g. 20"
                                {...register('discountValue', {
                                    required: 'Value is required',
                                    min: { value: 0.01, message: 'Must be > 0' },
                                })}
                                className={inputClass(!!errors.discountValue)}
                            />
                            <FieldError message={errors.discountValue?.message} />
                        </div>
                    </div>

                    {/* Usage Limit + Expiry */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>
                                Usage limit{' '}
                                <span className="text-[#bbb] font-normal">(0 = unlimited)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 100"
                                {...register('usageLimit', {
                                    required: 'Required',
                                    min: { value: 0, message: 'Cannot be negative' },
                                })}
                                className={inputClass(!!errors.usageLimit)}
                            />
                            <FieldError message={errors.usageLimit?.message} />
                        </div>
                        <div>
                            <label className={labelClass}>
                                Expiry date{' '}
                                <span className="text-[#bbb] font-normal">(optional)</span>
                            </label>
                            <input
                                type="date"
                                {...register('expiryDate')}
                                className={inputClass(!!errors.expiryDate)}
                            />
                            <FieldError message={errors.expiryDate?.message} />
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[#FAFAFA] border border-black/[0.06]">
                        <div>
                            <p className="text-xs font-medium text-[#555]">Active status</p>
                            <p className="text-xs text-[#aaa] mt-0.5">
                                {isActiveVal
                                    ? 'Code is active and can be used'
                                    : 'Code is disabled'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setValue('isActive', !isActiveVal)}
                            className="flex-shrink-0 transition-colors"
                            aria-label="Toggle active"
                        >
                            {isActiveVal ? (
                                <ToggleRight size={34} className="text-[#378ADD]" strokeWidth={1.5} />
                            ) : (
                                <ToggleLeft size={34} className="text-[#ccc]" strokeWidth={1.5} />
                            )}
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full h-11 mt-1 rounded-xl bg-[#378ADD] hover:bg-[#185FA5] active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {mutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner />
                                {isEditing ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : isEditing ? (
                            'Update code'
                        ) : (
                            'Create code'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default DiscountModal