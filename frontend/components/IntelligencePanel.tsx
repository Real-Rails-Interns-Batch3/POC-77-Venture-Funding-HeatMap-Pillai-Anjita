"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { Download, TrendingUp, Layers, Filter, RefreshCw, X } from "lucide-react";
import type { FilterState, SummaryData, CityRanking, SectorCard, TrendPoint, FilterOptions } from "@/lib/api";

const SECTOR_COLORS: Record<string, string> = {
  "AI/ML": "#C92A5A",
  "FinTech": "#D43D6B",
  "HealthTech": "#E8497A",
  "CleanEnergy": "#FCD34D",
  "DeepTech": "#F472B6",
  "Logistics": "#FB923C",
  "EdTech": "#A78BFA",
  "AgriTech": "#6EE7B7",
};

type PanelProps = {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  summary: SummaryData | null;
  cityRankings: CityRanking[];
  sectorCards: SectorCard[];
  trends: TrendPoint[];
  filterOptions: FilterOptions | null;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string | null;
};

function KpiPill({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(15, 16, 26, 0.8)", border: "1px solid rgba(201, 42, 90, 0.2)" }}>
      <div className="text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-semibold tracking-tight text-white">{value}</div>
      {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function IntelligencePanel({
  filters,
  onFiltersChange,
  summary,
  cityRankings,
  sectorCards,
  trends,
  filterOptions,
  loading,
  isOpen,
  onClose,
  selectedCity,
}: PanelProps) {
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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[900]"
          onClick={onClose}
        />
      )}
      
      {/* Slide-over Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-[420px] max-w-[85vw] z-[1000] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ 
          background: "#07080E",
          borderLeft: "1px solid rgba(201, 42, 90, 0.2)",
        }}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* CLOSE BUTTON */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-ruby-glow/10 transition-colors group"
              aria-label="Close panel"
            >
              <X size={18} className="text-gray-400 group-hover:text-ruby-glow transition-colors" />
            </button>
          </div>

        {/* HEADER */}
          <div className="px-4 py-3 border-b border-slate-rail flex-shrink-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-ruby-glow data-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-ruby-glow">
                Capital Formation
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-white">
                Venture Funding Heatmap
              </h1>
              <span className="text-[9px] text-gray-500">·</span>
              <span className="text-[9px] text-gray-500">Global</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[11px] text-gray-500">
                {selectedCity ? `Viewing: ${selectedCity}` : "Overview"}
              </p>
              <span className="text-[8px] uppercase tracking-[0.3em] text-ruby-glow/40">
                Batch 2
              </span>
            </div>
          </div>


          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
            {/* KPI Summary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={12} className="text-ruby-glow" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Capital Metrics
                </span>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-card rounded-lg p-3 animate-pulse h-16" />
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

            {/* Filter Controls */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter size={12} className="text-ruby-glow" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Filters
                </span>
              </div>
              <div className="space-y-3">
                <select
                  value={filters.sector}
                  onChange={(e) => onFiltersChange({ ...filters, sector: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-slate-rail bg-obsidian text-gray-300 focus:outline-none focus:border-ruby-glow transition-colors"
                >
                  {(filterOptions?.sectors ?? ["All"]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={filters.stage}
                  onChange={(e) => onFiltersChange({ ...filters, stage: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-slate-rail bg-obsidian text-gray-300 focus:outline-none focus:border-ruby-glow transition-colors"
                >
                  {(filterOptions?.stages ?? ["All"]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
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
                      className="flex-1 accent-ruby-400"
                    />
                    <input
                      type="range"
                      min={2019} max={2024}
                      value={filters.yearTo}
                      onChange={(e) => onFiltersChange({ ...filters, yearTo: Number(e.target.value) })}
                      className="flex-1 accent-ruby-300"
                    />
                  </div>
                </div>
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded border border-slate-rail text-gray-400 text-xs hover:text-ruby-glow hover:border-ruby-glow/50 transition-all"
                >
                  <RefreshCw size={12} />
                  Reset All Filters
                </button>
              </div>
            </div>

            {/* Trend Chart */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={12} className="text-ruby-glow" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Capital Trend
                </span>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 2, right: 4, bottom: 0, left: -30 }}>
                    <defs>
                      <linearGradient id="rubyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C92A5A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C92A5A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: "#4B5563" }} tickLine={false} axisLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 9, fill: "#4B5563" }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#07080E", border: "1px solid rgba(201,42,90,0.3)", borderRadius: 6, fontSize: 11 }}
                      labelStyle={{ color: "#9CA3AF" }}
                      itemStyle={{ color: "#C92A5A" }}
                      formatter={(v: number) => [`$${v}M`, "Capital"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="total_capital"
                      stroke="#C92A5A"
                      strokeWidth={1.5}
                      fill="url(#rubyGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* City Rankings / Sector Cards */}
            <div>
              <div className="flex gap-1 mb-3">
                {(["cities", "sectors"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded transition-all ${
                      activeTab === tab
                        ? "bg-ruby-glow/10 text-ruby-glow border border-ruby-glow/30"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab === "cities" ? "City Rankings" : "Sector Cards"}
                  </button>
                ))}
              </div>

              {activeTab === "cities" ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {cityRankings.map((city, i) => (
                    <div 
                      key={city.city} 
                      id={`city-${city.city.replace(/\s/g, '-')}`}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        selectedCity === city.city ? "city-highlight" : ""
                      }`}
                      style={{ scrollMarginTop: '20px' }}
                    >
                      <span className="text-[10px] w-4 text-gray-600 font-mono">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[11px] text-gray-200 font-medium">{city.city}</span>
                          <span className="text-[11px] text-ruby-glow font-mono">
                            ${(city.total_capital / 1000).toFixed(1)}B
                          </span>
                        </div>
                        <div className="h-0.5 bg-slate-rail rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${city.bar_width}%`,
                              background: "linear-gradient(90deg, #8B1A3A, #C92A5A, #E8497A)",
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
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
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

            {/* Download */}
            <div className="pt-2">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/download/sample?sector=${filters.sector}&stage=${filters.stage}&year_from=${filters.yearFrom}&year_to=${filters.yearTo}`}
                download
                className="flex items-center justify-center gap-2 w-full py-2 rounded border border-ruby-glow/30 text-ruby-glow text-xs font-medium hover:bg-ruby-glow/10 transition-all"
              >
                <Download size={12} />
                Download Current View Data (CSV)
              </a>
              <p className="text-[9px] text-gray-600 text-center mt-1.5">
                Exports {summary?.total_deals || 0} funding rounds
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}