import React from 'react';

interface TitleBorderProps {
    className?: string;
}

const TitleBorder: React.FC<TitleBorderProps> = ({ className }) => {
    return (
        <div className={`pointer-events-none select-none ${className}`}>
            <svg
                width="100%"
                height="20"
                viewBox="0 0 100 20"
                fill="none"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0 15 Q 25 15, 50 5 T 100 5"
                    stroke="url(#gradient-line)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="transparent"
                />
                <defs>
                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" /> {/* Blue-500 */}
                        <stop offset="100%" stopColor="#10B981" /> {/* Emerald-500 */}
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default TitleBorder;