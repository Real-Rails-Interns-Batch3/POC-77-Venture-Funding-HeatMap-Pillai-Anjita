# Real Rails Intelligence Library — Project 77: Venture Funding Heatmap

**Real Rails Intelligence Library · Capital Formation Rail**

Production-style intelligence dashboard that visualizes global venture capital formation with synthetic mock data, World Bank economic enrichment, and optional Crunchbase API integration.

---

## What this project shows

- An interactive global heatmap of venture funding rounds with cluster markers and tooltips.
- A 70/30 split layout: heatmap on the left, intelligence sidebar on the right.
- Filter controls for sector, funding stage, and year range.
- City rankings with capital concentration metrics and World Bank GDP enrichment.
- Sector cards with capital distribution and deal count analytics.
- Trend line chart showing quarterly capital flow.
- CSV export of filtered funding data with clear synthetic labeling.
- Mock data package with data dictionary, CSV/JSON export, and edge cases for testing.

The application uses a complete mock-data package with synthetic venture funding data, falls back to mock when Crunchbase API is unavailable, and enriches all data with World Bank economic context.

---

## Tech Stack

### Frontend

- Next.js 14+ — React framework with App Router
- TypeScript — Type-safe code
- Tailwind CSS — Utility-first styling with Real Rails color palette
- Leaflet + react-leaflet — Interactive map rendering with heatmap layer
- Recharts — Trend line and analytics visualizations
- Lucide React — Icon library

### Backend

- FastAPI — Python web framework for API endpoints
- Uvicorn — ASGI server
- Pandas — Data manipulation and aggregation
- httpx — HTTP client for Crunchbase and World Bank API calls
- python-dotenv — Environment variable management

### Data Sources

- Mock Data Package — Primary source with synthetic venture funding data, data dictionary, CSV/JSON export, and edge cases
- World Bank API — Live economic data (GDP, GDP growth, ease of doing business)
- Crunchbase API — Optional live venture capital data (requires paid API key)

---

## File Structure

```text
real-rails-77/

├── backend/
│   ├── main.py                    # FastAPI app with all endpoints
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Copy to .env and fill keys
│   │
│   └── mock_data/
│       ├── __init__.py
│       ├── generator.py
│       └── exports.py
│
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── types/
│   │       └── css.d.ts
│   │
│   ├── components/
│   │   ├── VentureHeatMap.tsx
│   │   └── IntelligenceSidebar.tsx
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.local
│
├── .gitignore
└── README.md
```

---

## Setup and Run

### Prerequisites

- Node.js 18+
- Python 3.10+
- Git or terminal access

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment

# Windows PowerShell
venv\Scripts\Activate.ps1

# Windows cmd
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run FastAPI server
uvicorn main:app --reload --port 8000
```

Verify backend: browse to `http://localhost:8000/api/health`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run Next.js development server
npm run dev
```

Verify frontend: browse to `http://localhost:3000`

---

## How to use the dashboard

- The heatmap shows funding rounds clustered by city with color-coded intensity.
- Hover over any circle marker to view deal details including amount, sector, stage, and investor.
- Click on a city cluster to scroll and highlight that city in the sidebar rankings.
- Use filters in Section D to narrow by sector, funding stage, or year range.
- View city rankings with capital concentration and World Bank economic context.
- Review sector cards to understand capital distribution across technology sectors.
- Export filtered data as CSV using the Download button in Section E.

---

# Mock Data Package

The application includes a complete mock-data package that replaces hardcoded synthetic data with a reusable, documented system.

## Package Components

| File | Purpose |
|------|----------|
| `mock_data/generator.py` | MockDataGenerator class with methods for dataset generation, filtering, and edge cases |
| `mock_data/exports.py` | CSV and JSON export utilities with metadata headers |
| `mock_data/__init__.py` | Package exports for clean imports |

## Mock Data Endpoints

| Endpoint | Method | Description |
|-----------|----------|-------------|
| `/api/mock/data-dictionary` | GET | Complete entity and field definitions |
| `/api/mock/export/csv` | GET | Export synthetic data as CSV with metadata |
| `/api/mock/export/json` | GET | Export synthetic data as JSON with metadata |
| `/api/mock/edge-cases` | GET | Five error scenarios for testing |
| `/api/mock/sample-rows` | GET | Preview of synthetic data (10 rows) |

## Edge Cases Included

| Case | Description |
|------|-------------|
| Outlier Large Deal | $2.5B mega-round for testing extreme values |
| Micro Round | $0.05M angel investment |
| Missing Investor | "Undisclosed" lead investor |
| Future Date | Data from 2025 simulating error state |
| Negative Amount | -$5M simulating data error |

## Synthetic Data Labeling

All mock data includes clear warnings:

- CSV files start with `# ⚠️ SYNTHETIC DATA - Not real investment data`
- JSON responses include `data_quality_note` field
- Every record has `data_quality_note` property

---

# API Endpoints

## Core Endpoints

| Endpoint | Method | Description |
|-----------|----------|-------------|
| `/api/health` | GET | Health check with data source status |
| `/api/heatmap` | GET | GeoJSON FeatureCollection of funding rounds |
| `/api/summary` | GET | KPI metrics for sidebar Section A |
| `/api/city-rankings` | GET | Ranked startup hubs with capital concentration |
| `/api/sector-cards` | GET | Sector analytics with capital distribution |
| `/api/trend-lines` | GET | Quarterly capital flow for trend chart |
| `/api/filters/options` | GET | Available filter values for dropdowns |
| `/api/world-bank/country/{code}` | GET | World Bank indicators for a country |
| `/api/download/sample` | GET | CSV export of current filtered view |

## Mock Data Endpoints

| Endpoint | Method | Description |
|-----------|----------|-------------|
| `/api/mock/data-dictionary` | GET | Complete field specifications |
| `/api/mock/export/csv` | GET | Export synthetic data as CSV |
| `/api/mock/export/json` | GET | Export synthetic data as JSON |
| `/api/mock/edge-cases` | GET | Error scenarios for testing |
| `/api/mock/sample-rows` | GET | Preview of synthetic data |

## Query Parameters

All core endpoints support:

| Parameter | Type | Example |
|-----------|------|---------|
| `sector` | string | AI/ML, FinTech, HealthTech |
| `stage` | string | Series A, Seed, Growth |
| `year_from` | integer | 2021 |
| `year_to` | integer | 2023 |

Example request:

```bash
curl "http://localhost:8000/api/heatmap?sector=AI/ML&stage=Series%20A&year_from=2021&year_to=2023"
```

---

# Data Sources

| Source | Status | Notes |
|---------|---------|---------|
| Crunchbase API | Optional | Requires paid API key - integration ready |
| World Bank API | Active | Free public API - GDP, growth, business data |
| Mock Data Package | Active | Synthetic data with export and documentation |

## Data Source Priority

1. Crunchbase API - Used if `CRUNCHBASE_API_KEY` is configured and returns data
2. Mock Data Package - Automatic fallback with clear synthetic labeling

## Verify Current Data Source

```bash
curl http://localhost:8000/api/health | jq '.data_mode'
# Returns: "synthetic_mock" or "crunchbase_live"
```

---

# Enabling Crunchbase Integration

1. Obtain a Crunchbase API key from their developer portal
2. Add the key to `backend/.env`:

```env
CRUNCHBASE_API_KEY=your_api_key_here
```

3. Restart the backend server

Note: Without a valid API key, the application automatically uses the mock data package with clear synthetic labeling. The dashboard is fully functional with mock data.

---

# Environment Variables

## Backend (`backend/.env`)

| Variable | Default | Description |
|-----------|---------|-------------|
| `CRUNCHBASE_API_KEY` | (empty) | Optional - enables live Crunchbase data |
| `API_HOST` | `0.0.0.0` | Server host |
| `API_PORT` | `8000` | Server port |
| `WORLD_BANK_API_BASE` | `https://api.worldbank.org/v2` | World Bank API endpoint |

## Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|-----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

---

# Visual Identity

| Element | Color Code |
|----------|------------|
| Background | `#030712` (Obsidian Black) |
| Surface/Cards | `#0B1117` (Deep Navy Grey) |
| Primary Accent | `#38BDF8` (Electric Cyan) |
| Secondary Accent | `#818CF8` (Indigo) |
| Borders | `#1F2937` (Slate-800) |

**Typography:** Inter, Geist Sans

**Animations:** Cyan pulse for data loading, city highlight for map-sidebar handshake

## Intelligence Sidebar Sections

| Section | Content |
|----------|----------|
| Section A | KPI Metrics: Total Capital, Total Deals, Avg Deal Size, Top Hub |
| Section B | Why This Matters: Capital clustering and concentration analysis |
| Section C | Who Controls the Rail: Investor concentration and influence |
| Section D | Filters: Sector, Stage, Year Range with Reset button |
| Section E | Export: CSV download of current filtered view |

## Additional Tabs

| Tab | Content |
|------|---------|
| City Rankings | Ranked startup hubs with capital share, deal count, and top sector |
| Sector Cards | Capital distribution across 8 technology sectors |
| Trend Line | Quarterly capital flow with interactive tooltips |

## Guardrails

| Feature | Implementation |
|----------|----------------|
| Mock Fallback | Automatic when Crunchbase unavailable |
| Secret Management | Environment variables only |
| No Hardcoded Keys | Verified in code review |
| No Hardcoded Mock Data | Replaced with mock-data package |
| Live Data Indicator | Cyan pulse animation |
| Synthetic Labeling | Clear warnings on all mock data |
| Context Isolation | Per PoC session |

## Real Rails Standards

- Fresh AI session per PoC
- Mandatory 70/30 layout
- Real Rails color palette
- Mock fallback always works
- No hardcoded credentials
- Complete mock-data package with documentation
- CSV/JSON export capabilities
- Edge cases for error testing

---

## Dependencies

### Frontend

```json
{
  "next": "14.2.0",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.4.0",
  "leaflet": "^1.9.4",
  "leaflet.heat": "^0.2.0",
  "recharts": "^2.15.4",
  "lucide-react": "^0.344.0"
}
```

### Backend

```md
```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
pandas==2.2.2
httpx>=0.27.0
python-dotenv==1.0.1
```

## Key Insight

Capital formation is not evenly distributed. Funding clusters around a small number of cities and ecosystems. Understanding these clusters reveals both opportunities and concentration risks.

### Example findings from the dashboard:

- 42% of venture funding concentrated in 3 cities
- Emerging hubs detected before mainstream recognition
- Investor concentration exposes systemic risk
- GDP correlation with funding activity

---

## Acknowledgements

- World Bank - Economic data API for GDP and business indicators
- OpenStreetMap - Base map tiles
- CARTO - Dark Matter map tile layer
- Crunchbase - Venture capital data API (optional integration)

---

## Support

### Verify Backend

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "data_mode": "synthetic_mock",
  "crunchbase_configured": false,
  "mock_data_endpoints": ["/api/mock/data-dictionary", "..."]
}
```

### Verify Frontend

Check `.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Common Issues

| Issue | Solution |
|--------|----------|
| Backend connection refused | Start backend: `uvicorn main:app --reload --port 8000` |
| Mock data not loading | Verify `mock_data/` package exists in backend folder |
| CSV download fails | Confirm backend is running on port 8000 |
| Map not rendering | Check Leaflet CSS imports in `layout.tsx` |
| World Bank data missing | API is rate-limited; falls back gracefully |

### Browser Console

Open Developer Tools (F12) to see:

- API request and response logs
- Map initialization status
- Filter change events
- City selection debugging

---

## Version History

| Version | Date | Changes |
|----------|------|----------|
| 2.0.0 | June 2026 | Complete mock-data package with CSV/JSON export, data dictionary, and edge cases |
| 1.0.0 | June 2026 | Initial release with synthetic mock data fallback |

---

**End of README**


