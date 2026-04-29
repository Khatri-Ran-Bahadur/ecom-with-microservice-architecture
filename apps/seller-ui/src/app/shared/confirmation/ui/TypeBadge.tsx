import React from 'react'
import { Percent, Hash } from 'lucide-react'

interface TypeBadgeProps {
    type: string
}

export const TypeBadge = ({ type }: TypeBadgeProps) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium
        ${type === 'percentage' ? 'bg-blue-50 text-[#378ADD]' : 'bg-emerald-50 text-emerald-600'}`}>
        {type === 'percentage' ? <Percent size={10} /> : <Hash size={10} />}
        {type === 'percentage' ? 'Percentage' : 'Fixed'}
    </span>
)
