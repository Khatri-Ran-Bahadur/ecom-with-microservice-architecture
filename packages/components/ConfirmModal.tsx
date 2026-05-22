"use client"
import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface SpinnerProps {
    color?: string
    size?: number
}

const Spinner = ({ color = 'white', size = 15 }: SpinnerProps) => (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
        <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
)

interface ConfirmModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    isPending?: boolean
    title?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning'
    pendingLabel?: string
}

export const ConfirmModal = ({
    open,
    onClose,
    onConfirm,
    isPending = false,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    variant = 'danger',
    pendingLabel = 'Deleting...',
}: ConfirmModalProps) => {
    if (!open) return null

    const isDanger = variant === 'danger'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300"
                onClick={!isPending ? onClose : undefined}
            />

            {/* Panel */}
            <div 
                className="relative w-full max-w-[360px] bg-white rounded-[24px] p-6 shadow-2xl border border-black/5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                {/* Close */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 disabled:opacity-40"
                >
                    <X size={16} />
                </button>

                {/* Icon */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-5
                    ${isDanger ? 'bg-red-50' : 'bg-amber-50'}`}>
                    <AlertTriangle
                        size={20}
                        className={isDanger ? 'text-red-500' : 'text-amber-500'}
                        strokeWidth={2}
                    />
                </div>

                {/* Content */}
                <div className="mb-8">
                    <h3
                        className="text-[19px] text-gray-900 leading-tight mb-2"
                        style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
                    >
                        {title}
                    </h3>
                    <p className="text-[14px] text-gray-500 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 h-11 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all disabled:opacity-40"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className={`flex-1 h-11 rounded-xl text-sm text-white font-medium transition-all active:scale-[0.98]
                            disabled:opacity-60 disabled:cursor-not-allowed shadow-sm
                            ${isDanger
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-amber-500 hover:bg-amber-600'
                            }`}
                    >
                        {isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size={14} />
                                {pendingLabel}
                            </span>
                        ) : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}