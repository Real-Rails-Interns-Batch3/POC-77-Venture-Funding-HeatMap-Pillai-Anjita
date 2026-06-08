# UAT Checklist – Real Rails Intelligence Dashboard

## Project Information

| Field | Value |
|---------|---------|
| **Project** | Venture Funding Heatmap |
| **POC Number** | 77 |
| **Rail Category** | Capital Formation |
| **Application Type** | Real Rails Intelligence Dashboard |
| **Tester** | [Your Name] |
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
| Click on map does nothing | No action triggered; map remains interactive | ✅ PASS |

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
| City Rankings tab | Shows top cities with metrics | ✅ PASS |
| Bar width proportional | Ranking bars reflect relative capital share | ✅ PASS |
| Sector Cards tab | Shows all sectors with metrics | ✅ PASS |
| Sector colors match | Sector color assignments are correct | ✅ PASS |
| Trend Line chart | Displays quarterly capital flow | ✅ PASS |
| Trend Line tooltip | Shows exact capital amount | ✅ PASS |

---

# Data Source Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| Health endpoint | Returns `crunchbase_configured` status | ✅ PASS |
| Mock fallback | Shows synthetic data when API key unavailable | ✅ PASS |
| World Bank enrichment | GDP and GDP growth displayed where available | ✅ PASS |

---

# Download Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| CSV download | File downloads successfully with timestamped filename | ✅ PASS |
| CSV columns correct | Required fields present in exported file | ✅ PASS |
| Filters apply to download | Export reflects active filters | ✅ PASS |
| Download count matches sidebar | Export count equals displayed deal count | ✅ PASS |

### Expected CSV Columns

```text
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

# Performance Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| Rapid filter changes | UI remains responsive and loading state appears | ✅ PASS |
| Backend offline | Dashboard loads using fallback data | ✅ PASS |

---

# Visual Compliance Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| Background `#030712` | Entire application uses Obsidian Black background | ✅ PASS |
| Sidebar 30% width | Sidebar occupies exactly 30% of layout | ✅ PASS |
| Map 70% width | Main map occupies remaining 70% | ✅ PASS |
| Cyan pulse animation | Cyan indicator pulses periodically | ✅ PASS |
| Glassmorphism | Cards have transparency and blur effects | ✅ PASS |
| Scrollbar on overflow | Custom scrollbar appears when needed | ✅ PASS |

---

# Error Handling Validation

| Test Case | Expected Result | Status |
|------------|-----------------|---------|
| Backend stopped | Mock data loads with warning only | ✅ PASS |
| Invalid filter | UI displays zero results gracefully | ✅ PASS |
| Network disconnect | Error handled via fallback mechanism | ✅ PASS |

---

# Final Acceptance Summary

## Acceptance Criteria

| Criteria | Status |
|------------|---------|
| All required APIs operational | ✅ PASS |
| Dashboard visualizations functional | ✅ PASS |
| Filters working correctly | ✅ PASS |
| Map interactions validated | ✅ PASS |
| Export functionality verified | ✅ PASS |
| Intelligence sidebar functioning correctly | ✅ PASS |
| World Bank enrichment active | ✅ PASS |
| Mock fallback working | ✅ PASS |

---

## Test Summary

| Metric | Value |
|---------|---------|
| Total Test Cases | 44 |
| Passed | 44 |
| Failed | 0 |
| Pass Rate | 100% |

---

# Result

## ✅ Overall UAT Status: PASS

The **Real Rails Intelligence Dashboard** satisfies all functional requirements defined for **POC #77 – Venture Funding Heatmap** and is approved for submission.

---

# Sign-Off

| Field | Value |
|---------|---------|
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

---

<div align="center">

### 🚀 UAT APPROVED

**Project 77 — Venture Funding Heatmap**

*Real Rails Intelligence Library · Capital Formation Rail*

</div>

---

*End of UAT Checklist*