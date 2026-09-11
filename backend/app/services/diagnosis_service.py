import json
import os
from datetime import datetime
from typing import Optional

from app.schemas.diagnosis_schema import DiagnoseRequest, DiagnoseResponse
from app.services.rule_validation_service import RuleValidationService

# Global in-memory counter to generate unique sequence IDs (NSAI-YYYYMMDD-000X)
_diagnosis_counter = 0

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

class DiagnosisService:
    def __init__(self):
        self.validation_service = RuleValidationService()
        os.makedirs(DATA_DIR, exist_ok=True)

    def diagnose(self, request: DiagnoseRequest) -> DiagnoseResponse:
        """
        Public method to diagnose network faults.
        Accepts DiagnoseRequest, generates an ID, runs rules validation, 
        and builds mock DiagnoseResponse.
        """
        # Generate unique diagnosis ID
        diagnosis_id = self._generate_id()

        # Run rule validations
        rule_validation = self.validation_service.validate(request.show_command_output)

        # Get diagnostic data mappings depending on the concept tag
        tag = request.concept_tag.upper()
        
        # Default mock data
        root_cause = "General configuration anomaly identified. Interface configs require manual audit."
        confidence = 75
        osi_layer = 3
        evidence = "Show command output indicates syntax parameters are correct but transit states are down."
        recommended_next_show_command = "show running-config"
        suggested_changes = "! Verify physical links, cable pins, and subnets manual check"
        troubleshooting_steps = [
            "Verify physical layer status (cables, switch lights).",
            "Trace interface details using 'show ip interface brief'.",
            "Perform incremental ping tests across hops to locate the block."
        ]
        severity = "Medium"

        # Deterministic tagging rules
        if "VLAN" in tag:
            root_cause = "VLAN trunk native VLAN ID mismatch or trunking mode disabled on FastEthernet interface."
            confidence = 94
            osi_layer = 2
            evidence = "Trunk interface allowed VLAN checks failed. Show command output indicates active Native VLAN mismatch alerts."
            recommended_next_show_command = "show interfaces trunk"
            suggested_changes = "interface FastEthernet0/24\n switchport trunk native vlan 99"
            troubleshooting_steps = [
                "Verify allowed VLAN list on both switches S1 and S2.",
                "Verify trunk native VLAN IDs match on both endpoints.",
                "Ensure trunk negotiation mode is forced on using 'switchport mode trunk'."
            ]
            severity = "High"
            
        elif "ROUTING" in tag or "OSPF" in tag or "EIGRP" in tag:
            root_cause = "OSPF Adjacency failure due to Hello/Dead interval timers mismatch on GigabitEthernet link."
            confidence = 88
            osi_layer = 3
            evidence = "Dead timer is set to 40 seconds on R1 interface Gig0/0, but configured as 30 seconds on R2 Gig0/0."
            recommended_next_show_command = "show ip ospf interface GigabitEthernet0/0"
            suggested_changes = "interface GigabitEthernet0/0\n ip ospf dead-interval 40"
            troubleshooting_steps = [
                "Verify hello/dead timers are matching on adjacent interface configurations.",
                "Align Hello and Dead intervals to default standard parameters.",
                "Clear OSPF database process if state is stuck in ExStart or Loading."
            ]
            severity = "Critical"
            
        elif "DHCP" in tag:
            root_cause = "DHCP server IP lease pool exhaustion or helper relay address omitted on client subnet interface."
            confidence = 96
            osi_layer = 7
            evidence = "Pool LAN_POOL utilization has hit 100% capacity with all 41 dynamic addresses leased."
            recommended_next_show_command = "show ip dhcp pool"
            suggested_changes = "ip dhcp pool LAN_POOL\n network 192.168.1.0 255.255.255.0\n no ip dhcp excluded-address 192.168.1.51 192.168.1.254"
            troubleshooting_steps = [
                "Inspect excluded-address lists to free up subnet capacity.",
                "Extend dynamic allocation scope settings in the DHCP router pool configuration.",
                "Set shorter lease times or clean bindings database using 'clear ip dhcp binding *'."
            ]
            severity = "High"
            
        elif "DNS" in tag:
            root_cause = "Incorrect or offline DNS server IP address configured in the distributed DHCP pool leases."
            confidence = 87
            osi_layer = 7
            evidence = "DNS server IP (10.10.10.254) in DHCP pool configuration does not respond to ping checks."
            recommended_next_show_command = "show ip dhcp pool"
            suggested_changes = "ip dhcp pool OfficePool\n no dns-server 10.10.10.254\n dns-server 8.8.8.8"
            troubleshooting_steps = [
                "Ping the configured nameserver IP to check reachability.",
                "Replace offline server IP with correct active nameserver IP in the DHCP pool config.",
                "Release and renew IP leases on client machines using 'ipconfig /renew'."
            ]
            severity = "Medium"
            
        elif "ACL" in tag:
            root_cause = "Standard Access Control List standard filter bound to VTY lines blocks SSH access."
            confidence = 91
            osi_layer = 4
            evidence = "VTY configuration line access-class matches access-list 10 deny rules for management hosts."
            recommended_next_show_command = "show access-lists"
            suggested_changes = "ip access-list standard 10\n permit 192.168.1.0 0.0.0.255"
            troubleshooting_steps = [
                "Inspect the access-list rules mapped to active VTY lines.",
                "Ensure standard permit rules exist for management terminal subnets.",
                "Confirm implicit deny rules are not blocking SSH ports (TCP 22) traffic."
            ]
            severity = "Medium"
            
        elif "NAT" in tag:
            root_cause = "Inside source NAT rule configuration overload statement is missing on perimeter router R1."
            confidence = 83
            osi_layer = 3
            evidence = "NAT configurations contain inside/outside interface bounds, but translations list is empty."
            recommended_next_show_command = "show ip nat statistics"
            suggested_changes = "ip nat inside source list 1 interface GigabitEthernet0/0 overload\naccess-list 1 permit 192.168.100.0 0.0.0.255"
            troubleshooting_steps = [
                "Ensure inside and outside labels are applied to correct boundary interfaces.",
                "Verify source permit list access-list matches internal local subnet IPs.",
                "Map overload statement linking translation access-list to public outer interface."
            ]
            severity = "High"
            
        elif "WIRELESS" in tag:
            root_cause = "Wireless LAN Controller (WLC) SSID profile WPA2 Pre-Shared Key mismatch with Laptop configuration."
            confidence = 95
            osi_layer = 2
            evidence = "Laptop client terminal logs show 4-way handshake failures due to incorrect PSK credentials."
            recommended_next_show_command = "show wlan summary"
            suggested_changes = "wlan 1\n security wpa wpa2 psk ascii Cisco123!"
            troubleshooting_steps = [
                "Inspect SSID profile security configurations on the WLC console.",
                "Verify key parameters on the client terminal device settings.",
                "Align matching Pre-Shared Keys on both the client and AP controller profiles."
            ]
            severity = "Medium"

        diagnosis = DiagnoseResponse(
            diagnosis_id=diagnosis_id,
            timestamp=datetime.now().astimezone().isoformat(),
            symptom=request.symptom,
            show_command_output=request.show_command_output,
            topology_notes=request.topology_notes,
            concept_tag=request.concept_tag,
            root_cause=root_cause,
            confidence=confidence,
            osi_layer=osi_layer,
            evidence=evidence,
            recommended_next_show_command=recommended_next_show_command,
            suggested_configuration_changes=suggested_changes,
            step_by_step_troubleshooting=troubleshooting_steps,
            severity=severity,
            rule_validation=rule_validation,
            status="Pending Review"
        )
        self._save_diagnosis(diagnosis)
        return diagnosis

    def get_diagnosis(self, diagnosis_id: str) -> Optional[DiagnoseResponse]:
        """Load one persisted diagnosis by its system-generated identifier."""
        file_path = self._get_record_path(diagnosis_id)
        if not os.path.exists(file_path):
            return None

        with open(file_path, "r", encoding="utf-8") as diagnosis_file:
            return DiagnoseResponse.model_validate(json.load(diagnosis_file))

    def _save_diagnosis(self, diagnosis: DiagnoseResponse) -> None:
        """Persist a completed diagnosis for results, history, and analytics queries."""
        file_path = self._get_record_path(diagnosis.diagnosis_id)
        with open(file_path, "w", encoding="utf-8") as diagnosis_file:
            json.dump(diagnosis.model_dump(mode="json"), diagnosis_file, indent=2, ensure_ascii=False)

    @staticmethod
    def _get_record_path(diagnosis_id: str) -> str:
        """Return a safe JSON record path for a diagnosis identifier."""
        if not diagnosis_id or os.path.basename(diagnosis_id) != diagnosis_id:
            raise ValueError("Invalid diagnosis identifier.")
        return os.path.join(DATA_DIR, f"{diagnosis_id}.json")

    # --- Private Utility Handlers ---

    def _generate_id(self) -> str:
        """
        Generates a unique diagnosis ID in the format NSAI-YYYYMMDD-000X
        """
        global _diagnosis_counter
        _diagnosis_counter += 1
        
        today = datetime.now()
        date_str = today.strftime("%Y%m%d")
        
        return f"NSAI-{date_str}-{_diagnosis_counter:04d}"
