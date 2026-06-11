# UAT Checklist – Real Rails Intelligence Dashboard

## Project Information

| Field | Value |
|---------|---------|
| **Project** | Venture Funding Heatmap |
| **POC Number** | 77 |
| **Rail Category** | Capital Formation |
| **Application Type** | Real Rails Intelligence Dashboard |
| **Tester** | Pillai Anjita |
| **Test Date** | June 2026 |

---

## Objective

This User Acceptance Testing (UAT) checklist validates that all required functionality, dashboard interactions, visualizations, intelligence panels, filtering mechanisms, data integrations, and export capabilities operate as expected.

---

# Handshake Validation (Map ↔ Sidebar)

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| Hover over circle marker shows tooltip | Tooltip appears with company, city, amount, stage, sector, insight, investor | ✅ PASS |
| Mouse out removes tooltip | Tooltip disappears immediately | ✅ PASS |
| Cyan circle (above average) expands | Circle radius increases on hover | ✅ PASS |
| Indigo circle (below average) expands | Circle radius increases on hover | ✅ PASS |
| Tooltip contains World Bank data | Insight includes GDP or GDP growth information | ✅ PASS |
| Click on map circle highlights city in sidebar | Selected city scrolls into view with highlight animation | ✅ PASS |

---

# Mock Data Package Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| Data dictionary endpoint | `/api/mock/data-dictionary` returns complete field definitions | ✅ PASS |
| CSV export endpoint | `/api/mock/export/csv` downloads synthetic data with metadata | ✅ PASS |
| JSON export endpoint | `/api/mock/export/json` downloads synthetic data with metadata | ✅ PASS |
| Edge cases endpoint | `/api/mock/edge-cases` returns 5 error scenarios | ✅ PASS |
| Sample rows endpoint | `/api/mock/sample-rows` returns preview of synthetic data | ✅ PASS |
| CSV includes synthetic warning | First line contains "SYNTHETIC DATA" warning | ✅ PASS |
| JSON includes metadata | JSON output has data_quality_note field | ✅ PASS |
| Edge case: Outlier large deal | $2.5B deal appears in edge cases | ✅ PASS |
| Edge case: Micro round | $0.05M deal appears in edge cases | ✅ PASS |
| Edge case: Missing investor | "Undisclosed" investor appears | ✅ PASS |
| Edge case: Future date | Year 2025 date appears with error note | ✅ PASS |
| Edge case: Negative amount | -$5M appears as error simulation | ✅ PASS |

---

# Filter Logic Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| Sector filter updates map | Map shows only selected sector deals | ✅ PASS |
| Sector = FinTech | Map displays FinTech deals only | ✅ PASS |
| Stage = Series A | Map displays Series A rounds only | ✅ PASS |
| Stage = Seed | Map displays Seed rounds only | ✅ PASS |
| Year From slider updates | Deals before selected year are removed | ✅ PASS |
| Year To slider updates | Deals after selected year are removed | ✅ PASS |
| Year range combination | Only deals within selected range appear | ✅ PASS |
| Multi-filter combination | Sector, Stage, and Year filters work together | ✅ PASS |
| Reset to defaults | Reset button restores all default values | ✅ PASS |
| Filter options load from backend | Dropdown values populate correctly | ✅ PASS |

---

# Intelligence Panel Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| Section A – Capital Metrics | Shows Total Capital, Total Deals, Avg Deal Size, Top Hub | ✅ PASS |
| Section B – Why This Matters | Displays capital clustering explanation | ✅ PASS |
| Section B reflects actual data | Mentions concentration in major cities | ✅ PASS |
| Section C – Who Controls the Rail | Displays investor concentration explanation | ✅ PASS |
| Section C reflects investor data | Tooltips display lead investors | ✅ PASS |
| City Rankings tab | Shows top 20 cities with metrics | ✅ PASS |
| Bar width proportional | Ranking bars reflect relative capital share | ✅ PASS |
| Sector Cards tab | Shows all 8 sectors with metrics | ✅ PASS |
| Sector colors match | Sector color assignments are correct | ✅ PASS |
| Trend Line chart | Displays quarterly capital flow | ✅ PASS |
| Trend Line tooltip | Shows exact capital amount | ✅ PASS |

---

# Data Source Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| Health endpoint | Returns `crunchbase_configured` status | ✅ PASS |
| Health endpoint shows data_mode | Returns "synthetic_mock" or "crunchbase_live" | ✅ PASS |
| Health endpoint lists mock endpoints | Shows 5 mock data endpoints in response | ✅ PASS |
| Mock fallback | Shows synthetic data when API key unavailable | ✅ PASS |
| World Bank enrichment | GDP and GDP growth displayed where available | ✅ PASS |
| Data source label visible | Sidebar shows "SYNTHETIC MOCK DATA" warning | ✅ PASS |

---

# Download Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| CSV download | File downloads successfully with timestamped filename | ✅ PASS |
| CSV columns correct | Required fields present in exported file | ✅ PASS |
| CSV includes synthetic warning | DATA_QUALITY_NOTE column with warning text | ✅ PASS |
| CSV includes Data_Source column | Shows source of data (synthetic or live) | ✅ PASS |
| Filters apply to download | Export reflects active filters | ✅ PASS |
| Download count matches sidebar | Export count equals displayed deal count | ✅ PASS |
| Filename includes synthetic label | "synthetic_funding" in filename | ✅ PASS |

---

### Expected CSV Columns

```text
DATA_QUALITY_NOTE
Company
City
Country
Sector
Stage
Amount_USD_Millions
Lead_Investor
Date
Pct_Above_Global_Avg
Data_Source
```

---

## Performance Validation

| Test Case | Expected Result | Status |
|------------|----------------|--------|
| Rapid filter changes | UI remains responsive and loading state appears | ✅ PASS |
| Backend offline | Dashboard loads using fallback data | ✅ PASS |
| Map loads within 3 seconds | Initial map render completes quickly | ✅ PASS |
| Filter response under 1 second | Filters apply without noticeable delay | ✅ PASS |

---

## Visual Compliance Validation

| Test Case | Expected Result | Status |
|------------|----------------|--------|
| Background #030712 | Entire application uses Obsidian Black background | ✅ PASS |
| Sidebar 30% width | Sidebar occupies exactly 30% of layout | ✅ PASS |
| Map 70% width | Main map occupies remaining 70% | ✅ PASS |
| Cyan pulse animation | Cyan indicator pulses periodically | ✅ PASS |
| Glassmorphism | Cards have transparency and blur effects | ✅ PASS |
| Scrollbar on overflow | Custom scrollbar appears when needed | ✅ PASS |
| City highlight animation | Selected city pulses with cyan glow | ✅ PASS |

---

## Error Handling Validation

| Test Case | Expected Result | Status |
|------------|----------------|--------|
| Backend stopped | Mock data loads with warning only | ✅ PASS |
| Invalid filter | UI displays zero results gracefully | ✅ PASS |
| Network disconnect | Error handled via fallback mechanism | ✅ PASS |
| Invalid country code | Returns 404 with helpful message | ✅ PASS |
| Negative amount in edge case | Displayed as error state, not crashed | ✅ PASS |

---

## Mock Data Endpoints Validation

| Endpoint | Expected Response | Status |
|----------|------------------|--------|
| GET /api/mock/data-dictionary | JSON with entities, fields, distributions | ✅ PASS |
| GET /api/mock/export/csv | CSV file with metadata comments | ✅ PASS |
| GET /api/mock/export/json | JSON with metadata wrapper | ✅ PASS |
| GET /api/mock/edge-cases | 5 edge case records with descriptions | ✅ PASS |
| GET /api/mock/sample-rows | 10 sample records for preview | ✅ PASS |

---

## Final Acceptance Summary

| Acceptance Criteria | Status |
|---------------------|--------|
| All required APIs operational | ✅ PASS |
| Dashboard visualizations functional | ✅ PASS |
| Filters working correctly | ✅ PASS |
| Map interactions validated | ✅ PASS |
| Export functionality verified | ✅ PASS |
| Intelligence sidebar functioning correctly | ✅ PASS |
| World Bank enrichment active | ✅ PASS |
| Mock fallback working | ✅ PASS |
| Mock data package complete | ✅ PASS |
| CSV + JSON export available | ✅ PASS |
| Edge cases documented | ✅ PASS |
| Clear synthetic labeling | ✅ PASS |

---

## Test Summary

| Metric | Value |
|----------|-------|
| Total Test Cases | 62 |
| Passed | 62 |
| Failed | 0 |
| Pass Rate | 100% |

---

## Result

**✅ Overall UAT Status: PASS**

The Real Rails Intelligence Dashboard satisfies all functional requirements defined for POC #77 – Venture Funding Heatmap and is approved for submission.

The mock-data package implementation successfully replaces hardcoded data with a proper synthetic data generation system featuring:

- Complete data dictionary with entity/field definitions
- CSV and JSON export capabilities
- Clear synthetic labeling on all records
- Edge cases for error state testing
- Sample rows for preview

---

## Sign-Off

| Field | Value |
|--------|--------|
| Tester | Pillai Anjita |
| Date | June 2026 |
| Status | APPROVED |
| Ready for Submission | YES |

---

## Certification

✅ Functional Requirements Verified

✅ Visual Compliance Verified

✅ Data Integration Verified

✅ Export Functionality Verified

✅ Fallback Logic Verified

✅ User Experience Validated

✅ Production Submission Approved

✅ Mock Data Package Validated

✅ Edge Cases Tested

---

<div align="center">

# UAT APPROVED

### Project 77 — Venture Funding Heatmap

**Real Rails Intelligence Library · Capital Formation Rail**

</div>

---

**End of UAT Checklist**
