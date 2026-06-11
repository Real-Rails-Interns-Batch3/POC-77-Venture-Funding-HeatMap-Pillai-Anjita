"""
Real Rails Intelligence Library — Project 77: Venture Funding Heatmap
FastAPI Backend | Capital Formation Rail

Data Sources:
  - Crunchbase API (paid key required — falls back to mock if absent)
  - World Bank API (free, no key)
  - Synthetic mock data (always available as final fallback)
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import pandas as pd
import httpx
import json
import io
import random
import os
import asyncio
from typing import Optional
from datetime import datetime, timedelta
from functools import lru_cache
# Import mock data package
from mock_data import MockDataGenerator, export_to_csv, export_to_json

app = FastAPI(
    title="Real Rails — Venture Funding Heatmap API",
    description="Capital Formation intelligence layer for the Real Rails Library",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────

CRUNCHBASE_API_KEY = os.getenv("CRUNCHBASE_API_KEY", "")
CRUNCHBASE_BASE = "https://api.crunchbase.com/api/v4"
WORLD_BANK_BASE = "https://api.worldbank.org/v2"

# Cache TTL: 1 hour (World Bank data changes rarely)
_wb_cache: dict = {}
_wb_cache_ts: dict = {}
CACHE_TTL_SECONDS = 3600

# Initialize mock data generator
mock_generator = MockDataGenerator(seed=42)

# Get constants from mock generator
SECTORS = mock_generator.sectors
STAGES = mock_generator.stages
INVESTORS = mock_generator.investors
HUBS = mock_generator.hubs

# Country code → hub lookup for World Bank enrichment
COUNTRY_CODE_TO_HUB = {h["country_code"]: h for h in HUBS}

REGIONAL_AVG_USD_M = 18.4


# ─────────────────────────────────────────────
# WORLD BANK ENRICHMENT
# World Bank API docs: https://data.worldbank.org/
# Indicator reference: https://data.worldbank.org/indicator
# ─────────────────────────────────────────────

WB_INDICATORS = {
    "gdp_usd": "NY.GDP.MKTP.CD",          # GDP (current US$)
    "gdp_growth": "NY.GDP.MKTP.KD.ZG",    # GDP growth (annual %)
    "vc_investment": "VC.TAX.TOTL.GD.ZS", # Venture capital investment (% of GDP) — not always available
    "ease_business": "IC.BUS.EASE.XQ",    # Ease of doing business score
    "internet_users": "IT.NET.USER.ZS",   # Internet users (% of population)
}

async def _fetch_wb_indicator(country_code: str, indicator: str) -> Optional[float]:
    """Fetch a single World Bank indicator for a country. Returns most recent available value."""
    cache_key = f"{country_code}:{indicator}"
    now = datetime.utcnow().timestamp()

    if cache_key in _wb_cache and (now - _wb_cache_ts.get(cache_key, 0)) < CACHE_TTL_SECONDS:
        return _wb_cache[cache_key]

    url = f"{WORLD_BANK_BASE}/country/{country_code}/indicator/{indicator}?format=json&mrv=3&per_page=3"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            # World Bank returns [metadata, [records]]
            if len(data) < 2 or not data[1]:
                return None
            for record in data[1]:
                if record.get("value") is not None:
                    value = float(record["value"])
                    _wb_cache[cache_key] = value
                    _wb_cache_ts[cache_key] = now
                    return value
    except Exception as e:
        print(f"[WorldBank] Failed {country_code}/{indicator}: {e}")
    return None


async def fetch_world_bank_context(country_codes: list[str]) -> dict[str, dict]:
    """
    Fetch GDP, GDP growth, and ease-of-business for a list of ISO-2 country codes.
    Returns a dict keyed by country_code with enrichment data.

    World Bank API reference: https://data.worldbank.org/
    """
    results: dict[str, dict] = {}
    tasks = []

    for cc in set(country_codes):
        for name, indicator in WB_INDICATORS.items():
            tasks.append((cc, name, _fetch_wb_indicator(cc, indicator)))

    # Run all fetches concurrently
    gathered = await asyncio.gather(*[t[2] for t in tasks], return_exceptions=True)

    for i, (cc, name, _) in enumerate(tasks):
        val = gathered[i] if not isinstance(gathered[i], Exception) else None
        if cc not in results:
            results[cc] = {}
        results[cc][name] = val

    return results


def _wb_insight(wb: dict) -> str:
    """Build a one-line World Bank insight string for a country."""
    parts = []
    if wb.get("gdp_usd"):
        gdp_t = wb["gdp_usd"] / 1e12
        parts.append(f"GDP ${gdp_t:.1f}T")
    if wb.get("gdp_growth") is not None:
        parts.append(f"{wb['gdp_growth']:+.1f}% GDP growth")
    if wb.get("ease_business") is not None:
        parts.append(f"Biz ease {wb['ease_business']:.0f}/100")
    return " · ".join(parts) if parts else ""


# ─────────────────────────────────────────────
# CRUNCHBASE INTEGRATION
# Crunchbase API docs: https://www.crunchbase.com/
# Requires: CRUNCHBASE_API_KEY in .env
# Falls back to synthetic mock data if key absent or call fails.
# ─────────────────────────────────────────────

CRUNCHBASE_SECTOR_MAP = {
    # Crunchbase category → our sector labels
    "artificial_intelligence": "AI/ML",
    "machine_learning": "AI/ML",
    "fintech": "FinTech",
    "financial_services": "FinTech",
    "health_care": "HealthTech",
    "biotechnology": "HealthTech",
    "clean_technology": "CleanEnergy",
    "renewable_energy": "CleanEnergy",
    "logistics": "Logistics",
    "supply_chain_management": "Logistics",
    "education": "EdTech",
    "e_learning": "EdTech",
    "agriculture": "AgriTech",
    "food_and_beverage": "AgriTech",
    "deep_technology": "DeepTech",
    "hardware": "DeepTech",
    "semiconductor": "DeepTech",
}

CRUNCHBASE_STAGE_MAP = {
    "pre_seed": "Pre-Seed",
    "seed": "Seed",
    "series_a": "Series A",
    "series_b": "Series B",
    "series_c": "Series C",
    "series_d": "Series D+",
    "series_e": "Series D+",
    "series_f": "Series D+",
    "growth_equity": "Growth",
    "late_stage_venture": "Growth",
}


async def fetch_crunchbase_rounds(
    sector: Optional[str] = None,
    stage: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    limit: int = 300,
) -> Optional[list[dict]]:
    """
    Fetch funding rounds from Crunchbase API v4.
    Reference: https://www.crunchbase.com/
    Returns None if API key missing or request fails (triggers mock fallback).
    """
    if not CRUNCHBASE_API_KEY:
        return None

    # Build predicates for Crunchbase search
    predicates = [
        {"field_id": "funding_type", "operator_id": "includes", "values": ["venture"]},
    ]

    if year_from:
        predicates.append({
            "field_id": "announced_on",
            "operator_id": "gte",
            "values": [f"{year_from}-01-01"],
        })
    if year_to:
        predicates.append({
            "field_id": "announced_on",
            "operator_id": "lte",
            "values": [f"{year_to}-12-31"],
        })

    payload = {
        "field_ids": [
            "identifier", "announced_on", "money_raised", "investment_type",
            "lead_investor_identifiers", "funded_organization_identifier",
            "funded_organization_location", "funded_organization_categories",
        ],
        "predicates": predicates,
        "order": [{"field_id": "announced_on", "sort": "desc"}],
        "limit": limit,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{CRUNCHBASE_BASE}/searches/funding_rounds",
                params={"user_key": CRUNCHBASE_API_KEY},
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        print(f"[Crunchbase] API error: {e}")
        return None

    rounds = []
    entities = data.get("entities", [])
    for i, entity in enumerate(entities):
        props = entity.get("properties", {})

        # Amount
        money = props.get("money_raised", {})
        amount_usd_m = (money.get("value_usd", 0) or 0) / 1e6
        if amount_usd_m <= 0:
            continue

        # Stage
        cb_stage = props.get("investment_type", "seed")
        mapped_stage = CRUNCHBASE_STAGE_MAP.get(cb_stage.lower(), "Seed")

        # Filter by stage if requested
        if stage and stage != "All" and mapped_stage != stage:
            continue

        # Location
        location = props.get("funded_organization_location", {})
        city = location.get("city", "Unknown")
        country = location.get("country", "Unknown")

        # Try to match to our known hubs for lat/lng
        matched_hub = next(
            (h for h in HUBS if h["city"].lower() == city.lower()), None
        )
        if matched_hub:
            lat = matched_hub["lat"] + random.gauss(0, 0.1)
            lng = matched_hub["lng"] + random.gauss(0, 0.1)
        else:
            # Skip unknown cities (no coordinates available)
            continue

        # Sector
        categories = props.get("funded_organization_categories", [])
        mapped_sector = "DeepTech"  # default
        for cat in categories:
            cat_id = cat.get("value", "").lower().replace(" ", "_")
            if cat_id in CRUNCHBASE_SECTOR_MAP:
                mapped_sector = CRUNCHBASE_SECTOR_MAP[cat_id]
                break

        if sector and sector != "All" and mapped_sector != sector:
            continue

        # Investors
        leads = props.get("lead_investor_identifiers", [])
        lead_investor = leads[0]["value"] if leads else "Undisclosed"

        # Date
        date_str = props.get("announced_on", "2023-01-01")

        rounds.append({
            "id": entity.get("identifier", {}).get("uuid", f"cb_{i:04d}"),
            "company": props.get("funded_organization_identifier", {}).get("value", f"Company {i}"),
            "city": city,
            "country": country,
            "lat": lat,
            "lng": lng,
            "sector": mapped_sector,
            "stage": mapped_stage,
            "amount_usd_m": round(amount_usd_m, 2),
            "lead_investor": lead_investor,
            "date": date_str,
            "year": int(date_str[:4]) if date_str else 2023,
        })

    return rounds if rounds else None


# ─────────────────────────────────────────────
# MOCK DATA GENERATION (using mock-data package)
# ─────────────────────────────────────────────

def _build_df(df: pd.DataFrame) -> pd.DataFrame:
    """Add calculated fields to DataFrame"""
    df = df.copy()
    if "pct_above_global_avg" in df.columns:
        df["pct_above_avg"] = df["pct_above_global_avg"]
    else:
        df["pct_above_avg"] = ((df["amount_usd_m"] - REGIONAL_AVG_USD_M) / REGIONAL_AVG_USD_M * 100).round(1)
    return df


async def _get_rounds(
    sector: Optional[str],
    stage: Optional[str],
    year_from: Optional[int],
    year_to: Optional[int],
) -> tuple[pd.DataFrame, str]:
    """
    Returns (DataFrame, data_source_label).
    Priority: Crunchbase live → mock data package
    """
    # Try Crunchbase first if API key is configured
    if CRUNCHBASE_API_KEY:
        cb_rounds = await fetch_crunchbase_rounds(sector, stage, year_from, year_to)
        if cb_rounds and len(cb_rounds) > 0:
            df = pd.DataFrame(cb_rounds)
            df = _build_df(df)
            source = "🔴 LIVE: Crunchbase API (real venture capital data)"
            return df, source
    
    # Fallback to mock data package (clearly labeled as synthetic)
    df = mock_generator.generate_with_filters(
        sector=sector,
        stage=stage,
        year_from=year_from or 2019,
        year_to=year_to or 2024,
        num_rows=500
    )
    df = _build_df(df)
    
    source = "⚠️ SYNTHETIC MOCK DATA - Demonstration purposes only. Not real investment data."
    if not CRUNCHBASE_API_KEY:
        source += " Set CRUNCHBASE_API_KEY in .env to use real Crunchbase data."
    
    return df, source


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "rail": "Capital Formation",
        "project": "Venture Funding Heatmap",
        "data_mode": "synthetic_mock" if not CRUNCHBASE_API_KEY else "crunchbase_live",
        "data_quality_note": "⚠️ All data is synthetic unless Crunchbase API key is configured",
        "crunchbase_configured": bool(CRUNCHBASE_API_KEY),
        "world_bank": "enabled (public API)",
        "mock_data_endpoints": [
            "/api/mock/data-dictionary",
            "/api/mock/export/csv",
            "/api/mock/export/json",
            "/api/mock/edge-cases",
            "/api/mock/sample-rows"
        ]
    }


@app.get("/api/heatmap")
async def get_heatmap_points(
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
):
    """
    GeoJSON FeatureCollection of funding rounds, enriched with World Bank country context.
    Data: Crunchbase API (live) → synthetic mock (fallback).
    World Bank reference: https://data.worldbank.org/
    Crunchbase reference: https://www.crunchbase.com/
    """
    df, source = await _get_rounds(sector, stage, year_from, year_to)

    # Fetch World Bank context for all unique country codes
    # Fetch World Bank context for all unique country codes
    city_to_cc = {h["city"]: h["country_code"] for h in HUBS}
    country_codes = []
    for city in df["city"].unique():
        if city in city_to_cc:
            country_codes.append(city_to_cc[city])

    # Remove duplicates
    country_codes = list(set(country_codes))
    wb_data = await fetch_world_bank_context(country_codes) if country_codes else {}


    features = []
    for _, row in df.iterrows():
        pct = row["pct_above_avg"]
        cc = city_to_cc.get(row["city"], "")
        wb = wb_data.get(cc, {})
        wb_note = _wb_insight(wb)

        insight = f"{abs(pct):.1f}% {'above' if pct >= 0 else 'below'} global avg"
        if wb_note:
            insight += f" | {wb_note}"

        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [float(row["lng"]), float(row["lat"])]},
            "properties": {
                "id": row["id"],
                "company": row["company"],
                "city": row["city"],
                "country": row["country"],
                "sector": row["sector"],
                "stage": row["stage"],
                "amount_usd_m": float(row["amount_usd_m"]),
                "amount_display": f"${row['amount_usd_m']:.1f}M",
                "pct_above_avg": float(pct),
                "insight": insight,
                "lead_investor": row["lead_investor"],
                "date": row["date"],
                "weight": float(min(row["amount_usd_m"] / 10, 5.0)),
                "wb_gdp_usd": wb.get("gdp_usd"),
                "wb_gdp_growth": wb.get("gdp_growth"),
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "meta": {
            "total_deals": len(df),
            "total_capital_usd_m": round(float(df["amount_usd_m"].sum()), 1),
            "avg_deal_size_usd_m": round(float(df["amount_usd_m"].mean()), 1),
            "global_avg_usd_m": REGIONAL_AVG_USD_M,
            "data_source": source,
            "world_bank": "enriched" if wb_data else "unavailable",
        }
    }


@app.get("/api/city-rankings")
async def get_city_rankings(
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    top_n: int = Query(20, ge=1, le=50),  # ← Change 10 to 20
):
    """City-level capital formation intelligence, enriched with World Bank GDP data."""
    df, _ = await _get_rounds(sector, stage, None, None)

    city_agg = (
        df.groupby(["city", "country"])
        .agg(
            total_capital=("amount_usd_m", "sum"),
            deal_count=("id", "count"),
            avg_deal=("amount_usd_m", "mean"),
            top_sector=("sector", lambda x: x.value_counts().index[0]),
            dominant_stage=("stage", lambda x: x.value_counts().index[0]),
        )
        .reset_index()
        .sort_values("total_capital", ascending=False)
        .head(top_n)
    )

    global_max = city_agg["total_capital"].max()
    city_agg["share_pct"] = (city_agg["total_capital"] / city_agg["total_capital"].sum() * 100).round(1)
    city_agg["bar_width"] = (city_agg["total_capital"] / global_max * 100).round(1)

    # Enrich with World Bank GDP
    city_to_cc = {h["city"]: h["country_code"] for h in HUBS}
    ccs = list({city_to_cc[c] for c in city_agg["city"] if c in city_to_cc})
    wb_data = await fetch_world_bank_context(ccs) if ccs else {}

    records = city_agg.to_dict(orient="records")
    for rec in records:
        cc = city_to_cc.get(rec["city"], "")
        wb = wb_data.get(cc, {})
        rec["wb_gdp_usd"] = wb.get("gdp_usd")
        rec["wb_gdp_growth"] = wb.get("gdp_growth")
        rec["total_capital"] = round(float(rec["total_capital"]), 1)
        rec["avg_deal"] = round(float(rec["avg_deal"]), 1)
        rec["bar_width"] = float(rec["bar_width"])
        rec["share_pct"] = float(rec["share_pct"])
        rec["deal_count"] = int(rec["deal_count"])

    return records


@app.get("/api/sector-cards")
async def get_sector_cards(stage: Optional[str] = Query(None)):
    """Per-sector aggregated intelligence cards."""
    df, _ = await _get_rounds(None, stage, None, None)

    sector_agg = (
        df.groupby("sector")
        .agg(
            total_capital=("amount_usd_m", "sum"),
            deal_count=("id", "count"),
            avg_deal=("amount_usd_m", "mean"),
            yoy_deals=("year", lambda x: (x == datetime.utcnow().year - 1).sum()),
        )
        .reset_index()
        .sort_values("total_capital", ascending=False)
    )

    total = sector_agg["total_capital"].sum()
    sector_agg["share_pct"] = (sector_agg["total_capital"] / total * 100).round(1)

    records = sector_agg.to_dict(orient="records")
    for r in records:
        r["total_capital"] = round(float(r["total_capital"]), 1)
        r["avg_deal"] = round(float(r["avg_deal"]), 1)
        r["deal_count"] = int(r["deal_count"])
        r["share_pct"] = float(r["share_pct"])
    return records


@app.get("/api/trend-lines")
async def get_trend_lines(
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
):
    """Quarterly capital trend data for sparkline/trend chart."""
    df, _ = await _get_rounds(sector, stage, None, None)

    df["quarter"] = pd.to_datetime(df["date"]).dt.to_period("Q").astype(str)
    trend = (
        df.groupby("quarter")
        .agg(total_capital=("amount_usd_m", "sum"), deal_count=("id", "count"))
        .reset_index()
        .sort_values("quarter")
    )
    trend["total_capital"] = trend["total_capital"].round(1)

    records = trend.to_dict(orient="records")
    for r in records:
        r["total_capital"] = float(r["total_capital"])
        r["deal_count"] = int(r["deal_count"])
    return records


@app.get("/api/filters/options")
async def get_filter_options():
    """Valid filter values for the sidebar."""
    return {
        "sectors": ["All"] + sorted(SECTORS),
        "stages": ["All"] + STAGES,
        "year_range": {"min": 2019, "max": datetime.utcnow().year},
        "investors": sorted(INVESTORS),
    }


@app.get("/api/world-bank/country/{country_code}")
async def get_country_wb_data(country_code: str):
    """
    Direct World Bank data endpoint for a single country.
    Reference: https://data.worldbank.org/
    country_code: ISO 3166-1 alpha-2 (e.g. US, IN, DE)
    """
    country_code = country_code.upper()
    wb = await fetch_world_bank_context([country_code])
    data = wb.get(country_code, {})
    if not any(v is not None for v in data.values()):
        raise HTTPException(status_code=404, detail=f"No World Bank data found for {country_code}")
    return {
        "country_code": country_code,
        "indicators": data,
        "source": "https://data.worldbank.org/",
    }


@app.get("/api/download/sample")
async def download_sample(
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
):
    """
    CSV download of funding rounds matching current filters.
    Uses mock data package with clear synthetic labeling.
    """
    # Get filtered data using mock generator
    df, source = await _get_rounds(sector, stage, year_from, year_to)
    
    # Select columns for export
    export_cols = ["company", "city", "country", "sector", "stage", 
                   "amount_usd_m", "lead_investor", "date", "pct_above_avg"]
    
    # Only use columns that exist
    available_cols = [col for col in export_cols if col in df.columns]
    export_df = df[available_cols].copy()
    
    # Rename columns for better readability
    column_renames = {
        "company": "Company",
        "city": "City", 
        "country": "Country",
        "sector": "Sector",
        "stage": "Stage",
        "amount_usd_m": "Amount_USD_Millions",
        "lead_investor": "Lead_Investor",
        "date": "Date",
        "pct_above_avg": "Pct_Above_Global_Avg"
    }
    export_df = export_df.rename(columns={k: v for k, v in column_renames.items() if k in export_df.columns})
    
    # Add clear synthetic data warning
    export_df.insert(0, "DATA_QUALITY_NOTE", "⚠️ SYNTHETIC DATA - Not real investment information")
    export_df["Data_Source"] = source
    
    # Sort by date (newest first)
    if "Date" in export_df.columns:
        export_df = export_df.sort_values("Date", ascending=False)
    
    # Create CSV in memory
    buf = io.StringIO()
    export_df.to_csv(buf, index=False)
    buf.seek(0)
    
    # Generate filename with timestamp and filters
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filter_str = ""
    if sector and sector != "All":
        filter_str += f"_{sector}"
    if stage and stage != "All":
        filter_str += f"_{stage}"
    if year_from:
        filter_str += f"_{year_from}-{year_to if year_to else 'present'}"
    
    filename = f"real_rails_synthetic_funding{filter_str}_{timestamp}.csv"
    
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ─────────────────────────────────────────────
# MOCK DATA EXPORT ENDPOINTS (New)
# ─────────────────────────────────────────────

@app.get("/api/mock/data-dictionary")
async def get_data_dictionary():
    """
    Returns the complete data dictionary for the mock dataset.
    Includes entity definitions, field specifications, and statistical distributions.
    """
    return mock_generator.get_data_dictionary()


@app.get("/api/mock/export/csv")
async def export_mock_csv(
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
    include_edge_cases: bool = Query(False, description="Include edge cases and error scenarios"),
    num_rows: int = Query(500, ge=1, le=5000, description="Number of synthetic rows to generate")
):
    """
    Export synthetic funding data as CSV.
    All data is clearly labeled as synthetic/mock.
    """
    # Generate base dataset
    df = mock_generator.generate_with_filters(
        sector=sector,
        stage=stage,
        year_from=year_from or 2019,
        year_to=year_to or 2024,
        num_rows=num_rows
    )
    
    # Optionally include edge cases
    if include_edge_cases:
        edge_df = mock_generator.generate_edge_cases()
        df = pd.concat([df, edge_df], ignore_index=True)
    
    # Add metadata note column
    df["data_quality_note"] = "⚠️ SYNTHETIC DATA - For demonstration only. Not real investment data."
    
    csv_content = export_to_csv(df, include_metadata=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"real_rails_synthetic_funding_{timestamp}.csv"
    
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/api/mock/export/json")
async def export_mock_json(
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
    include_edge_cases: bool = Query(False, description="Include edge cases and error scenarios"),
    num_rows: int = Query(500, ge=1, le=5000)
):
    """
    Export synthetic funding data as JSON.
    All data is clearly labeled as synthetic/mock.
    """
    df = mock_generator.generate_with_filters(
        sector=sector,
        stage=stage,
        year_from=year_from or 2019,
        year_to=year_to or 2024,
        num_rows=num_rows
    )
    
    if include_edge_cases:
        edge_df = mock_generator.generate_edge_cases()
        df = pd.concat([df, edge_df], ignore_index=True)
    
    json_content = export_to_json(df, include_metadata=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"real_rails_synthetic_funding_{timestamp}.json"
    
    return StreamingResponse(
        iter([json_content]),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/api/mock/edge-cases")
async def get_edge_cases():
    """
    Returns a dataset of edge cases and error scenarios for testing.
    Includes: outlier deals, missing data, future dates, negative amounts.
    """
    edge_df = mock_generator.generate_edge_cases()
    records = edge_df.to_dict(orient="records")
    
    return {
        "data_quality_note": "⚠️ SYNTHETIC DATA - Edge cases for testing error handling",
        "edge_case_count": len(records),
        "edge_cases": records
    }


@app.get("/api/mock/sample-rows")
async def get_sample_rows(num_rows: int = Query(10, ge=1, le=50)):
    """
    Returns a small sample of realistic synthetic rows for preview.
    """
    df = mock_generator.generate_dataset(num_rows=min(num_rows, 50), year_from=2023, year_to=2024)
    records = df.to_dict(orient="records")
    
    return {
        "data_quality_note": "⚠️ SYNTHETIC SAMPLE DATA - Preview only",
        "sample_size": len(records),
        "sample_data": records
    }

@app.get("/api/summary")
async def get_summary(
    sector: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
):
    """Top-level KPI summary for Intelligence Sidebar Section A."""
    df, source = await _get_rounds(sector, stage, None, None)

    total_capital = float(df["amount_usd_m"].sum())
    avg_deal = float(df["amount_usd_m"].mean())
    top_city = df.groupby("city")["amount_usd_m"].sum().idxmax()
    top_sector = df.groupby("sector")["amount_usd_m"].sum().idxmax()
    concentration = float(
        df.groupby("city")["amount_usd_m"].sum().nlargest(3).sum() / total_capital * 100
    )

    return {
        "total_capital_usd_b": round(total_capital / 1000, 2),
        "total_deals": len(df),
        "avg_deal_usd_m": round(avg_deal, 1),
        "top_city": top_city,
        "top_sector": top_sector,
        "top3_city_concentration_pct": round(concentration, 1),
        "global_avg_deal_usd_m": REGIONAL_AVG_USD_M,
        "pct_above_avg": round((avg_deal - REGIONAL_AVG_USD_M) / REGIONAL_AVG_USD_M * 100, 1),
        "data_source": source,
    }