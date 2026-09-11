import os
import json
from typing import List, Dict, Any, Optional

# Path configuration for data persistence
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

class HistoryService:
    def __init__(self):
        # Ensure data folder directory exists
        os.makedirs(DATA_DIR, exist_ok=True)

    def get_history(
        self,
        status: Optional[str] = None,
        concept_tag: Optional[str] = None,
        severity: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Public method to read and query all diagnosis JSON files.
        Returns a chronologically sorted list (most recent first) of diagnosis summaries.
        """
        records: List[Dict[str, Any]] = []

        # 1. Read files
        if not os.path.exists(DATA_DIR):
            return []

        try:
            for file_name in os.listdir(DATA_DIR):
                if file_name.endswith(".json"):
                    file_path = os.path.join(DATA_DIR, file_name)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if isinstance(data, dict) and "diagnosis_id" in data:
                                records.append(data)
                    except (json.JSONDecodeError, IOError):
                        # Gracefully skip corrupt or locked files
                        continue
        except Exception as e:
            raise RuntimeError(f"Failed to scan history directories: {str(e)}")

        # 2. Sort by timestamp descending (most recent first)
        # ISO 8601 timestamps (e.g. 2026-08-16T15:45:00Z) sort correctly alphabetically
        records = sorted(
            records,
            key=lambda x: x.get("timestamp", ""),
            reverse=True
        )

        # 3. Apply optional filtering (case-insensitive)
        if status and status != "ALL":
            records = [r for r in records if r.get("status", "").lower() == status.lower()]

        if concept_tag and concept_tag != "ALL":
            records = [
                r for r in records 
                if (r.get("concept_tag") or r.get("conceptTag") or "").lower() == concept_tag.lower()
            ]

        if severity and severity != "ALL":
            records = [r for r in records if r.get("severity", "").lower() == severity.lower()]

        # 4. Apply optional search (ID, Root Cause, Symptom)
        if search_query:
            query = search_query.lower().strip()
            records = [
                r for r in records
                if query in r.get("diagnosis_id", "").lower()
                or query in r.get("root_cause", "").lower()
                or query in r.get("symptom", "").lower()
            ]

        return records
