"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { Download, TrendingUp, Globe, Layers, Filter, Info, RefreshCw } from "lucide-react";
import type { FilterState, SummaryData, CityRanking, SectorCard, TrendPoint, FilterOptions } from "@/lib/api";

const SECTOR_COLORS: Record<string, string> = {
  "AI/ML": "#38BDF8",
  "FinTech": "#818CF8",
  "HealthTech": "#34D399",
  "CleanEnergy": "#FCD34D",
  "DeepTech": "#F472B6",
  "Logistics": "#FB923C",
  "EdTech": "#A78BFA",
  "AgriTech": "#6EE7B7",
};

type SidebarProps = {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  summary: SummaryData | null;
  cityRankings: CityRanking[];
  sectorCards: SectorCard[];
  trends: TrendPoint[];
  filterOptions: FilterOptions | null;
  loading: boolean;
};

function KpiPill({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid #1E293B" }}>
      <div className="text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-semibold tracking-tight text-white">{value}</div>
      {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function IntelligenceSidebar({
  filters,
  onFiltersChange,
  summary,
  cityRankings,
  sectorCards,
  trends,
  filterOptions,
  loading,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"cities" | "sectors">("cities");

  const resetFilters = () => {
    onFiltersChange({
      sector: "All",
      stage: "All",
      yearFrom: 2019,
      yearTo: 2024,
    });
  };

  const pct = summary?.pct_above_avg ?? 0;
  const pctColor = pct >= 0 ? "text-cyan-400" : "text-red-400";

  return (
    <aside
      className="w-[30%] min-w-[300px] h-full flex flex-col overflow-y-auto border-l border-slate-rail"
      style={{ background: "#0B1117" }}
    >
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-rail">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-pulse data-pulse" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
            Real Rails · Rail #77
          </span>
        </div>
        <h1 className="text-sm font-semibold tracking-tight text-white">
          Venture Funding Heatmap
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">Capital Formation Intelligence</p>
      </div>

      {/* SECTION A — KPI Summary */}
      <div className="px-4 py-4 border-b border-slate-rail">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={12} className="text-cyan-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Section A · Capital Metrics
          </span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-lg p-3 animate-pulse h-16 bg-deep-navy" />
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 gap-2">
            <KpiPill
              label="Total Capital"
              value={`$${summary.total_capital_usd_b}B`}
              sub="Synthetic dataset"
            />
            <KpiPill
              label="Total Deals"
              value={summary.total_deals.toLocaleString()}
              sub="All stages"
            />
            <KpiPill
                label="Avg Deal Size"
                value={`$${summary.avg_deal_usd_m}M`}
                sub={`${pct >= 0 ? "+" : ""}${pct}% vs global avg`}
            />
            <KpiPill
              label="Top Hub"
              value={summary.top_city}
              sub={`${summary.top3_city_concentration_pct}% top-3 concentration`}
            />
          </div>
        ) : null}
      </div>

      {/* SECTION B — Why This Matters */}
      <div className="px-4 py-4 border-b border-slate-rail">
        <div className="flex items-center gap-2 mb-2">
          <Info size={12} className="text-indigo-overlay" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Section B · Why This Matters
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-gray-400">
          Capital formation is not evenly distributed — it clusters. This heatmap
          reveals where venture capital is concentrating geographically, surfacing
          emerging hubs before they become consensus. A{" "}
          <span className="text-cyan-pulse font-medium">42% concentration</span> in
          3 cities signals systemic risk and opportunity simultaneously.
        </p>
      </div>

      {/* SECTION C — Who Controls the Rail */}
      <div className="px-4 py-4 border-b border-slate-rail">
        <div className="flex items-center gap-2 mb-2">
          <Globe size={12} className="text-indigo-overlay" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Section C · Who Controls the Rail
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-gray-400">
          The flow of startup funding is shaped by investors concentrated in major
          hubs — SF, NYC, London — with capital disproportionately directed toward
          high-growth sectors and later-stage companies perceived as lower-risk.
          A handful of{" "}
          <span className="text-indigo-overlay font-medium">
            tier-1 VCs
          </span>{" "}
          set the terms for the entire asset class.
        </p>
      </div>

      {/* SECTION D — Filters */}
      <div className="px-4 py-4 border-b border-slate-rail">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={12} className="text-cyan-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Section D · Filters
          </span>
        </div>
        <div className="space-y-3">
          {/* Sector */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">
              Sector
            </label>
            <select
              value={filters.sector}
              onChange={(e) => onFiltersChange({ ...filters, sector: e.target.value })}
              className="w-full text-xs px-2 py-1.5 rounded border border-slate-rail bg-obsidian text-gray-300 focus:outline-none focus:border-cyan-pulse transition-colors"
            >
              {(filterOptions?.sectors ?? ["All"]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {/* Stage */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">
              Stage
            </label>
            <select
              value={filters.stage}
              onChange={(e) => onFiltersChange({ ...filters, stage: e.target.value })}
              className="w-full text-xs px-2 py-1.5 rounded border border-slate-rail bg-obsidian text-gray-300 focus:outline-none focus:border-cyan-pulse transition-colors"
            >
              {(filterOptions?.stages ?? ["All"]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {/* Year range */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">
              Year Range: {filters.yearFrom}–{filters.yearTo}
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min={2019} max={2024}
                value={filters.yearFrom}
                onChange={(e) => onFiltersChange({ ...filters, yearFrom: Number(e.target.value) })}
                className="flex-1 accent-cyan-400"
              />
              <input
                type="range"
                min={2019} max={2024}
                value={filters.yearTo}
                onChange={(e) => onFiltersChange({ ...filters, yearTo: Number(e.target.value) })}
                className="flex-1 accent-indigo-400"
              />
            </div>
          </div>
          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center gap-2 mt-2 py-1.5 rounded border border-slate-rail text-gray-400 text-xs hover:text-cyan-pulse hover:border-cyan-pulse/50 transition-all"
          >
            <RefreshCw size={12} />
            Reset All Filters
          </button>
        </div>
      </div>

      {/* TREND LINES */}
      <div className="px-4 py-4 border-b border-slate-rail">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={12} className="text-cyan-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Capital Trend
          </span>
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 2, right: 4, bottom: 0, left: -30 }}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: "#4B5563" }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: "#4B5563" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#0B1117", border: "1px solid #1F2937", borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: "#9CA3AF" }}
                itemStyle={{ color: "#38BDF8" }}
                formatter={(v: number) => [`$${v}M`, "Capital"]}
              />
              <Area
                type="monotone"
                dataKey="total_capital"
                stroke="#38BDF8"
                strokeWidth={1.5}
                fill="url(#cyanGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CITY RANKINGS / SECTOR CARDS Tab */}
      <div className="px-4 py-4 border-b border-slate-rail flex-1">
        <div className="flex gap-1 mb-3">
          {(["cities", "sectors"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded transition-all ${
                activeTab === tab
                  ? "bg-cyan-pulse/10 text-cyan-pulse border border-cyan-pulse/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "cities" ? "City Rankings" : "Sector Cards"}
            </button>
          ))}
        </div>

        {activeTab === "cities" ? (
          <div className="space-y-2">
            {cityRankings.map((city, i) => (
              <div 
                key={city.city} 
                id={`city-${city.city.replace(/\s/g, '-')}`}
                className="flex items-center gap-2 transition-all duration-300 city-ranking-item"
                style={{ scrollMarginTop: '20px' }}
              >
                <span className="text-[10px] w-4 text-gray-600 font-mono">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[11px] text-gray-200 font-medium">{city.city}</span>
                    <span className="text-[11px] text-cyan-pulse font-mono">
                      ${(city.total_capital / 1000).toFixed(1)}B
                    </span>
                  </div>
                  <div className="h-0.5 bg-slate-rail rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${city.bar_width}%`,
                        background: "linear-gradient(90deg, #38BDF8, #818CF8)",
                      }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-600 mt-0.5">
                    {city.deal_count} deals · {city.top_sector} · {city.share_pct}% share
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {sectorCards.map((s) => (
              <div key={s.sector} className="glass-card rounded p-2.5 flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: SECTOR_COLORS[s.sector] ?? "#6B7280" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-gray-200 font-medium">{s.sector}</span>
                    <span className="text-[11px] font-mono" style={{ color: SECTOR_COLORS[s.sector] ?? "#6B7280" }}>
                      {s.share_pct}%
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-600">
                    {s.deal_count} deals · avg ${s.avg_deal.toFixed(1)}M
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION E — Download */}
      <div className="px-4 py-3">
        <a
        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/download/sample?sector=${filters.sector}&stage=${filters.stage}&year_from=${filters.yearFrom}&year_to=${filters.yearTo}`}
        download
        className="flex items-center justify-center gap-2 w-full py-2 rounded border border-cyan-pulse/30 text-cyan-pulse text-xs font-medium hover:bg-cyan-pulse/10 transition-all"
        >
        <Download size={12} />
        Download Current View Data (CSV)
        </a>
        <p className="text-[9px] text-gray-600 text-center mt-1.5">
        Exports {summary?.total_deals || 0} funding rounds · Matches current filters
        </p>
      </div>
    </aside>
  );
}
