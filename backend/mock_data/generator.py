"""
Mock Data Generator for Venture Funding Heatmap
Synthetic data - Not real investment data
"""

import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import pandas as pd

class MockDataGenerator:
    """Generates realistic synthetic venture funding data"""
    
    def __init__(self, seed: int = 42):
        random.seed(seed)
        self.data_quality_note = "⚠️ SYNTHETIC DATA - For demonstration purposes only. Not real investment data."
        
        # Entity definitions
        self.sectors = ["FinTech", "HealthTech", "CleanEnergy", "DeepTech", "AI/ML", "Logistics", "EdTech", "AgriTech"]
        self.stages = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Series D+", "Growth"]
        self.investors = [
            "Sequoia Capital", "Andreessen Horowitz", "Tiger Global", "SoftBank Vision Fund",
            "Accel Partners", "Kleiner Perkins", "Bessemer Venture Partners", "General Catalyst",
            "GV", "Insight Partners", "Index Ventures", "Benchmark"
        ]
        
        # Hub definitions with lat/lng
        self.hubs = [
            {"city": "San Francisco", "country": "USA", "country_code": "US", "lat": 37.7749, "lng": -122.4194, "weight": 1.0},
            {"city": "New York", "country": "USA", "country_code": "US", "lat": 40.7128, "lng": -74.0060, "weight": 0.85},
            {"city": "London", "country": "UK", "country_code": "GB", "lat": 51.5074, "lng": -0.1278, "weight": 0.75},
            {"city": "Beijing", "country": "China", "country_code": "CN", "lat": 39.9042, "lng": 116.4074, "weight": 0.70},
            {"city": "Shanghai", "country": "China", "country_code": "CN", "lat": 31.2304, "lng": 121.4737, "weight": 0.65},
            {"city": "Berlin", "country": "Germany", "country_code": "DE", "lat": 52.5200, "lng": 13.4050, "weight": 0.55},
            {"city": "Bangalore", "country": "India", "country_code": "IN", "lat": 12.9716, "lng": 77.5946, "weight": 0.60},
            {"city": "Tel Aviv", "country": "Israel", "country_code": "IL", "lat": 32.0853, "lng": 34.7818, "weight": 0.50},
            {"city": "Singapore", "country": "Singapore", "country_code": "SG", "lat": 1.3521, "lng": 103.8198, "weight": 0.55},
            {"city": "Boston", "country": "USA", "country_code": "US", "lat": 42.3601, "lng": -71.0589, "weight": 0.60},
            {"city": "Austin", "country": "USA", "country_code": "US", "lat": 30.2672, "lng": -97.7431, "weight": 0.45},
            {"city": "Seattle", "country": "USA", "country_code": "US", "lat": 47.6062, "lng": -122.3321, "weight": 0.50},
            {"city": "Paris", "country": "France", "country_code": "FR", "lat": 48.8566, "lng": 2.3522, "weight": 0.45},
            {"city": "Stockholm", "country": "Sweden", "country_code": "SE", "lat": 59.3293, "lng": 18.0686, "weight": 0.40},
            {"city": "Toronto", "country": "Canada", "country_code": "CA", "lat": 43.6532, "lng": -79.3832, "weight": 0.45},
            {"city": "São Paulo", "country": "Brazil", "country_code": "BR", "lat": -23.5505, "lng": -46.6333, "weight": 0.35},
            {"city": "Dubai", "country": "UAE", "country_code": "AE", "lat": 25.2048, "lng": 55.2708, "weight": 0.35},
            {"city": "Tokyo", "country": "Japan", "country_code": "JP", "lat": 35.6762, "lng": 139.6503, "weight": 0.40},
            {"city": "Sydney", "country": "Australia", "country_code": "AU", "lat": -33.8688, "lng": 151.2093, "weight": 0.35},
            {"city": "Amsterdam", "country": "Netherlands", "country_code": "NL", "lat": 52.3676, "lng": 4.9041, "weight": 0.38},
        ]
        
        # Stage multipliers for realistic deal sizes
        self.stage_multipliers = {
            "Pre-Seed": 0.5, "Seed": 1.0, "Series A": 3.5,
            "Series B": 10.0, "Series C": 30.0, "Series D+": 80.0, "Growth": 120.0
        }
    
    def generate_funding_round(self, idx: int, year_from: int = 2019, year_to: int = 2024) -> Dict[str, Any]:
        """Generate a single synthetic funding round"""
        hub = random.choices(self.hubs, weights=[h["weight"] for h in self.hubs])[0]
        
        # Select stage with realistic distribution
        stage = random.choices(
            self.stages,
            weights=[0.08, 0.20, 0.22, 0.18, 0.12, 0.08, 0.12]
        )[0]
        
        # Generate deal size based on stage
        stage_multiplier = self.stage_multipliers[stage]
        amount_usd_m = round(random.gauss(stage_multiplier, stage_multiplier * 0.4), 2)
        amount_usd_m = max(0.1, amount_usd_m)
        
        # Generate random date
        base_date = datetime(year_from, 1, 1)
        days_offset = random.randint(0, (datetime(year_to, 12, 31) - base_date).days)
        deal_date = base_date + timedelta(days=days_offset)
        
        return {
            "id": f"synth_{uuid.uuid4().hex[:8]}",
            "company": f"SynthCorp {idx + 1}",
            "city": hub["city"],
            "country": hub["country"],
            "country_code": hub["country_code"],
            "lat": hub["lat"] + random.gauss(0, 0.3),
            "lng": hub["lng"] + random.gauss(0, 0.3),
            "sector": random.choice(self.sectors),
            "stage": stage,
            "amount_usd_m": amount_usd_m,
            "lead_investor": random.choice(self.investors),
            "date": deal_date.strftime("%Y-%m-%d"),
            "year": deal_date.year,
            "quarter": f"{deal_date.year}Q{(deal_date.month - 1) // 3 + 1}",
            "data_quality_note": self.data_quality_note
        }
    
    def generate_dataset(self, num_rows: int = 500, year_from: int = 2019, year_to: int = 2024) -> pd.DataFrame:
        """Generate full dataset of synthetic funding rounds"""
        rounds = [self.generate_funding_round(i, year_from, year_to) for i in range(num_rows)]
        df = pd.DataFrame(rounds)
        
        # Add derived metrics
        global_avg = df["amount_usd_m"].mean()
        df["pct_above_global_avg"] = ((df["amount_usd_m"] - global_avg) / global_avg * 100).round(1)
        
        return df
    
    def generate_edge_cases(self) -> pd.DataFrame:
        """Generate edge cases and unusual scenarios"""
        edge_cases = []
        
        # Case 1: Extremely large deal (outlier)
        edge_cases.append({
            "id": "edge_outlier_001",
            "company": "MegaCorp AI",
            "city": "San Francisco",
            "country": "USA",
            "country_code": "US",
            "lat": 37.7749,
            "lng": -122.4194,
            "sector": "AI/ML",
            "stage": "Growth",
            "amount_usd_m": 2500.0,
            "lead_investor": "SoftBank Vision Fund",
            "date": "2023-06-15",
            "year": 2023,
            "quarter": "2023Q2",
            "data_quality_note": "⚠️ SYNTHETIC DATA - Edge case: Outlier large deal",
            "pct_above_global_avg": 12500.0
        })
        
        # Case 2: Very small deal (micro round)
        edge_cases.append({
            "id": "edge_micro_002",
            "company": "NanoStart",
            "city": "Austin",
            "country": "USA",
            "country_code": "US",
            "lat": 30.2672,
            "lng": -97.7431,
            "sector": "DeepTech",
            "stage": "Pre-Seed",
            "amount_usd_m": 0.05,
            "lead_investor": "Angel List Syndicate",
            "date": "2024-01-10",
            "year": 2024,
            "quarter": "2024Q1",
            "data_quality_note": "⚠️ SYNTHETIC DATA - Edge case: Micro round",
            "pct_above_global_avg": -99.5
        })
        
        # Case 3: Missing investor data
        edge_cases.append({
            "id": "edge_missing_003",
            "company": "Stealth Mode Ltd",
            "city": "London",
            "country": "UK",
            "country_code": "GB",
            "lat": 51.5074,
            "lng": -0.1278,
            "sector": "CleanEnergy",
            "stage": "Seed",
            "amount_usd_m": 2.5,
            "lead_investor": "Undisclosed",
            "date": "2023-12-01",
            "year": 2023,
            "quarter": "2023Q4",
            "data_quality_note": "⚠️ SYNTHETIC DATA - Edge case: Undisclosed investor",
            "pct_above_global_avg": -75.0
        })
        
        # Case 4: Future date (error state)
        edge_cases.append({
            "id": "edge_future_004",
            "company": "FutureTech AI",
            "city": "Singapore",
            "country": "Singapore",
            "country_code": "SG",
            "lat": 1.3521,
            "lng": 103.8198,
            "sector": "AI/ML",
            "stage": "Series A",
            "amount_usd_m": 15.0,
            "lead_investor": "Sequoia Capital",
            "date": "2025-06-01",
            "year": 2025,
            "quarter": "2025Q2",
            "data_quality_note": "⚠️ SYNTHETIC DATA - Edge case: Future date (error state)",
            "pct_above_global_avg": 50.0
        })
        
        # Case 5: Negative amount (data error simulation)
        edge_cases.append({
            "id": "edge_negative_005",
            "company": "Error Corp",
            "city": "New York",
            "country": "USA",
            "country_code": "US",
            "lat": 40.7128,
            "lng": -74.0060,
            "sector": "FinTech",
            "stage": "Series B",
            "amount_usd_m": -5.0,
            "lead_investor": "Unknown",
            "date": "2023-08-20",
            "year": 2023,
            "quarter": "2023Q3",
            "data_quality_note": "⚠️ SYNTHETIC DATA - Edge case: Negative amount (error simulation)",
            "pct_above_global_avg": -125.0
        })
        
        df = pd.DataFrame(edge_cases)
        return df
    
    def generate_with_filters(self, sector: Optional[str] = None, stage: Optional[str] = None, 
                             year_from: Optional[int] = None, year_to: Optional[int] = None,
                             num_rows: int = 500) -> pd.DataFrame:
        """Generate filtered dataset"""
        df = self.generate_dataset(num_rows, year_from or 2019, year_to or 2024)
        
        if sector and sector != "All":
            df = df[df["sector"] == sector]
        if stage and stage != "All":
            df = df[df["stage"] == stage]
        if year_from:
            df = df[df["year"] >= year_from]
        if year_to:
            df = df[df["year"] <= year_to]
            
        return df
    
    def get_data_dictionary(self) -> Dict[str, Any]:
        """Return data dictionary for all entities and fields"""
        return {
            "data_quality_note": "⚠️ ALL DATA IS SYNTHETIC - Generated for demonstration purposes only",
            "entities": {
                "funding_round": {
                    "description": "A synthetic venture capital funding transaction",
                    "fields": {
                        "id": {"type": "string", "description": "Unique identifier for the funding round", "example": "synth_a1b2c3d4"},
                        "company": {"type": "string", "description": "Synthetic company name receiving funding", "example": "SynthCorp 42"},
                        "city": {"type": "string", "description": "City where company is headquartered", "example": "San Francisco"},
                        "country": {"type": "string", "description": "Country name", "example": "USA"},
                        "country_code": {"type": "string", "description": "ISO 3166-1 alpha-2 country code", "example": "US"},
                        "lat": {"type": "float", "description": "Latitude coordinate", "example": 37.7749},
                        "lng": {"type": "float", "description": "Longitude coordinate", "example": -122.4194},
                        "sector": {"type": "string", "description": "Industry sector", "enum": self.sectors},
                        "stage": {"type": "string", "description": "Funding stage", "enum": self.stages},
                        "amount_usd_m": {"type": "float", "description": "Funding amount in millions of USD", "example": 15.5},
                        "lead_investor": {"type": "string", "description": "Lead investor name", "example": "Sequoia Capital"},
                        "date": {"type": "date", "description": "Funding announcement date", "format": "YYYY-MM-DD"},
                        "year": {"type": "integer", "description": "Year of funding", "example": 2023},
                        "quarter": {"type": "string", "description": "Quarter of funding", "example": "2023Q2"},
                        "pct_above_global_avg": {"type": "float", "description": "Percentage above/below global average deal size"}
                    }
                },
                "city_hub": {
                    "description": "Global innovation hub locations",
                    "fields": {
                        "city": {"type": "string", "description": "City name"},
                        "country": {"type": "string", "description": "Country name"},
                        "country_code": {"type": "string", "description": "ISO country code"},
                        "lat": {"type": "float", "description": "Latitude"},
                        "lng": {"type": "float", "description": "Longitude"},
                        "weight": {"type": "float", "description": "Relative importance weight (0-1)"}
                    }
                }
            },
            "statistical_distribution": {
                "deal_size_by_stage": self.stage_multipliers,
                "sector_distribution": "Uniform random selection from 8 sectors",
                "geographic_distribution": "Weighted random based on hub weights",
                "temporal_distribution": "Linear distribution from 2019-2024"
            }
        }