"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import IntelligencePanel from "@/components/IntelligencePanel";
import {
  fetchSummary,
  fetchHeatmap,
  fetchCityRankings,
  fetchSectorCards,
  fetchTrends,
  fetchFilterOptions,
  type FilterState,
  type SummaryData,
  type CityRanking,
  type SectorCard,
  type TrendPoint,
  type FilterOptions,
  type HeatmapFeature,
} from "@/lib/api";
import { X } from "lucide-react";

// Dynamic import for Leaflet (no SSR)
const VentureHeatmapMap = dynamic(
  () => import("@/components/VentureHeatMap"),
  { ssr: false }
);

const DEFAULT_FILTERS: FilterState = {
  sector: "All",
  stage: "All",
  yearFrom: 2019,
  yearTo: 2024,
};

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  // Data state
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [features, setFeatures] = useState<HeatmapFeature[]>([]);
  const [cityRankings, setCityRankings] = useState<CityRanking[]>([]);
  const [sectorCards, setSectorCards] = useState<SectorCard[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const handleCitySelect = useCallback((cityName: string) => {
    console.log(`🔵 City selected from map: ${cityName}`);
    setSelectedCity(cityName);
    setIsPanelOpen(true);
    
    setTimeout(() => {
      const cityId = `city-${cityName.replace(/\s/g, '-')}`;
      const cityElement = document.getElementById(cityId);
      if (cityElement) {
        cityElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cityElement.classList.add('city-highlight');
        setTimeout(() => {
          cityElement.classList.remove('city-highlight');
        }, 2000);
      }
    }, 300);
  }, []);

  
  // Load filter options once
  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions);
  }, []);

  // Reload data on filter change (Document 2: filters update without full page refresh)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, heatmap, cities, sectors, trendData] = await Promise.all([
        fetchSummary(filters),
        fetchHeatmap(filters),
        fetchCityRankings(filters),
        fetchSectorCards(filters),
        fetchTrends(filters),
      ]);
      setSummary(sum);
      setFeatures(heatmap.features);
      setCityRankings(cities);
      setSectorCards(sectors);
      setTrends(trendData);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);


    return (
      <main
        className="relative h-screen w-screen overflow-hidden"
        style={{ background: "#07080E" }}
      >
        {/* MINIMALIST HEADER */}
        <header className="absolute top-0 left-0 right-0 z-[500] flex justify-between items-center px-6 py-3 pointer-events-none">
          <div className="pointer-events-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-ruby-glow/80 hover:text-ruby-glow transition-colors">
              Infocreon Internship
            </span>
            <span className="text-[11px] font-bold text-ruby-glow/40 ml-2">·</span>
            <span className="text-[11px] font-semibold text-gray-300 ml-2 tracking-wide">
              Venture Funding Heatmap
            </span>
          </div>
          
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center border-2 border-ruby-glow/60 hover:border-ruby-glow transition-all hover:bg-ruby-glow/20 group bg-ruby-glow/10 shadow-[0_0_15px_rgba(201,42,90,0.2)]"
            aria-label="Developer Info"
          >
            <span className="text-[14px] font-serif font-bold text-ruby-glow group-hover:text-white transition-colors">i</span>
          </button>
        </header>

        {/* METADATA MODAL */}
        {showMetadata && (
          <>
            <div 
              className="fixed inset-0 z-[599] backdrop-blur-md bg-black/50"
              onClick={() => setShowMetadata(false)}
            />
            <div className="fixed inset-0 z-[600] flex items-center justify-center pointer-events-none">
              <div className="glass-card rounded-xl p-6 min-w-[280px] pointer-events-auto border-2 border-ruby-glow/40 shadow-[0_0_60px_rgba(201,42,90,0.25)] shadow-[0_0_120px_rgba(201,42,90,0.1)]">
                <button
                  onClick={() => setShowMetadata(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-ruby-glow transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-widest text-ruby-glow/60 mb-1">Developer</div>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-ruby-glow to-transparent mx-auto mb-3" />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500">Architect</div>
                    <div className="text-base font-semibold text-white">Pillai Anjita</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500">Batch</div>
                    <div className="text-sm text-gray-300">Batch 2 Interns</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500">Stack</div>
                    <div className="text-xs text-gray-400 leading-relaxed">
                      Next.js · FastAPI · Tailwind CSS · Leaflet
                    </div>
                  </div>
                  <div className="pt-2 border-t border-ruby-glow/20">
                    <div className="text-[8px] uppercase tracking-widest text-ruby-glow/40 text-center">
                      Infocreon Internship Program
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* FULL-SCREEN MAP — 100% */}
        <div className="relative w-full h-full">
        <VentureHeatmapMap 
          features={features} 
          loading={loading} 
          onCitySelect={handleCitySelect}
        />
      </div>

      {/* SLIDE-OVER INTELLIGENCE PANEL */}
      <IntelligencePanel
        filters={filters}
        onFiltersChange={setFilters}
        summary={summary}
        cityRankings={cityRankings}
        sectorCards={sectorCards}
        trends={trends}
        filterOptions={filterOptions}
        loading={loading}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedCity(null);
        }}
        selectedCity={selectedCity}
      />
    </main>
  );
}
