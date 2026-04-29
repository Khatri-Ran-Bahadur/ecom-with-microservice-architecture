import React from 'react'

interface StatusBadgeProps {
    isActive: boolean
}

export const StatusBadge = ({ isActive }: StatusBadgeProps) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium
        ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
        {isActive ? 'Active' : 'Inactive'}
    </span>
)