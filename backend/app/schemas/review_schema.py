from typing import List, Optional, Literal, Any, Dict
from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    diagnosis_id: str = Field(
        ...,
        description="Unique diagnosis identifier in NSAI-YYYYMMDD-XXXX format.",
        example="NSAI-20260816-0001"
    )
    action: Literal["Accept", "Edit", "Reject"] = Field(
        ...,
        description="Human review decision action to apply."
    )
    reviewer_notes: Optional[str] = Field(
        None,
        description="Optional administrative notes or rationale for the review decision."
    )
    # Override fields — relevant only when action is "Edit"
    root_cause: Optional[str] = Field(
        None,
        description="Corrected root cause description (used only with Edit action)."
    )
    recommended_next_show_command: Optional[str] = Field(
        None,
        description="Corrected next Cisco show command (used only with Edit action)."
    )
    suggested_configuration_changes: Optional[str] = Field(
        None,
        description="Corrected configuration change suggestions (used only with Edit action)."
    )
    step_by_step_troubleshooting: Optional[List[str]] = Field(
        None,
        description="Corrected troubleshooting steps list (used only with Edit action)."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "diagnosis_id": "NSAI-20260816-0001",
                "action": "Edit",
                "reviewer_notes": "Adjusted OSPF dead timer recommendation to match lab topology.",
                "root_cause": "OSPF Dead interval mismatch on GigabitEthernet0/0.",
                "recommended_next_show_command": "show ip ospf interface GigabitEthernet0/0",
                "suggested_configuration_changes": "interface GigabitEthernet0/0\n ip ospf dead-interval 40",
                "step_by_step_troubleshooting": [
                    "Compare OSPF timers on both routers.",
                    "Align dead-interval to 40 seconds.",
                    "Clear OSPF process and verify neighbor state."
                ]
            }
        }


class ReviewResponse(BaseModel):
    diagnosis_id: str = Field(..., description="The ID of the reviewed diagnosis.")
    status: str = Field(..., description="Updated review status (Accepted, Edited, or Rejected).")
    reviewer_notes: Optional[str] = Field(None, description="Reviewer notes attached to the decision.")
    root_cause: Optional[str] = Field(None, description="Root cause (possibly updated).")
    recommended_next_show_command: Optional[str] = Field(None, description="Next show command (possibly updated).")
    suggested_configuration_changes: Optional[str] = Field(None, description="Configuration changes (possibly updated).")
    step_by_step_troubleshooting: Optional[List[str]] = Field(None, description="Troubleshooting steps (possibly updated).")
    confidence: Optional[int] = Field(None, description="AI confidence score.")
    osi_layer: Optional[int] = Field(None, description="Affected OSI layer.")
    severity: Optional[str] = Field(None, description="Severity classification.")
