/**
 * Infocreon — Data Adapter Layer
 * Data sources:
 *   - Crunchbase API (live, requires CRUNCHBASE_API_KEY on backend)
 *   - World Bank API (free, enriches every response)
 *   - Synthetic mock data (auto-fallback when API unavailable)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://backend:8000";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterState {
  sector: string;
  stage: string;
  yearFrom: number;
  yearTo: number;
}

export interface HeatmapFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    id: string;
    company: string;
    city: string;
    country: string;
    sector: string;
    stage: string;
    amount_usd_m: number;
    amount_display: string;
    pct_above_avg: number;
    insight: string;
    lead_investor: string;
    date: string;
    weight: number;
    wb_gdp_usd?: number | null;
    wb_gdp_growth?: number | null;
  };
}

export interface HeatmapCollection {
  type: string;
  features: HeatmapFeature[];
  meta: {
    total_deals: number;
    total_capital_usd_m: number;
    avg_deal_size_usd_m: number;
    global_avg_usd_m: number;
    data_source: string;
    world_bank: string;
  };
}

export interface SummaryData {
  total_capital_usd_b: number;
  total_deals: number;
  avg_deal_usd_m: number;
  top_city: string;
  top_sector: string;
  top3_city_concentration_pct: number;
  global_avg_deal_usd_m: number;
  pct_above_avg: number;
  data_source: string;
}

export interface CityRanking {
  city: string;
  country: string;
  total_capital: number;
  deal_count: number;
  avg_deal: number;
  top_sector: string;
  dominant_stage: string;
  share_pct: number;
  bar_width: number;
  wb_gdp_usd?: number | null;
  wb_gdp_growth?: number | null;
}

export interface SectorCard {
  sector: string;
  total_capital: number;
  deal_count: number;
  avg_deal: number;
  share_pct: number;
}

export interface TrendPoint {
  quarter: string;
  total_capital: number;
  deal_count: number;
}

export interface FilterOptions {
  sectors: string[];
  stages: string[];
  year_range: { min: number; max: number };
  investors: string[];
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[API] unavailable — using mock fallback for: ${url}`, err);
    return fallback;
  }
}

// ── Mock Fallbacks ─────────────────────────────────────────────────────────────

const MOCK_SUMMARY: SummaryData = {
  total_capital_usd_b: 4.82,
  total_deals: 300,
  avg_deal_usd_m: 16.1,
  top_city: "San Francisco",
  top_sector: "AI/ML",
  top3_city_concentration_pct: 42.3,
  global_avg_deal_usd_m: 18.4,
  pct_above_avg: -12.5,
  data_source: "Synthetic mock data (backend offline)",
};

const MOCK_CITY_RANKINGS: CityRanking[] = [
  { city: "San Francisco", country: "USA", total_capital: 1240, deal_count: 78, avg_deal: 15.9, top_sector: "AI/ML", dominant_stage: "Series A", share_pct: 25.7, bar_width: 100 },
  { city: "New York", country: "USA", total_capital: 890, deal_count: 54, avg_deal: 16.5, top_sector: "FinTech", dominant_stage: "Series B", share_pct: 18.5, bar_width: 71.8 },
  { city: "London", country: "UK", total_capital: 620, deal_count: 41, avg_deal: 15.1, top_sector: "FinTech", dominant_stage: "Series A", share_pct: 12.9, bar_width: 50.0 },
  { city: "Beijing", country: "China", total_capital: 510, deal_count: 35, avg_deal: 14.6, top_sector: "DeepTech", dominant_stage: "Series B", share_pct: 10.6, bar_width: 41.1 },
  { city: "Bangalore", country: "India", total_capital: 340, deal_count: 28, avg_deal: 12.1, top_sector: "AI/ML", dominant_stage: "Seed", share_pct: 7.1, bar_width: 27.4 },
  { city: "Berlin", country: "Germany", total_capital: 290, deal_count: 22, avg_deal: 13.2, top_sector: "FinTech", dominant_stage: "Series A", share_pct: 6.0, bar_width: 23.4 },
  { city: "Boston", country: "USA", total_capital: 270, deal_count: 19, avg_deal: 14.2, top_sector: "HealthTech", dominant_stage: "Series B", share_pct: 5.6, bar_width: 21.8 },
  { city: "Singapore", country: "Singapore", total_capital: 220, deal_count: 17, avg_deal: 12.9, top_sector: "Logistics", dominant_stage: "Series A", share_pct: 4.6, bar_width: 17.7 },
];

const MOCK_SECTOR_CARDS: SectorCard[] = [
  { sector: "AI/ML", total_capital: 1180, deal_count: 74, avg_deal: 15.9, share_pct: 24.5 },
  { sector: "FinTech", total_capital: 940, deal_count: 61, avg_deal: 15.4, share_pct: 19.5 },
  { sector: "HealthTech", total_capital: 720, deal_count: 48, avg_deal: 15.0, share_pct: 14.9 },
  { sector: "CleanEnergy", total_capital: 590, deal_count: 38, avg_deal: 15.5, share_pct: 12.2 },
  { sector: "DeepTech", total_capital: 490, deal_count: 31, avg_deal: 15.8, share_pct: 10.2 },
  { sector: "Logistics", total_capital: 360, deal_count: 26, avg_deal: 13.8, share_pct: 7.5 },
  { sector: "EdTech", total_capital: 280, deal_count: 22, avg_deal: 12.7, share_pct: 5.8 },
  { sector: "AgriTech", total_capital: 260, deal_count: 20, avg_deal: 13.0, share_pct: 5.4 },
];

const MOCK_TRENDS: TrendPoint[] = [
  { quarter: "2019Q1", total_capital: 180, deal_count: 12 },
  { quarter: "2019Q3", total_capital: 210, deal_count: 14 },
  { quarter: "2020Q1", total_capital: 195, deal_count: 13 },
  { quarter: "2020Q3", total_capital: 230, deal_count: 15 },
  { quarter: "2021Q1", total_capital: 320, deal_count: 21 },
  { quarter: "2021Q3", total_capital: 410, deal_count: 27 },
  { quarter: "2022Q1", total_capital: 380, deal_count: 25 },
  { quarter: "2022Q3", total_capital: 350, deal_count: 23 },
  { quarter: "2023Q1", total_capital: 390, deal_count: 26 },
  { quarter: "2023Q3", total_capital: 430, deal_count: 28 },
  { quarter: "2024Q1", total_capital: 480, deal_count: 31 },
  { quarter: "2024Q3", total_capital: 520, deal_count: 35 },
];

const MOCK_FILTER_OPTIONS: FilterOptions = {
  sectors: ["All", "AI/ML", "AgriTech", "CleanEnergy", "DeepTech", "EdTech", "FinTech", "HealthTech", "Logistics"],
  stages: ["All", "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Series D+", "Growth"],
  year_range: { min: 2019, max: 2024 },
  investors: [],
};

const EMPTY_HEATMAP: HeatmapCollection = {
  type: "FeatureCollection",
  features: [],
  meta: {
    total_deals: 0,
    total_capital_usd_m: 0,
    avg_deal_size_usd_m: 0,
    global_avg_usd_m: 18.4,
    data_source: "Backend offline",
    world_bank: "unavailable",
  },
};

// ── Param builder ─────────────────────────────────────────────────────────────

function buildParams(filters: Partial<FilterState>): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.sector && filters.sector !== "All") p.set("sector", filters.sector);
  if (filters.stage && filters.stage !== "All") p.set("stage", filters.stage);
  if (filters.yearFrom) p.set("year_from", String(filters.yearFrom));
  if (filters.yearTo) p.set("year_to", String(filters.yearTo));
  return p;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchSummary(filters: Partial<FilterState>): Promise<SummaryData> {
  const p = buildParams(filters);
  return safeFetch<SummaryData>(`${API_BASE}/api/summary?${p}`, MOCK_SUMMARY);
}

export async function fetchHeatmap(filters: Partial<FilterState>): Promise<HeatmapCollection> {
  const p = buildParams(filters);
  return safeFetch<HeatmapCollection>(`${API_BASE}/api/heatmap?${p}`, EMPTY_HEATMAP);
}

export async function fetchCityRankings(filters: Partial<FilterState>): Promise<CityRanking[]> {
  const p = buildParams(filters);
  p.set("top_n", "20");  // ← ADD THIS LINE - fetches 20 cities instead of default 10
  return safeFetch<CityRanking[]>(`${API_BASE}/api/city-rankings?${p}`, MOCK_CITY_RANKINGS);
}

export async function fetchSectorCards(filters: Partial<FilterState>): Promise<SectorCard[]> {
  const p = buildParams(filters);
  return safeFetch<SectorCard[]>(`${API_BASE}/api/sector-cards?${p}`, MOCK_SECTOR_CARDS);
}

export async function fetchTrends(filters: Partial<FilterState>): Promise<TrendPoint[]> {
  const p = buildParams(filters);
  return safeFetch<TrendPoint[]>(`${API_BASE}/api/trend-lines?${p}`, MOCK_TRENDS);
}

export async function fetchFilterOptions(): Promise<FilterOptions> {
  return safeFetch<FilterOptions>(`${API_BASE}/api/filters/options`, MOCK_FILTER_OPTIONS);
}




