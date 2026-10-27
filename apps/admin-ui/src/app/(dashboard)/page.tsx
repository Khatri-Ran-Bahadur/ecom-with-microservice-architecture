"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { DollarSign, Users, ShoppingCart, PackageOpen, Download, BarChart2 } from "lucide-react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
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

const kpis = [
  { label: "Total Revenue", value: "$284,291", Icon: DollarSign, color: "#3b82f6" },
  { label: "Active Users", value: "14,820", Icon: Users, color: "#8b5cf6" },
  { label: "Total Orders", value: "3,241", Icon: ShoppingCart, color: "#22c55e" },
  { label: "Active Products", value: "512", Icon: PackageOpen, color: "#f97316" },
];

// ISO numeric IDs to highlight
const HIGHLIGHT = {
  840: "#3b82f6", // USA
  124: "#22c55e", // Canada
  356: "#22c55e", // India
  826: "#3b82f6", // UK
  643: "#3b82f6", // Russia
  36: "#22c55e", // Australia
};

// ─────────────────────────────────────────────────────────────────────────────
// WORLD MAP (d3-geo + topojson)
// ─────────────────────────────────────────────────────────────────────────────
function WorldMap() {
  const [countries, setCountries] = useState([]);
  const [pathGen, setPathGen] = useState(null);
  const W = 700, H = 380;

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        const proj = geoMercator()
          .scale(100)
          .translate([W / 2, H / 1.55])
          .center([10, 15]);
        const gen = geoPath().projection(proj);
        const feats = feature(topo, topo.objects.countries).features;
        setPathGen(() => gen);
        setCountries(feats);
      });
  }, []);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
      {/* Ocean background */}
      <rect width={W} height={H} fill="var(--map-bg)" rx={8} />
      {countries.map((geo) => {
        const id = Number(geo.id);
        const fill = HIGHLIGHT[id] ?? "var(--map-bg)";
        const d = pathGen ? pathGen(geo) : "";
        return (
          <path
            key={geo.rsmKey ?? geo.id}
            d={d}
            fill={fill}
            stroke="var(--map-bg)"
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--tooltip-bg)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, padding: "10px 16px", color: "var(--tooltip-text)", fontSize: 13,
    }}>
      <p style={{ color: "var(--subtext)", marginBottom: 4, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>${(payload[0].value / 1000).toFixed(0)}K</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [range, setRange] = useState("7d");
  const [isDark, setIsDark] = useState(false);
  const theme = {
    bg: isDark ? "#080c18" : "#f5f5f5",
    text: isDark ? "#e2e8f0" : "#1a202c",
    subtext: isDark ? "#64748b" : "#718096",
    mapBg: isDark ? "#0a0e18" : "#e5e7eb",
    tooltipBg: isDark ? "#1e2a3a" : "#f5f5f5",
    tooltipText: isDark ? "#e2e8f0" : "#1a202c",
    cardBg: isDark ? "#0f1629" : "#f9fafb",
    cardBorder: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.1)",
  };
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div style={{
      background: theme.bg, minHeight: "100vh",
      padding: "32px 28px", fontFamily: "'DM Sans','Inter',sans-serif",
      color: "var(--text)", boxSizing: "border-box",
      '--bg': theme.bg,
      '--text': theme.text,
      '--card-bg': theme.cardBg,
      '--card-border': theme.cardBorder,
      '--subtext': theme.subtext,
      '--map-bg': theme.mapBg,
      '--tooltip-bg': theme.tooltipBg,
      '--tooltip-text': theme.tooltipText
    }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: "absolute",
        top: 16,
        right: 16,
        padding: "6px 12px",
        background: isDark ? "#374151" : "#e5e7eb",
        color: isDark ? "#fff" : "#1f2937",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
      }}>{isDark ? "Light Mode" : "Dark Mode"}</button>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--text)" }}>Overview</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--subtext)", fontWeight: 500 }}>
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnOutline}><Download size={14} /> Export Data</button>
          <button style={btnPrimary}><BarChart2 size={14} /> Generate Report</button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 24 }}>
        {kpis.map(({ label, value, Icon, color }) => (
          <div key={label} style={{ ...card, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--subtext)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={17} color={color} />
              </div>
            </div>
            <p style={{ margin: "14px 0 0", fontSize: 26, fontWeight: 800, color: "var(--text)" }}>{value}</p>
            <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, background: "#22c55e18", padding: "2px 8px", borderRadius: 20 }}>↑ Live</span>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at top right,${color}12,transparent 65%)`, pointerEvents: "none" }} />
          </div>
        ))}
      </div>

      {/* ── Row 1: Revenue Chart + Device Donut ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, marginBottom: 18 }}>

        {/* Revenue Area Chart */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Revenue</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--subtext)" }}>Last 6 months performance</p>
            </div>
            <select value={range} onChange={e => setRange(e.target.value)} style={selectStyle}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="365d">This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--subtext)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--subtext)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} width={46} />
              <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "rgba(59,130,246,0.3)", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#revGrad)" dot={false}
                activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Usage Donut */}
        <div style={{ ...card, display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Device Usage</p>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--subtext)" }}>How users access your platform</p>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={88}
                  dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {deviceData.map((_, i) => <Cell key={i} fill={DEVICE_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              {deviceData.map((d, i) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: DEVICE_COLORS[i], display: "inline-block" }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: World Map + Recent Orders ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 18 }}>

        {/* World Map */}
        <div style={card}>
          <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>User & Seller Distribution</p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--subtext)" }}>Visual breakdown of global user & seller activity.</p>
          <WorldMap />
        </div>

        {/* Recent Orders */}
        <div style={card}>
          <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Recent Orders</p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--subtext)" }}>A quick snapshot of your latest transactions.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--subtext)" }}>
                {["Order ID", "Customer", "Amount", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "var(--subtext)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => (
                <tr key={o.id}
                  style={{ borderBottom: i < recentOrders.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={td}>{o.id}</td>
                  <td style={td}>{o.customer}</td>
                  <td style={td}>{o.amount}</td>
                  <td style={td}>
                    <span style={{
                      color: statusColor[o.status],
                      background: statusColor[o.status] + "18",
                      padding: "3px 10px", borderRadius: 20,
                      fontSize: 12, fontWeight: 600,
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

// ── Shared styles ──────────────────────────────────────────────────────────
const card = {
  background: "var(--card-bg)",
  border: "var(--card-border)",
  borderRadius: 16,
  padding: "24px",
  boxSizing: "border-box",
};
const td = { padding: "12px 12px", color: "var(--subtext)", verticalAlign: "middle" };
const btnOutline = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  color: "var(--subtext)", cursor: "pointer",

};
const btnPrimary = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
  border: "none", color: "#fff", cursor: "pointer",
};
const selectStyle = {
  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, padding: "6px 12px", color: "var(--subtext)", fontSize: 13,
  cursor: "pointer", outline: "none",
};