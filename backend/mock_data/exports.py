"""
Export utilities for mock data
Supports CSV and JSON formats
"""

import json
import io
import pandas as pd
from typing import Dict, Any, Optional
from datetime import datetime

def export_to_csv(df: pd.DataFrame, include_metadata: bool = True) -> str:
    """Export DataFrame to CSV string with metadata"""
    output = io.StringIO()
    
    if include_metadata:
        # Add metadata as comments
        output.write("# ⚠️ SYNTHETIC DATA - Not real investment data\n")
        output.write(f"# Generated: {datetime.now().isoformat()}\n")
        output.write("# Data Quality Note: All values are artificially generated for demonstration\n")
        output.write("#\n")
    
    df.to_csv(output, index=False)
    return output.getvalue()

def export_to_json(df: pd.DataFrame, include_metadata: bool = True) -> str:
    """Export DataFrame to JSON string with metadata"""
    records = df.to_dict(orient="records")
    
    if include_metadata:
        output = {
            "data_quality_note": "⚠️ SYNTHETIC DATA - For demonstration purposes only. Not real investment data.",
            "generated_at": datetime.now().isoformat(),
            "record_count": len(records),
            "data": records
        }
        return json.dumps(output, indent=2)
    else:
        return json.dumps(records, indent=2)

def save_to_files(df: pd.DataFrame, base_filename: str = "venture_funding_data"):
    """Save DataFrame to both CSV and JSON files"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save CSV
    csv_content = export_to_csv(df)
    csv_filename = f"{base_filename}_{timestamp}.csv"
    with open(csv_filename, "w") as f:
        f.write(csv_content)
    
    # Save JSON
    json_content = export_to_json(df)
    json_filename = f"{base_filename}_{timestamp}.json"
    with open(json_filename, "w") as f:
        f.write(json_content)
    
    return {
        "csv_file": csv_filename,
        "json_file": json_filename,
        "record_count": len(df)
    }