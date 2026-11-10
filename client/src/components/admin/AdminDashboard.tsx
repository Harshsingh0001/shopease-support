import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  Package,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Play,
  Pause,
  RefreshCw,
  Award,
} from "lucide-react";
import type { Order, Ticket, Product } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

interface AdminDashboardProps {
  orders: Order[];
  tickets: Ticket[];
  products: Product[];
  onNavigateToTab: (tab: any) => void;
}

type TimeRange = "today" | "7d" | "30d" | "90d";
type MetricView = "volume" | "revenue";

interface TrendPoint {
  label: string;
  tickets: number;
  aiResolved: number;
  revenue: number;
  latencyMs: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  tickets,
  products,
  onNavigateToTab,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  // Time Range & Metric Toggle
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [metricView, setMetricView] = useState<MetricView>("volume");

  // Chart Interactive Hover States
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Live Stream Pause / Resume
  const [isStreamLive, setIsStreamLive] = useState(true);
  const [streamFilter, setStreamFilter] = useState<"all" | "ai" | "order" | "ticket">("all");

  // Agent Table Sort
  const [agentSortBy, setAgentSortBy] = useState<"tickets" | "resolution" | "csat">("tickets");

  const openTickets = tickets.filter((tkt) => tkt.status === "open").length;
  const inProgressTickets = tickets.filter((tkt) => tkt.status === "in_progress").length;
  const resolvedTickets = tickets.filter((tkt) => tkt.status === "resolved" || tkt.status === "closed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Dynamic Trend Points based on selected Time Range
  const trendData: Record<TimeRange, TrendPoint[]> = useMemo(() => {
    return {
      today: [
        { label: "09:00", tickets: 18, aiResolved: 17, revenue: 24500, latencyMs: 780 },
        { label: "11:00", tickets: 42, aiResolved: 40, revenue: 68000, latencyMs: 810 },
        { label: "13:00", tickets: 65, aiResolved: 61, revenue: 112000, latencyMs: 840 },
        { label: "15:00", tickets: 88, aiResolved: 83, revenue: 145000, latencyMs: 790 },
        { label: "17:00", tickets: 110, aiResolved: 104, revenue: 198000, latencyMs: 815 },
        { label: "19:00", tickets: 74, aiResolved: 70, revenue: 132000, latencyMs: 825 },
        { label: "21:00", tickets: 35, aiResolved: 33, revenue: 54000, latencyMs: 805 },
      ],
      "7d": [
        { label: "Mon", tickets: 142, aiResolved: 134, revenue: 215000, latencyMs: 810 },
        { label: "Tue", tickets: 168, aiResolved: 159, revenue: 278000, latencyMs: 825 },
        { label: "Wed", tickets: 195, aiResolved: 184, revenue: 340000, latencyMs: 795 },
        { label: "Thu", tickets: 182, aiResolved: 171, revenue: 295000, latencyMs: 830 },
        { label: "Fri", tickets: 224, aiResolved: 212, revenue: 412000, latencyMs: 805 },
        { label: "Sat", tickets: 260, aiResolved: 246, revenue: 498000, latencyMs: 815 },
        { label: "Sun", tickets: 238, aiResolved: 224, revenue: 445000, latencyMs: 820 },
      ],
      "30d": [
        { label: "Week 1", tickets: 980, aiResolved: 924, revenue: 1650000, latencyMs: 812 },
        { label: "Week 2", tickets: 1140, aiResolved: 1075, revenue: 1940000, latencyMs: 820 },
        { label: "Week 3", tickets: 1280, aiResolved: 1208, revenue: 2210000, latencyMs: 805 },
        { label: "Week 4", tickets: 1410, aiResolved: 1332, revenue: 2480000, latencyMs: 818 },
      ],
      "90d": [
        { label: "Month 1", tickets: 4200, aiResolved: 3950, revenue: 7100000, latencyMs: 822 },
        { label: "Month 2", tickets: 4850, aiResolved: 4570, revenue: 8400000, latencyMs: 815 },
        { label: "Month 3", tickets: 5600, aiResolved: 5280, revenue: 9950000, latencyMs: 808 },
      ],
    };
  }, []);

  const activeTrendPoints = trendData[timeRange];

  // Resolution Channels Breakdown
  const resolutionChannels = [
    {
      id: "ai",
      label: "AI Autonomous (Grounded RAG)",
      percentage: 94.2,
      count: 1482,
      color: theme === "dark" ? "#d9a83e" : "#AB644B",
      accentBg: theme === "dark" ? "bg-[#d9a83e]/15 text-[#f5e7bf]" : "bg-[#AB644B]/15 text-[#AB644B]",
    },
    {
      id: "human",
      label: "Frontline Agent Handled",
      percentage: 4.6,
      count: 72,
      color: "#3b82f6",
      accentBg: "bg-blue-500/15 text-blue-500",
    },
    {
      id: "escalated",
      label: "Supervisor Escalated",
      percentage: 1.2,
      count: 19,
      color: "#f59e0b",
      accentBg: "bg-amber-500/15 text-amber-500",
    },
  ];

  // Top Ticket Categories
  const categoryBreakdown = [
    { name: "Order Tracking & Delhivery AWB", count: 542, pct: 38, avgResolution: "18s" },
    { name: "Return Claims & Doorstep Pickup", count: 371, pct: 26, avgResolution: "42s" },
    { name: "Hardware Defect & 1-Yr Warranty", count: 228, pct: 16, avgResolution: "1m 15s" },
    { name: "Payment Debited / GST Invoice", count: 171, pct: 12, avgResolution: "35s" },
    { name: "Product Specs & Compatibility", count: 114, pct: 8, avgResolution: "12s" },
  ];

  // Agent Productivity Scorecard
  const agentScorecards = [
    {
      name: "ShopEase Grounded AI Copilot",
      role: "Autonomous RAG Engine",
      ticketsHandled: 1482,
      aht: "< 820ms",
      resolutionRate: 98.4,
      csat: 4.92,
      status: "Active 24/7",
      isAi: true,
    },
    {
      name: "Priya Sharma",
      role: "Support Specialist (Agent)",
      ticketsHandled: 84,
      aht: "2m 45s",
      resolutionRate: 94.8,
      csat: 4.86,
      status: "Online • Taking Calls",
      isAi: false,
    },
    {
      name: "Aditi Verma",
      role: "Operations Supervisor",
      ticketsHandled: 26,
      aht: "4m 12s",
      resolutionRate: 96.2,
      csat: 4.90,
      status: "Online • Supervising",
      isAi: false,
    },
  ].sort((a, b) => {
    if (agentSortBy === "tickets") return b.ticketsHandled - a.ticketsHandled;
    if (agentSortBy === "resolution") return b.resolutionRate - a.resolutionRate;
    if (agentSortBy === "csat") return b.csat - a.csat;
    return 0;
  });

  // Live Activity Events
  const liveEvents = [
    { id: 1, text: "Customer Aman Gupta verified order #ORD-1001 tracking status via AI", time: "Just now", type: "ai" },
    { id: 2, text: "Grounded 7-Day Replacement Policy referenced for Studio Wireless Headphones", time: "2m ago", type: "ai" },
    { id: 3, text: "Delhivery Express webhook updated dispatch transit for ORD-1002", time: "5m ago", type: "order" },
    { id: 4, text: "Escalated ticket #TKT-1001 assigned to senior support specialist Priya Sharma", time: "8m ago", type: "ticket" },
    { id: 5, text: "Supervisor Aditi Verma approved bank refund for order #ORD-1003", time: "14m ago", type: "ticket" },
  ].filter((e) => streamFilter === "all" || e.type === streamFilter);

  // SVG Area / Line Chart Computations
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 30;

  const currentValues = activeTrendPoints.map((p) =>
    metricView === "volume" ? p.tickets : p.revenue
  );
  const maxVal = Math.max(...currentValues, 1);
  const minVal = Math.min(...currentValues, 0);

  const getX = (index: number) =>
    paddingX + (index / (activeTrendPoints.length - 1)) * (chartWidth - paddingX * 2);

  const getY = (val: number) =>
    chartHeight -
    paddingY -
    ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - paddingY * 2);

  const polylinePoints = activeTrendPoints
    .map((p, idx) => `${getX(idx)},${getY(metricView === "volume" ? p.tickets : p.revenue)}`)
    .join(" ");

  const areaPoints = `${getX(0)},${chartHeight - paddingY} ${polylinePoints} ${getX(
    activeTrendPoints.length - 1
  )},${chartHeight - paddingY}`;

  const kpis = [
    {
      title: "Store Catalogue",
      value: products.length.toString(),
      subValue: "Active Inventory SKUs",
      change: "100% In-Stock",
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Gross Orders & GMV",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      subValue: `${orders.length} placed orders`,
      change: "+24% this week",
      icon: ShoppingBag,
      color: "text-emerald-500",
    },
    {
      title: "Unresolved Tickets",
      value: openTickets.toString(),
      subValue: `${inProgressTickets} active • ${resolvedTickets} resolved`,
      change: "91% SLA On-track",
      icon: AlertTriangle,
      color: "text-amber-500",
    },
    {
      title: "Autonomous AI Rate",
      value: "94.2%",
      subValue: "5.8% agent escalation",
      change: "Sub-second SLA",
      icon: Sparkles,
      color: t.accentText,
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto h-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <span>Executive Operations Command Center</span>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${t.badgeHighlight}`}>
              Interactive Analytics
            </span>
          </h1>
          <p className="text-xs opacity-75 mt-0.5">
            Real-time e-commerce revenue, autonomous AI grounding telemetry, and support escalation SLAs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex gap-1 border rounded-2xl p-0.5 text-xs font-bold">
            {(["today", "7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-xl uppercase text-[10px] transition ${
                  timeRange === r ? t.primaryButton : "opacity-60 hover:opacity-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold opacity-90 hidden sm:inline">Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl border transition hover:shadow-xl hover:-translate-y-0.5 ${t.card} ${t.divider}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold opacity-70 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2.5 rounded-2xl bg-current/5 ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black tracking-tight mb-1">{kpi.value}</div>

              <div className="flex items-center justify-between text-xs opacity-75 pt-1 border-t border-current/10">
                <span>{kpi.subValue}</span>
                <span className="font-bold text-emerald-500 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{kpi.change}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA Speedometer & Radial Gauge Strips */}
      <div className={`p-5 rounded-3xl border grid grid-cols-2 lg:grid-cols-4 gap-4 shadow-md ${t.cardMuted} ${t.divider}`}>
        {/* Gauge 1: Median Latency */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-current/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray="98, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Clock className="w-4 h-4 absolute text-emerald-500" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold opacity-60">Median AI Latency</div>
            <div className={`text-base sm:text-lg font-black ${t.accentText}`}>&lt; 812ms</div>
            <div className="text-[10px] text-emerald-500 font-semibold">98.4% Sub-second SLA</div>
          </div>
        </div>

        {/* Gauge 2: First Contact Resolution */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-current/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray="91, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <CheckCircle2 className="w-4 h-4 absolute text-emerald-500" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold opacity-60">First Contact Resolution</div>
            <div className={`text-base sm:text-lg font-black ${t.accentText}`}>91.8%</div>
            <div className="text-[10px] text-emerald-500 font-semibold">+6.8% vs Target</div>
          </div>
        </div>

        {/* Gauge 3: CSAT */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-current/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500"
                strokeDasharray="96, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Award className="w-4 h-4 absolute text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold opacity-60">Customer CSAT</div>
            <div className="text-base sm:text-lg font-black text-amber-500">4.88 / 5.0</div>
            <div className="text-[10px] opacity-70 font-semibold">1,240+ Verified Reviews</div>
          </div>
        </div>

        {/* Gauge 4: Telephony Voice AI */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-current/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                strokeDasharray="99, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Activity className="w-4 h-4 absolute text-blue-500" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold opacity-60">IVR Speech Uptime</div>
            <div className="text-base sm:text-lg font-black text-blue-500">99.98%</div>
            <div className="text-[10px] text-emerald-500 font-semibold">Twilio IVR & Webhook</div>
          </div>
        </div>
      </div>

      {/* Main Chart Section: Interactive Area & Line Chart */}
      <div className={`p-5 sm:p-6 rounded-3xl border shadow-md space-y-4 ${t.card}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-current/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {metricView === "volume" ? "Support Ticket Inflow & AI Resolution Trend" : "Platform Revenue & GMV Trajectory"}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badgeHighlight}`}>
                {timeRange.toUpperCase()}
              </span>
            </div>
            <p className="text-xs opacity-75 mt-0.5">
              Hover over data points to inspect live ticket volume, AI resolution rates, and response latency.
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 border rounded-xl p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMetricView("volume")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                  metricView === "volume" ? t.primaryButton : "opacity-60 hover:opacity-100"
                }`}
              >
                Inflow & Tickets
              </button>
              <button
                type="button"
                onClick={() => setMetricView("revenue")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                  metricView === "revenue" ? t.primaryButton : "opacity-60 hover:opacity-100"
                }`}
              >
                Revenue (₹)
              </button>
            </div>
          </div>
        </div>

        {/* Real Interactive SVG Chart Container */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[640px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 select-none"
              onMouseLeave={() => setHoveredPointIndex(null)}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={theme === "dark" ? "#d9a83e" : "#AB644B"}
                    stopOpacity="0.4"
                  />
                  <stop
                    offset="100%"
                    stopColor={theme === "dark" ? "#d9a83e" : "#AB644B"}
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.08"
                      strokeDasharray="4 4"
                    />
                  </g>
                );
              })}

              {/* Area Gradient Fill */}
              <polygon points={areaPoints} fill="url(#chartGradient)" />

              {/* Trend Polyline */}
              <polyline
                points={polylinePoints}
                fill="none"
                stroke={theme === "dark" ? "#d9a83e" : "#AB644B"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Scrubbing Cursor Line */}
              {hoveredPointIndex !== null && (
                <line
                  x1={getX(hoveredPointIndex)}
                  y1={paddingY}
                  x2={getX(hoveredPointIndex)}
                  y2={chartHeight - paddingY}
                  stroke={theme === "dark" ? "#f5e7bf" : "#242e35"}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Data Point Dots & Hitboxes */}
              {activeTrendPoints.map((p, idx) => {
                const cx = getX(idx);
                const cy = getY(metricView === "volume" ? p.tickets : p.revenue);
                const isHovered = hoveredPointIndex === idx;

                return (
                  <g key={idx}>
                    {/* Circle Node */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 7 : 4.5}
                      fill={isHovered ? (theme === "dark" ? "#f5e7bf" : "#ffffff") : (theme === "dark" ? "#d9a83e" : "#AB644B")}
                      stroke={theme === "dark" ? "#17140d" : "#242e35"}
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-opacity duration-200"
                    />

                    {/* Invisible Hitbox for Mouse Events */}
                    <rect
                      x={cx - 24}
                      y={0}
                      width={48}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                    />

                    {/* X-Axis Label */}
                    <text
                      x={cx}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill="currentColor"
                      opacity={isHovered ? 1 : 0.6}
                      fontWeight={isHovered ? "bold" : "normal"}
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Interactive Tooltip */}
            {hoveredPointIndex !== null && (
              <div
                className={`absolute z-30 p-3 rounded-2xl border shadow-xl text-xs space-y-1.5 pointer-events-none transition-all duration-150 ${t.card}`}
                style={{
                  left: `${Math.min(
                    chartWidth - 180,
                    Math.max(20, getX(hoveredPointIndex) - 90)
                  )}px`,
                  top: "10px",
                }}
              >
                <div className="font-extrabold flex items-center justify-between border-b pb-1 border-current/10 gap-4">
                  <span className={t.accentText}>
                    {activeTrendPoints[hoveredPointIndex].label}
                  </span>
                  <span className="opacity-60 text-[10px]">
                    SLA: {activeTrendPoints[hoveredPointIndex].latencyMs}ms
                  </span>
                </div>
                <div className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between gap-3">
                    <span className="opacity-70">Support Inflow:</span>
                    <strong className="font-bold">
                      {activeTrendPoints[hoveredPointIndex].tickets} tickets
                    </strong>
                  </div>
                  <div className="flex justify-between gap-3 text-emerald-500">
                    <span>AI Autonomous:</span>
                    <strong className="font-bold">
                      {activeTrendPoints[hoveredPointIndex].aiResolved} (
                      {Math.round(
                        (activeTrendPoints[hoveredPointIndex].aiResolved /
                          activeTrendPoints[hoveredPointIndex].tickets) *
                          100
                      )}
                      %)
                    </strong>
                  </div>
                  <div className="flex justify-between gap-3 pt-1 border-t border-current/10">
                    <span className="opacity-70">GMV Revenue:</span>
                    <strong className={`font-black ${t.accentText}`}>
                      ₹{activeTrendPoints[hoveredPointIndex].revenue.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Resolution Channel Donut Chart & Category Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Donut / Ring Chart */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-md flex flex-col justify-between ${t.card}`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-sm">Resolution Channel Breakdown</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badgeHighlight}`}>
                1,573 Inquiries
              </span>
            </div>
            <p className="text-xs opacity-70 mb-4">
              Autonomous AI Copilot vs Human escalation
            </p>

            {/* SVG Donut Ring */}
            <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* AI Autonomous Slice (94.2%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke={theme === "dark" ? "#d9a83e" : "#AB644B"}
                  strokeWidth={hoveredSlice === "ai" ? "16" : "13"}
                  strokeDasharray="225 240"
                  strokeDashoffset="0"
                  className="cursor-pointer transition-opacity duration-300"
                  onMouseEnter={() => setHoveredSlice("ai")}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* Frontline Agent Slice (4.6%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth={hoveredSlice === "human" ? "16" : "13"}
                  strokeDasharray="11 240"
                  strokeDashoffset="-225"
                  className="cursor-pointer transition-opacity duration-300"
                  onMouseEnter={() => setHoveredSlice("human")}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* Supervisor Escalated Slice (1.2%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth={hoveredSlice === "escalated" ? "16" : "13"}
                  strokeDasharray="4 240"
                  strokeDashoffset="-236"
                  className="cursor-pointer transition-opacity duration-300"
                  onMouseEnter={() => setHoveredSlice("escalated")}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              </svg>

              {/* Center Donut Text */}
              <div className="absolute text-center">
                <div className="text-[10px] font-bold opacity-60 uppercase">
                  {hoveredSlice ? hoveredSlice.toUpperCase() : "AUTONOMOUS"}
                </div>
                <div className={`text-xl font-black ${t.accentText}`}>
                  {hoveredSlice === "human"
                    ? "4.6%"
                    : hoveredSlice === "escalated"
                    ? "1.2%"
                    : "94.2%"}
                </div>
                <div className="text-[9px] opacity-60 font-semibold">
                  {hoveredSlice === "human"
                    ? "72 tickets"
                    : hoveredSlice === "escalated"
                    ? "19 tickets"
                    : "1,482 tickets"}
                </div>
              </div>
            </div>

            {/* Interactive Legend Items */}
            <div className="space-y-2 mt-4 text-xs">
              {resolutionChannels.map((ch) => (
                <div
                  key={ch.id}
                  onMouseEnter={() => setHoveredSlice(ch.id)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    hoveredSlice === ch.id ? t.primaryButton : `${t.cardMuted} ${t.divider}`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ch.color }}
                    />
                    <span className="font-semibold text-[11px]">{ch.label}</span>
                  </div>
                  <span className="font-black text-[11px]">{ch.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab("tickets")}
            className={`mt-4 w-full py-2.5 rounded-2xl text-xs font-black border transition active:scale-95 ${t.secondaryButton}`}
          >
            Review Queue Backlog &rarr;
          </button>
        </div>

        {/* Interactive Ticket Category Distribution Bar Chart */}
        <div className={`p-5 sm:p-6 rounded-3xl border lg:col-span-2 shadow-md flex flex-col justify-between ${t.card}`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-black text-sm">Inquiry Category Distribution</h3>
                <p className="text-xs opacity-70">
                  Grounded semantic categorizations with median resolution velocity
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badgeHighlight}`}>
                AI Auto-Classified
              </span>
            </div>

            <div className="space-y-3.5 mt-4 text-xs">
              {categoryBreakdown.map((cat, idx) => {
                const isHovered = hoveredCategory === cat.name;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-3 rounded-2xl border transition ${
                      isHovered ? t.card : `${t.cardMuted} ${t.divider}`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs opacity-50 font-bold">
                          0{idx + 1}
                        </span>
                        <span className="font-bold">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] opacity-60">
                          Avg: <strong>{cat.avgResolution}</strong>
                        </span>
                        <span className={`font-black ${t.accentText}`}>{cat.pct}%</span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-current/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          theme === "dark" ? "bg-[#d9a83e]" : "bg-[#AB644B]"
                        }`}
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-current/10 flex items-center justify-between text-xs opacity-75">
            <span>Grounding Policy Reference: <strong>100% Zero Hallucination</strong></span>
            <button
              onClick={() => onNavigateToTab("knowledge")}
              className={`font-bold hover:underline ${t.accentText}`}
            >
              Configure Grounding KB &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Daily Revenue & Order Volume Bar Chart */}
      <div className={`p-5 sm:p-6 rounded-3xl border shadow-md space-y-4 ${t.card}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-current/10 pb-3">
          <div>
            <h3 className="font-black text-sm">Daily Order Volume & GMV Revenue</h3>
            <p className="text-xs opacity-70">
              Correlating customer inquiries with e-commerce conversion velocity
            </p>
          </div>
          <span className="text-xs font-bold opacity-75">
            Total Revenue: <strong className={t.accentText}>₹{totalRevenue.toLocaleString("en-IN")}</strong>
          </span>
        </div>

        {/* Bar Chart Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 pt-2">
          {activeTrendPoints.map((pt, idx) => {
            const isHovered = hoveredBarIndex === idx;
            const barHeightPct = Math.round((pt.revenue / (maxVal * 1.2 || 1)) * 100);

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredBarIndex(idx)}
                onMouseLeave={() => setHoveredBarIndex(null)}
                className={`p-3 rounded-2xl border text-center transition flex flex-col justify-between items-center h-44 cursor-pointer ${
                  isHovered ? `${t.card} ring-2 ring-[#AB644B] shadow-md` : `${t.cardMuted} ${t.divider}`
                }`}
              >
                <div className="text-[10px] font-bold opacity-70">
                  ₹{(pt.revenue / 1000).toFixed(0)}k
                </div>

                <div className="w-8 h-24 bg-current/10 rounded-xl relative flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-xl transition-all duration-300 ${
                      isHovered
                        ? "bg-[#AB644B]"
                        : theme === "dark"
                        ? "bg-[#d9a83e]"
                        : "bg-[#AB644B]"
                    }`}
                    style={{ height: `${Math.max(15, barHeightPct)}%` }}
                  />
                </div>

                <div className="text-[11px] font-bold mt-1">
                  <div>{pt.label}</div>
                  <div className="text-[9px] opacity-60">{pt.tickets} tkts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 4: Agent Productivity Scorecard & Live System Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Productivity Scorecard */}
        <div className={`p-5 rounded-3xl border lg:col-span-2 shadow-md space-y-4 ${t.card}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-current/10 pb-3">
            <div>
              <h3 className="font-black text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Support Team Productivity & Velocity Scorecard</span>
              </h3>
              <p className="text-xs opacity-70">
                Frontline staff velocity, resolution rate, and CSAT customer ratings
              </p>
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="opacity-60 text-[10px] uppercase font-bold">Sort By:</span>
              {(["tickets", "resolution", "csat"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAgentSortBy(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                    agentSortBy === s ? t.primaryButton : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-current/10 opacity-60 font-bold">
                  <th className="pb-2.5">Team Member</th>
                  <th className="pb-2.5">Inquiries Handled</th>
                  <th className="pb-2.5">Avg Handle Time</th>
                  <th className="pb-2.5">Resolution %</th>
                  <th className="pb-2.5">CSAT Score</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10">
                {agentScorecards.map((agent, i) => (
                  <tr key={i} className="hover:bg-current/5 transition">
                    <td className="py-3.5">
                      <div className="font-bold flex items-center gap-2">
                        <span>{agent.name}</span>
                        {agent.isAi && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${t.badgeHighlight}`}>
                            AI COPILOT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] opacity-60 font-medium">{agent.role}</div>
                    </td>
                    <td className="py-3.5 font-bold">
                      {agent.ticketsHandled.toLocaleString()}
                    </td>
                    <td className="py-3.5 opacity-80 font-mono text-[11px]">
                      {agent.aht}
                    </td>
                    <td className="py-3.5">
                      <span className="font-extrabold text-emerald-500">
                        {agent.resolutionRate}%
                      </span>
                    </td>
                    <td className="py-3.5 font-black text-amber-500">
                      ★ {agent.csat.toFixed(2)}
                    </td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        ● {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Activity Stream */}
        <div className={`p-5 rounded-3xl border shadow-md space-y-3 flex flex-col justify-between ${t.card}`}>
          <div>
            <div className="flex items-center justify-between border-b pb-2.5 border-current/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="font-black text-sm">Live System Stream</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsStreamLive(!isStreamLive)}
                  className="p-1 rounded-lg border text-[10px] opacity-80 hover:opacity-100"
                  title={isStreamLive ? "Pause stream" : "Resume stream"}
                >
                  {isStreamLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-500" />}
                </button>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">
                  {isStreamLive ? "● LIVE" : "PAUSED"}
                </span>
              </div>
            </div>

            {/* Stream Filter Pills */}
            <div className="flex gap-1 py-2 overflow-x-auto text-[10px] font-bold">
              {(["all", "ai", "order", "ticket"] as const).map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setStreamFilter(flt)}
                  className={`px-2 py-0.5 rounded uppercase transition ${
                    streamFilter === flt ? t.primaryButton : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 text-xs">
              {liveEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3 rounded-2xl border space-y-1 ${t.cardMuted} ${t.divider}`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-60">
                    <span className="uppercase font-bold tracking-wider">{evt.type}</span>
                    <span>{evt.time}</span>
                  </div>
                  <p className="font-medium text-[11px] leading-snug">{evt.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-current/10 flex items-center justify-between text-[11px] opacity-70">
            <span>Carrier webhook listening on port 5000</span>
            <RefreshCw className="w-3.5 h-3.5 animate-spin opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};
