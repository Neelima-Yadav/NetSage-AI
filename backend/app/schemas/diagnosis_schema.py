from typing import List, Optional, Literal
from pydantic import BaseModel, Field, conint, confloat

# Concept tag values matching frontend selectors
ConceptTagType = Literal["VLAN", "Routing", "DHCP", "DNS", "ACL", "NAT", "Wireless"]

# Check status types
CheckStatusType = Literal["PASS", "WARN", "FAIL"]

class DiagnoseRequest(BaseModel):
    symptom: str = Field(
        ..., 
        description="Detailed description of the network troubleshooting symptoms.",
        example="PC1 in VLAN 10 cannot ping WebServer in VLAN 20."
    )
    show_command_output: str = Field(
        ..., 
        description="Raw output text from Cisco IOS show commands.",
        example="S1# show interfaces trunk\nPort        Mode         Encapsulation  Status..."
    )
    topology_notes: Optional[str] = Field(
        None, 
        description="Optional descriptive notes about the networking layout/topology.",
        example="S1 is core switch, S2 is access switch."
    )
    concept_tag: ConceptTagType = Field(
        ..., 
        description="Classification tag representing the fault concept."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "symptom": "OSPF neighbor relationship is not forming over Gig0/0.",
                "show_command_output": "R1# show ip ospf neighbor\n",
                "topology_notes": "R1 and R2 connected directly.",
                "concept_tag": "Routing"
            }
        }


class RuleCheck(BaseModel):
    rule: str = Field(..., description="Name of the evaluated troubleshooting rule.")
    status: CheckStatusType = Field(..., description="Verification status outcome.")
    message: str = Field(..., description="Details or warning comments regarding the check result.")


class RuleValidation(BaseModel):
    overall_score: str = Field(
        ..., 
        description="Summary score of passes over total rules run (e.g. '8/9').",
        example="8/9"
    )
    checks: List[RuleCheck] = Field(
        ..., 
        description="List of all deterministic rule validations performed on the output."
    )


class DiagnoseResponse(BaseModel):
    diagnosis_id: str = Field(
        ..., 
        description="Unique system generated identifier in format NSAI-YYYYMMDD-XXXX.",
        example="NSAI-20260816-0001"
    )
    timestamp: str = Field(
        ...,
        description="ISO 8601 timestamp indicating when the diagnosis was created."
    )
    symptom: str = Field(
        ...,
        description="Original network symptom submitted for diagnosis."
    )
    show_command_output: str = Field(
        ...,
        description="Original Cisco show command output submitted for diagnosis."
    )
    topology_notes: Optional[str] = Field(
        None,
        description="Optional topology notes submitted with the diagnosis."
    )
    concept_tag: ConceptTagType = Field(
        ...,
        description="Fault concept selected for the diagnosis."
    )
    root_cause: str = Field(
        ..., 
        description="AI isolated root cause explaining the symptom."
    )
    confidence: int = Field(
        ..., 
        ge=0, 
        le=100, 
        description="AI confidence percentage indicator.",
        example=94
    )
    osi_layer: int = Field(
        ..., 
        ge=1, 
        le=7, 
        description="Affected OSI Layer level (1-7).",
        example=3
    )
    evidence: str = Field(
        ..., 
        description="Factual evidence extracted from the show command output."
    )
    recommended_next_show_command: str = Field(
        ..., 
        description="Cisco show command suggested to isolate the problem further."
    )
    suggested_configuration_changes: str = Field(
        ..., 
        description="Suggested Cisco IOS configuration changes to resolve the issue."
    )
    step_by_step_troubleshooting: List[str] = Field(
        ..., 
        description="Sequential list of actions required to identify and correct the issue."
    )
    severity: Literal["Critical", "High", "Medium", "Low"] = Field(
        ..., 
        description="Urgency classification badge."
    )
    rule_validation: RuleValidation = Field(
        ..., 
        description="Rule check outcomes block."
    )
    status: Literal["Pending Review", "Accepted", "Edited", "Rejected"] = Field(
        ..., 
        description="Human in the loop review state."
    )
