"use client";

import { useState, useRef, useEffect } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { DollarSign, Users, ShoppingCart, PackageOpen, ArrowUpRight, Download, BarChart2 } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// ── Mock Data ─────────────────────────────────────────────────────────────
const revenueData = [
    { month: "Jan", revenue: 28000 },
    { month: "Feb", revenue: 42000 },
    { month: "Mar", revenue: 35000 },
    { month: "Apr", revenue: 51000 },
    { month: "May", revenue: 95000 },
    { month: "Jun", revenue: 130000 },
    { month: "Jul", revenue: 112000 },
];

const deviceData = [
    { name: "Phone", value: 45 },
    { name: "Tablet", value: 25 },
    { name: "Computer", value: 30 },
];
const DEVICE_COLORS = ["#22c55e", "#eab308", "#3b82f6"];

const recentOrders = [
    { id: "ORD-001", customer: "John Doe", amount: "$250", status: "Paid" },
    { id: "ORD-002", customer: "Jane Smith", amount: "$180", status: "Pending" },
    { id: "ORD-003", customer: "Alice Johnson", amount: "$340", status: "Paid" },
    { id: "ORD-004", customer: "Bob Lee", amount: "$90", status: "Failed" },
    { id: "ORD-005", customer: "Bob Lee", amount: "$90", status: "Failed" },
    { id: "ORD-006", customer: "Bob Lee", amount: "$90", status: "Failed" },
];

const statusColor = { Paid: "#22c55e", Pending: "#eab308", Failed: "#ef4444" };

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const highlightCountries = {
    "840": "#3b82f6",  // USA
    "124": "#22c55e",  // Canada
    "356": "#22c55e",  // India
    "826": "#3b82f6",  // UK
};

// ── Custom Tooltip for Area Chart ─────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#1e2a3a", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "10px 16px", color: "#e2e8f0",
            fontSize: 13, fontFamily: "inherit",
        }}>
            <p style={{ color: "#94a3b8", marginBottom: 4, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <p style={{ fontWeight: 700, fontSize: 16 }}>
                ${(payload[0].value / 1000).toFixed(0)}K
            </p>
        </div>
    );
};

// ── KPI Cards ─────────────────────────────────────────────────────────────
const kpis = [
    { label: "Total Revenue", value: "$284,291", Icon: DollarSign, color: "#3b82f6" },
    { label: "Active Users", value: "14,820", Icon: Users, color: "#8b5cf6" },
    { label: "Total Orders", value: "3,241", Icon: ShoppingCart, color: "#22c55e" },
    { label: "Active Products", value: "512", Icon: PackageOpen, color: "#f97316" },
];

// ── Main Component ────────────────────────────────────────────────────────
export default function Dashboard() {
    const [hovered, setHovered] = useState(null);

    return (
        <div style={{
            background: "#080c18",
            minHeight: "100vh",
            padding: "32px 28px",
            fontFamily: "'DM Sans', 'Inter', sans-serif",
            color: "#e2e8f0",
            boxSizing: "border-box",
        }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>Overview</h1>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                        Welcome back! Here's what's happening with your store today.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button style={btnOutline}><Download size={14} /> Export Data</button>
                    <button style={btnPrimary}><BarChart2 size={14} /> Generate Report</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 28 }}>
                {kpis.map(({ label, value, Icon, color }) => (
                    <div key={label} style={{ ...card, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon size={18} color={color} />
                            </div>
                        </div>
                        <p style={{ margin: "14px 0 0", fontSize: 26, fontWeight: 800, color: "#f1f5f9" }}>{value}</p>
                        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at top right, ${color}12, transparent 65%)`, pointerEvents: "none" }} />
                    </div>
                ))}
            </div>

            {/* ── TOP CHARTS ROW: Revenue + Device Usage ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, marginBottom: 18 }}>

                {/* Revenue Area Chart */}
                <div style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>Revenue</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>Last 6 months performance</p>
                        </div>
                        <select style={selectStyle}>
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: "#64748b", fontSize: 12, fontFamily: "inherit" }}
                                axisLine={false} tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "inherit" }}
                                axisLine={false} tickLine={false}
                                tickFormatter={(v) => `$${v / 1000}K`}
                                width={48}
                            />
                            <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "rgba(59,130,246,0.3)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                fill="url(#revGrad)"
                                dot={false}
                                activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Device Usage Donut */}
                <div style={{ ...card, display: "flex", flexDirection: "column" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>Device Usage</p>
                    <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>How users access your platform</p>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <PieChart width={200} height={200}>
                            <Pie
                                data={deviceData}
                                cx={100} cy={100}
                                innerRadius={58} outerRadius={90}
                                dataKey="value"
                                paddingAngle={3}
                                strokeWidth={0}
                            >
                                {deviceData.map((_, i) => <Cell key={i} fill={DEVICE_COLORS[i]} />)}
                            </Pie>
                        </PieChart>
                        <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
                            {deviceData.map((d, i) => (
                                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
                                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: DEVICE_COLORS[i], display: "inline-block" }} />
                                    {d.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BOTTOM CHARTS ROW: World Map + Recent Orders ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 18 }}>

                {/* World Map */}
                <div style={card}>
                    <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>User & Seller Distribution</p>
                    <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>Visual breakdown of global user & seller activity.</p>
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: 120, center: [10, 20] }}
                        style={{ width: "100%", height: 280 }}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const numId = geo.id;
                                    const highlight = highlightCountries[numId];
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={highlight || "#1e2a3a"}
                                            stroke="#0a0e1a"
                                            strokeWidth={0.5}
                                            style={{
                                                default: { outline: "none" },
                                                hover: { fill: highlight ? highlight : "#2d3f55", outline: "none" },
                                                pressed: { outline: "none" },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ComposableMap>
                </div>

                {/* Recent Orders Table */}
                <div style={card}>
                    <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>Recent Orders</p>
                    <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>A quick snapshot of your latest transactions.</p>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                                {["Order ID", "Customer", "Amount", "Status"].map((h) => (
                                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#64748b", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((o, i) => (
                                <tr key={o.id} style={{ borderBottom: i < recentOrders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={td}>{o.id}</td>
                                    <td style={td}>{o.customer}</td>
                                    <td style={td}>{o.amount}</td>
                                    <td style={td}>
                                        <span style={{
                                            color: statusColor[o.status],
                                            background: statusColor[o.status] + "18",
                                            padding: "3px 10px",
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}>{o.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

// ── Shared styles ─────────────────────────────────────────────────────────
const card = {
    background: "#0f1629",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "24px",
    boxSizing: "border-box",
};

const td = {
    padding: "12px 12px",
    color: "#cbd5e1",
    verticalAlign: "middle",
};

const btnOutline = {
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#cbd5e1", cursor: "pointer",
};

const btnPrimary = {
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    border: "none", color: "#fff", cursor: "pointer",
};

const selectStyle = {
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "6px 12px", color: "#cbd5e1", fontSize: 13,
    cursor: "pointer", outline: "none",
};