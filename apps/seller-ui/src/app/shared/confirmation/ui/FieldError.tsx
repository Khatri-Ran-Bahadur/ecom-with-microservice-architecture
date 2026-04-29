import React from 'react'

interface FieldErrorProps {
    message?: string
}

export const FieldError = ({ message }: FieldErrorProps) =>
    message ? (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5.5" stroke="#ef4444" />
                <path d="M6 3.5v3M6 8v.5" stroke="#ef4444" strokeLinecap="round" />
            </svg>
            {message}
        </p>
    ) : null
