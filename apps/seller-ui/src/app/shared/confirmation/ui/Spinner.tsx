import React from 'react'

interface SpinnerProps {
    color?: string
    size?: number
}

export const Spinner = ({ color = 'white', size = 15 }: SpinnerProps) => (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
        <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
)