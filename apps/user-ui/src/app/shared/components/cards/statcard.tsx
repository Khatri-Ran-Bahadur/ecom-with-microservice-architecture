"use client";
import React from "react";

interface StatCardProps {
    title: string;
    count: number | string;
    Icon: any;
    color: "blue" | "green" | "purple" | "red" | "orange" | "yellow" | "rose" | "teal";
    trend?: number; // percentage change, optional
    suffix?: string; // e.g. "$" or "items"
}

const colorMap: Record<string, { bg: string; text: string; ring: string; glow: string; accent: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100", glow: "shadow-blue-100", accent: "bg-blue-500" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100", glow: "shadow-emerald-100", accent: "bg-emerald-500" },
    purple: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100", glow: "shadow-violet-100", accent: "bg-violet-500" },
    red: { bg: "bg-red-50", text: "text-red-500", ring: "ring-red-100", glow: "shadow-red-100", accent: "bg-red-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-100", glow: "shadow-orange-100", accent: "bg-orange-500" },
    yellow: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100", glow: "shadow-amber-100", accent: "bg-amber-500" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100", glow: "shadow-rose-100", accent: "bg-rose-500" },
    teal: { bg: "bg-teal-50", text: "text-teal-600", ring: "ring-teal-100", glow: "shadow-teal-100", accent: "bg-teal-500" },
};

const StatCard: React.FC<StatCardProps> = ({ title, count, Icon, color, trend, suffix }) => {
    const c = colorMap[color] ?? colorMap.blue;

    return (
        <div className={`group relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:${c.glow} hover:border-transparent transition-all duration-300 overflow-hidden`}>
            {/* Background accent blob */}
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${c.bg} opacity-60 group-hover:scale-150 transition-transform duration-500`} />

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1.5">
                        {title}
                    </p>
                    <p className="text-2xl font-black text-slate-800 leading-none tracking-tight">
                        {suffix && <span className={`text-base font-bold ${c.text} mr-0.5`}>{suffix}</span>}
                        {typeof count === "number" ? count.toLocaleString() : count}
                    </p>
                    {trend !== undefined && (
                        <p className={`text-[11px] font-bold mt-1.5 ${trend >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% this month
                        </p>
                    )}
                </div>

                <div className={`w-11 h-11 rounded-xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={c.text} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;