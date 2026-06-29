"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import IntelligenceSidebar from "@/components/IntelligenceSidebar";
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
  const handleCitySelect = useCallback((cityName: string) => {
  console.log(`🔵 City selected from map: ${cityName}`);
  
  // DEBUG: Log all available city IDs in DOM
  const allCityElements = document.querySelectorAll('[id^="city-"]');
  console.log("📋 Available cities in sidebar:", Array.from(allCityElements).map(el => el.id.replace('city-', '')));
  
  const cityId = `city-${cityName.replace(/\s/g, '-')}`;
    console.log(`🔍 Looking for element: ${cityId}`);
    const cityElement = document.getElementById(cityId);
    
    if (cityElement) {
      console.log(`✅ Found ${cityName}, scrolling...`);
      cityElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      cityElement.classList.add('city-highlight');
      setTimeout(() => {
        cityElement.classList.remove('city-highlight');
      }, 2000);
    } else {
      console.warn(`❌ City "${cityName}" NOT found in sidebar`);
      console.log("💡 Tip: Check if this city is in the rankings data");
    }
  }, []);
  // Data state
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [features, setFeatures] = useState<HeatmapFeature[]>([]);
  const [cityRankings, setCityRankings] = useState<CityRanking[]>([]);
  const [sectorCards, setSectorCards] = useState<SectorCard[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

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
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "#030712" }}
    >
      {/* MAIN STAGE — 70% */}
      <div className="flex-1 relative min-w-0 h-full">
        <VentureHeatmapMap 
          features={features} 
          loading={loading} 
          onCitySelect={handleCitySelect}  // ← ADD THIS LINE
        />
      </div>

      {/* INTELLIGENCE SIDEBAR — 30% */}
      <IntelligenceSidebar
        filters={filters}
        onFiltersChange={setFilters}
        summary={summary}
        cityRankings={cityRankings}
        sectorCards={sectorCards}
        trends={trends}
        filterOptions={filterOptions}
        loading={loading}
      />
    </main>
  );
}
