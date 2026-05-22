 "use client";

import { useState } from "react";
import { DollarSign, Users, ShoppingCart, PackageOpen, ArrowUpRight, ArrowDownRight, Download, BarChart2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import { useAdminTheme } from "../../context/AdminThemeContext";

export default function Index() {
  const [range, setRange] = useState("7d");
  const { accentClass } = useAdminTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["adminDashboardSummary", { range }],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/dashboard/summary", { params: { range } });
      return res.data as any;
    },
  });

  const kpis = data?.kpis;
  const recent = data?.recentOrders ?? [];

  const series = data?.series ?? [];
  const maxRevenue = series.length > 0 ? Math.max(...series.map((d: any) => d.revenue)) : 0;
  const maxYLimit = maxRevenue > 0 ? maxRevenue * 1.15 : 100;

  const points = series.map((d: any, index: number) => {
    const x = 40 + (index / Math.max(series.length - 1, 1)) * 440;
    const y = 200 - (d.revenue / maxYLimit) * 160;
    return { x, y, revenue: d.revenue, orders: d.orders, date: d.date };
  });

  const linePath = points.map((p: any, idx: number) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z` 
    : "";

  const gridLines = [
    { y: 40, val: maxYLimit },
    { y: 93.3, val: maxYLimit * 0.66 },
    { y: 146.6, val: maxYLimit * 0.33 },
    { y: 200, val: 0 }
  ];

  const formatYLabel = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${Math.round(val)}`;
  };

  const getXLabel = (dateStr: string, index: number, total: number) => {
    const date = new Date(dateStr);
    if (total <= 7) {
      return date.toLocaleDateString(undefined, { weekday: "short" });
    }
    if (total <= 30) {
      if (index % 5 === 0) {
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      }
      return "";
    }
    // 365d
    if (index % 60 === 0) {
      return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
    }
    return "";
  };

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * 500;
    
    const step = 440 / Math.max(points.length - 1, 1);
    const idx = Math.round((svgX - 40) / step);
    const boundedIdx = Math.max(0, Math.min(points.length - 1, idx));
    setHoveredIndex(boundedIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const hoverItem = hoveredIndex !== null ? points[hoveredIndex] : null;
  const tooltipLeft = hoverItem 
    ? hoverItem.x > 250 
      ? `calc(${hoverItem.x / 500 * 100}% - 170px)` 
      : `calc(${hoverItem.x / 500 * 100}% + 15px)`
    : "0px";

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Overview
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-300">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5">
            <BarChart2 className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Total Revenue", 
            value: isLoading ? "—" : `$${Number(kpis?.totalRevenue ?? 0).toFixed(2)}`, 
            trend: "Live", 
            trendUp: true,
            icon: DollarSign,
            color: "from-blue-600 to-cyan-500",
            bgHover: "hover:border-blue-500/50 dark:hover:border-blue-400/50"
          },
          { 
            label: "Active Users", 
            value: isLoading ? "—" : String(kpis?.totalUsers ?? 0), 
            trend: "Live", 
            trendUp: true,
            icon: Users,
            color: "from-indigo-600 to-purple-500",
            bgHover: "hover:border-indigo-500/50 dark:hover:border-indigo-400/50"
          },
          { 
            label: "Total Orders", 
            value: isLoading ? "—" : String(kpis?.totalOrders ?? 0), 
            trend: "Live", 
            trendUp: true,
            icon: ShoppingCart,
            color: "from-emerald-500 to-teal-400",
            bgHover: "hover:border-emerald-500/50 dark:hover:border-emerald-400/50"
          },
          { 
            label: "Active Products", 
            value: isLoading ? "—" : String(kpis?.totalProducts ?? 0), 
            trend: "Live", 
            trendUp: true,
            icon: PackageOpen,
            color: "from-rose-500 to-orange-400",
            bgHover: "hover:border-rose-500/50 dark:hover:border-rose-400/50"
          },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/50 ${stat.bgHover}`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} p-2.5 text-white shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-full h-full" />
              </div>
            </div>
            
            {/* Value row */}
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{stat.value}</h3>
              <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                stat.trendUp 
                  ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10" 
                  : "text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-400/10"
              }`}>
                {stat.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stat.trend}
              </div>
            </div>
            
            {/* Glow effect behind the card (visible on hover) */}
            <div className={`absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20 bg-gradient-to-br ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Chart Placeholder */}
        {/* Dynamic SVG Area/Line Chart */}
        <div className="lg:col-span-2 relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6 min-h-[450px] overflow-visible group flex flex-col justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] rounded-2xl" />
          
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Overview</h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {range === "7d" ? "Showing daily stats for the last week" : range === "30d" ? "Showing stats for the last 30 days" : "Showing statistics for the entire year"}
              </p>
            </div>
            <select 
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-slate-100/80 dark:bg-slate-800/80 border-none rounded-lg text-sm font-semibold py-1.5 px-3 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="365d">This Year</option>
            </select>
          </div>
          
          {isLoading ? (
            <div className="relative z-10 flex-1 flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" style={{ color: accentClass.hex }} />
                <p className="text-sm font-semibold text-slate-400">Loading data series…</p>
              </div>
            </div>
          ) : !data?.series || data.series.length === 0 ? (
            <div className="relative z-10 flex-1 flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-3 opacity-50">
                <BarChart2 className="w-12 h-12 mx-auto text-slate-400" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No chart data found for this period</p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex-1 w-full min-h-[300px] overflow-visible">
              {/* Tooltip Overlay */}
              {hoveredIndex !== null && points[hoveredIndex] && (
                <div 
                  className="absolute z-20 top-[60px] p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-slate-200/50 dark:border-slate-800/50 text-xs w-[160px] pointer-events-none transition-all duration-150 ease-out"
                  style={{ left: tooltipLeft }}
                >
                  <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                    {new Date(points[hoveredIndex].date).toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" })}
                  </p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white mb-0.5">
                    ${Number(points[hoveredIndex].revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentClass.hex }} />
                    <span>{points[hoveredIndex].orders} {points[hoveredIndex].orders === 1 ? 'order' : 'orders'}</span>
                  </div>
                </div>
              )}

              {/* Chart SVG */}
              <svg 
                viewBox="0 0 500 240" 
                className="w-full h-full overflow-visible"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  <linearGradient id={`gradient-${range}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentClass.hex} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={accentClass.hex} stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Horizontal Gridlines */}
                {gridLines.map((gl, i) => (
                  <g key={i} className="opacity-40 dark:opacity-20">
                    <line 
                      x1="40" 
                      y1={gl.y} 
                      x2="480" 
                      y2={gl.y} 
                      stroke="#94a3b8" 
                      strokeWidth="1" 
                      strokeDasharray={gl.y === 200 ? "0" : "4 4"}
                    />
                    <text 
                      x="32" 
                      y={gl.y + 4} 
                      textAnchor="end" 
                      className="fill-slate-400 dark:fill-slate-500 text-[10px] font-bold"
                    >
                      {formatYLabel(gl.val)}
                    </text>
                  </g>
                ))}

                {/* X Axis Labels */}
                {points.map((p: any, idx: number) => {
                  const label = getXLabel(p.date, idx, points.length);
                  if (!label) return null;
                  return (
                    <text 
                      key={idx} 
                      x={p.x} 
                      y="222" 
                      textAnchor="middle" 
                      className="fill-slate-400 dark:fill-slate-500 text-[10px] font-bold"
                    >
                      {label}
                    </text>
                  );
                })}

                {/* Area under the line */}
                {areaPath && (
                  <path 
                    d={areaPath} 
                    fill={`url(#gradient-${range})`}
                    className="transition-all duration-500"
                  />
                )}

                {/* The main stroke line */}
                {linePath && (
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke={accentClass.hex} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="transition-all duration-500"
                    filter="url(#glow)"
                  />
                )}

                {/* Interactive points & hover states */}
                {points.map((p: any, idx: number) => (
                  <g key={idx} className="group/dot">
                    {/* Render subtle static points only for shorter series like 7d, or always when hovered */}
                    {(points.length <= 7 || idx === hoveredIndex) && (
                      <>
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r={idx === hoveredIndex ? 6 : 3} 
                          fill={accentClass.hex} 
                          stroke="#ffffff" 
                          strokeWidth={idx === hoveredIndex ? 2.5 : 1}
                          className="transition-all duration-200 cursor-pointer"
                        />
                        {idx === hoveredIndex && (
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="12" 
                            fill="none" 
                            stroke={accentClass.hex} 
                            strokeWidth="1.5" 
                            className="animate-ping opacity-60 pointer-events-none"
                          />
                        )}
                      </>
                    )}
                  </g>
                ))}

                {/* Vertical hover guide line */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                  <line 
                    x1={points[hoveredIndex].x} 
                    y1="40" 
                    x2={points[hoveredIndex].x} 
                    y2="200" 
                    stroke={accentClass.hex} 
                    strokeWidth="1" 
                    strokeDasharray="3 3"
                    className="opacity-60 pointer-events-none"
                  />
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Recent Activity Sidebar Placeholder */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6 min-h-[450px]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h3>
          
          <div className="space-y-6">
            {(recent.length ? recent : Array.from({ length: 5 })).map((o: any, i: number) => (
              <div key={o?.id ?? i} className="flex gap-4 items-start relative before:absolute before:left-[19px] before:top-10 before:bottom-[-24px] before:w-px before:bg-slate-200 dark:before:bg-slate-800 last:before:hidden">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-950 flex items-center justify-center shrink-0 z-10 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                </div>
                <div className="space-y-1 pt-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Order{" "}
                    <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                      #{o?.id ? o.id.slice(-6).toUpperCase() : "—"}
                    </span>{" "}
                    was placed
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {o?.createdAt ? new Date(o.createdAt).toLocaleString() : "Loading…"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
