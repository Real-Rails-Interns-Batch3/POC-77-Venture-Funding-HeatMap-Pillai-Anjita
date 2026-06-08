# Real Rails Intelligence Library — Project 77: Venture Funding Heatmap

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?style=for-the-badge&logo=fastapi)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

### Capital Formation Intelligence — Where Venture Capital Clusters

</div>

---

# Overview

**Real Rails: Project 77** is a production-style intelligence dashboard that visualizes global venture capital formation.

It answers an important question:

> **Where is capital concentrating, and what does that mean for the infrastructure of innovation?**

The platform reveals geographic clusters of startup funding, enriched with World Bank macroeconomic context and includes Crunchbase API integration (requires paid key) with automatic synthetic-data fallback

---

# Live Demo Features

| Feature | Description |
|----------|------------|
| Global Heatmap | Interactive map showing funding round intensity |
| City Rankings | Ranked startup hubs by capital concentration |
| Sector Cards | AI, FinTech, HealthTech, Clean Energy and more |
| Trend Lines | Quarterly capital flow visualization |
| Smart Filters | Filter by sector, stage and years |
| CSV Export | Download filtered datasets |
| World Bank Enrichment | GDP, GDP Growth and Business Environment data |

---

# Key Insight

> Capital formation is not evenly distributed. Funding clusters around a small number of cities and ecosystems. Understanding these clusters reveals both opportunities and concentration risks.

Example:

- 42% of venture funding concentrated in 3 cities
- Emerging hubs detected before mainstream recognition
- Investor concentration exposes systemic risk

---

# Visual Identity

```text
Background:     #030712 (Obsidian Black)
Surface/Cards:  #0B1117 (Deep Navy Grey)
Primary Accent: #38BDF8 (Electric Cyan)
Secondary:      #818CF8 (Indigo)
Borders:        #1F2937 (Slate-800)

Typography:
- Inter
- Geist Sans
```

---

# Architecture

```text
┌──────────────────────────────────────────────┐
│                User Browser                  │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│             Next.js Frontend                 │
│                                               │
│  Main Stage (70%)      Sidebar (30%)         │
│  • Heatmap             • KPI Metrics         │
│  • Markers             • Why Matters         │
│  • Tooltips            • Who Controls        │
│                        • Filters             │
│                        • CSV Export          │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│               FastAPI Backend                │
│                                               │
│ /api/heatmap                                 │
│ /api/summary                                 │
│ /api/city-rankings                           │
│ /api/sector-cards                            │
│ /api/trend-lines                             │
│ /api/download/sample                         │
└──────────────────┬───────────────────────────┘
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼

  World Bank   Mock Data    Crunchbase
   API        (Active)     (Optional - needs key)
```

---

# Project Structure

```text
real-rails-77/

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
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

# Installation

## Prerequisites

- Node.js 18+
- Python 3.10+
- pip

---

## Step 1 — Clone Repository

```bash
git clone <your-repo-url>
cd real-rails-77
```

---

## Step 2 — Setup Backend

```bash
cd backend

python -m venv venv

# Linux / Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Create environment file:

```bash
cp .env.example .env
```

Optional:

```env
CRUNCHBASE_API_KEY=your_key_here
```

---

## Step 3 — Setup Frontend

```bash
cd frontend

npm install
```

Create:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

inside `.env.local`

---

## Step 4 — Run Backend

```bash
cd backend

uvicorn main:app --reload --port 8000
```

---

## Step 5 — Run Frontend

```bash
cd frontend

npm run dev
```

---

## Step 6 — Open Browser

```text
http://localhost:3000
```

---

# API Endpoints

| Endpoint | Method | Purpose |
|-----------|---------|----------|
| /api/health | GET | Health Check |
| /api/heatmap | GET | Funding GeoJSON |
| /api/summary | GET | KPI Metrics |
| /api/city-rankings | GET | Startup Hubs |
| /api/sector-cards | GET | Sector Analytics |
| /api/trend-lines | GET | Quarterly Trends |
| /api/filters/options | GET | Available Filters |
| /api/world-bank/country/{code} | GET | Country Data |
| /api/download/sample | GET | CSV Export |

---

# Query Parameters

All endpoints support:

```text
sector
stage
year_from
year_to
```

Example:

```bash
curl "http://localhost:8000/api/heatmap?sector=AI/ML&stage=Series%20A&year_from=2021&year_to=2023"
```

---

# 🗺️ Data Sources

| Source | Status | Notes |
|--------|--------|-------|
| Crunchbase API | Not Configured | Requires paid API key - integration ready |
| World Bank API | Active | Free public API - GDP, growth, business data |
| Synthetic Mock Data | Active | Generates realistic venture funding rounds |

---

# Enabling Crunchbase

Get an API key and add:

```env
CRUNCHBASE_API_KEY=your_api_key
```

to:

```text
backend/.env
```

Restart backend.

Note: Without a valid API key, the application automatically uses synthetic mock data. The dashboard is fully functional with mock data.

---

# Usage Guide

## Filters

- Sector
- Funding Stage
- Year Range

## Map Interaction

- Hover markers for details
- Funding intensity heat layer
- Color-coded concentration

## CSV Export

Download all currently filtered funding records.

---

# Data Source Status

By default, the application uses synthetic mock data. 

To verify current data source:
```bash
curl localhost:8000/api/health

---

# Guardrails

| Feature | Implementation |
|----------|---------------|
| Mock Fallback | Automatic |
| Secret Management | Environment Variables |
| No Hardcoded Keys | Yes |
| Live Data Indicator | Cyan Pulse |
| Context Isolation | Per PoC Session |

---

# Dependencies

## Frontend

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

## Backend

```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
pandas==2.2.2
httpx>=0.27.0
python-dotenv==1.0.1
```

---

# Environment Variables

## Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Backend

```env
CRUNCHBASE_API_KEY=
API_HOST=0.0.0.0
API_PORT=8000
```

---

# Intelligence Layer

| Raw Data | Insight |
|-----------|----------|
| Funding Amount | Above/Below Average |
| City Funding | Market Share |
| GDP Data | Economic Context |

Sidebar Sections:

### A. KPI Metrics

High-level venture ecosystem indicators.

### B. Why It Matters

Explains funding concentration and innovation geography.

### C. Who Controls

Highlights investor concentration and influence.

### D. Filters

Interactive exploration controls.

### E. Export

Downloadable datasets.

---

# Real Rails Standards

1. Fresh AI session per PoC
2. Mandatory 70/30 layout
3. Real Rails color palette
4. Mock fallback always works
5. No hardcoded credentials


---

# Acknowledgements

- World Bank
- OpenStreetMap
- CARTO (Dark Matter Tiles)

---

# Support

Verify backend:

```bash
curl localhost:8000/api/health
```

Verify frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Check browser console for API issues.

---

<div align="center">

Built with ☕ and Electric Cyan

**Real Rails Intelligence Library**

</div>