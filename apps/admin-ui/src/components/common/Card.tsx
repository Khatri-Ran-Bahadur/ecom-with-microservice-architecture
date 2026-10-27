import React from "react";

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  color: string; // Tailwind gradient classes e.g. "from-blue-600 to-cyan-500"
  bgHover?: string; // optional hover border class
}

export const Card: React.FC<CardProps> = ({
  icon,
  label,
  value,
  trend,
  trendUp,
  color,
  bgHover,
}) => (
  <div
    className={`rounded-xl bg-gradient-to-r ${color} p-6 shadow-lg transition ${
      bgHover ? `hover:${bgHover}` : ""
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="text-white text-3xl">{icon}</div>
      <div className="text-right">
        <p className="text-sm text-white/80">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p className={`text-sm ${trendUp ? "text-green-200" : "text-red-200"}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  </div>
);
