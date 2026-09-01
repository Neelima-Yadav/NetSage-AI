import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Literal

# Path configuration for data persistence
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

DIAGNOSIS_FIELDS = (
    "root_cause",
    "confidence",
    "osi_layer",
    "evidence",
    "recommended_next_show_command",
    "suggested_configuration_changes",
    "step_by_step_troubleshooting",
    "severity",
    "rule_validation",
)

class HumanReviewService:
    def __init__(self):
        # Ensure data folder directory exists
        os.makedirs(DATA_DIR, exist_ok=True)

    def review_diagnosis(
        self,
        diagnosis_id: str,
        action: Literal["Accept", "Edit", "Reject"],
        reviewer_notes: Optional[str] = None,
        # Override fields (relevant only for Edit action)
        root_cause: Optional[str] = None,
        recommended_next_show_command: Optional[str] = None,
        suggested_configuration_changes: Optional[str] = None,
        step_by_step_troubleshooting: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Public method to apply human verification choices to a generated diagnosis,
        persisting the final results to a local JSON file under backend/app/data/.
        """
        # 1. Validation
        if not diagnosis_id:
            raise ValueError("Diagnosis ID must be provided and cannot be empty.")
            
        if action not in ["Accept", "Edit", "Reject"]:
            raise ValueError(f"Invalid review action: '{action}'. Must be 'Accept', 'Edit', or 'Reject'.")

        file_path = os.path.join(DATA_DIR, f"{diagnosis_id}.json")
        if not os.path.exists(file_path):
            raise ValueError(f"Diagnosis '{diagnosis_id}' was not found.")

        try:
            with open(file_path, "r", encoding="utf-8") as review_file:
                diagnosis_data: Dict[str, Any] = json.load(review_file)
        except Exception as error:
            raise IOError(f"Failed to read existing diagnosis file {diagnosis_id}.json: {str(error)}")

        # Preserve the initial AI output before any reviewer overrides are applied.
        if "original_ai_diagnosis" not in diagnosis_data:
            diagnosis_data["original_ai_diagnosis"] = self._snapshot_diagnosis(diagnosis_data)

        diagnosis_data["reviewer_notes"] = reviewer_notes or ""
        correction: Dict[str, Any] = {}

        if action == "Accept":
            diagnosis_data["status"] = "Accepted"

        elif action == "Reject":
            diagnosis_data["status"] = "Rejected"

        elif action == "Edit":
            diagnosis_data["status"] = "Edited"

            if root_cause is not None:
                diagnosis_data["root_cause"] = root_cause
                correction["root_cause"] = root_cause
            if recommended_next_show_command is not None:
                diagnosis_data["recommended_next_show_command"] = recommended_next_show_command
                correction["recommended_next_show_command"] = recommended_next_show_command
            if suggested_configuration_changes is not None:
                diagnosis_data["suggested_configuration_changes"] = suggested_configuration_changes
                correction["suggested_configuration_changes"] = suggested_configuration_changes
            if step_by_step_troubleshooting is not None:
                diagnosis_data["step_by_step_troubleshooting"] = step_by_step_troubleshooting
                correction["step_by_step_troubleshooting"] = step_by_step_troubleshooting

        review_entry = {
            "decision": action,
            "reason": reviewer_notes or "",
            "correction": correction or None,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "final_diagnosis": None if action == "Reject" else self._snapshot_diagnosis(diagnosis_data),
        }
        diagnosis_data["human_review"] = review_entry
        diagnosis_data.setdefault("review_history", []).append(review_entry)

        try:
            with open(file_path, "w", encoding="utf-8") as review_file:
                json.dump(diagnosis_data, review_file, indent=2, ensure_ascii=False)
        except Exception as error:
            raise IOError(f"Failed to write updated diagnosis file {diagnosis_id}.json: {str(error)}")

        return diagnosis_data

    @staticmethod
    def _snapshot_diagnosis(diagnosis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an immutable JSON-compatible copy of diagnosis findings."""
        snapshot = {field: diagnosis_data.get(field) for field in DIAGNOSIS_FIELDS}
        return json.loads(json.dumps(snapshot))
