#!/usr/bin/env python3
"""
Generate CSV and JSON files for the mock data package
Run this ONCE to create the data files that the backend will read from
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mock_data import MockDataGenerator, save_to_files
import pandas as pd

def main():
    print("🔧 Generating mock data files...")
    
    # Initialize generator
    generator = MockDataGenerator(seed=42)
    
    # Generate main dataset (500 rows)
    df = generator.generate_dataset(num_rows=500, year_from=2019, year_to=2024)
    
    # Add the 5 edge cases to the main dataset? NO - keep them separate as per mentor's requirement
    # Edge cases should be available but NOT in main KPI calculations
    
    # Save to files in the mock_data directory
    output_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Save main data
    main_csv = os.path.join(output_dir, "venture_funding_data.csv")
    main_json = os.path.join(output_dir, "venture_funding_data.json")
    
    # Save CSV
    df.to_csv(main_csv, index=False)
    print(f"✅ CSV saved: {main_csv}")
    
    # Save JSON
    records = df.to_dict(orient="records")
    with open(main_json, "w") as f:
        import json
        json.dump({
            "data_quality_note": "⚠️ SYNTHETIC DATA - For demonstration purposes only. Not real investment data.",
            "generated_at": pd.Timestamp.now().isoformat(),
            "record_count": len(records),
            "data": records
        }, f, indent=2)
    print(f"✅ JSON saved: {main_json}")
    
    # Save edge cases separately
    edge_df = generator.generate_edge_cases()
    edge_csv = os.path.join(output_dir, "venture_funding_edge_cases.csv")
    edge_json = os.path.join(output_dir, "venture_funding_edge_cases.json")
    
    edge_df.to_csv(edge_csv, index=False)
    print(f"✅ Edge cases CSV saved: {edge_csv}")
    
    with open(edge_json, "w") as f:
        json.dump({
            "data_quality_note": "⚠️ SYNTHETIC DATA - Edge cases for testing error handling",
            "edge_case_count": len(edge_df),
            "edge_cases": edge_df.to_dict(orient="records")
        }, f, indent=2)
    print(f"✅ Edge cases JSON saved: {edge_json}")
    
    print(f"\n📊 Summary:")
    print(f"   - Main data: {len(df)} rows")
    print(f"   - Edge cases: {len(edge_df)} rows")
    print(f"\n✅ Done! Backend will now read from these files.")

if __name__ == "__main__":
    main()