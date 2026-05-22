import React from 'react';
import TitleBorder from 'apps/user-ui/src/assets/svgs/title-border';

interface SectionTitleProps {
    title: string;
    subtitle?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle }) => {
    return (
        <div className="relative inline-flex flex-col group">
            {subtitle && (
                <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-1">
                    {subtitle}
                </span>
            )}

            <h1 className="relative z-10 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                {title}
            </h1>

            {/* Modern Accent Border */}
            <TitleBorder className="absolute -bottom-2 left-0 w-full h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Optional: Decorative Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-emerald-100 blur-lg -z-10 opacity-0 group-hover:opacity-50 transition-opacity" />
        </div>
    );
};

export default SectionTitle;