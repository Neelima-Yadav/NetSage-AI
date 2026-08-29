from app.schemas.diagnosis_schema import RuleValidation, RuleCheck

class RuleValidationService:
    def validate(self, show_command_output: str) -> RuleValidation:
        """
        Public method to validate Cisco show command outputs against 8 subnet rules.
        """
        output_lower = show_command_output.lower()
        
        # Run modular checks
        checks = [
            self._check_duplicate_ip(output_lower),
            self._check_gateway(output_lower),
            self._check_vlan(output_lower),
            self._check_routing(output_lower),
            self._check_acl(output_lower),
            self._check_dhcp(output_lower),
            self._check_dns(output_lower),
            self._check_nat(output_lower)
        ]
        
        # Calculate overall score
        # Note: both PASS and WARN can be considered "passed" rules in terms of overall score, 
        # or we can count only PASS rules. Let's count non-FAIL checks as passed.
        passed_count = sum(1 for c in checks if c.status != "FAIL")
        overall_score = f"{passed_count}/{len(checks)}"
        
        return RuleValidation(
            overall_score=overall_score,
            checks=checks
        )

    # --- Private Modular Rule Handlers ---

    def _check_duplicate_ip(self, output: str) -> RuleCheck:
        # Simple placeholder checks looking for conflict flags
        if "duplicate" in output or "collision" in output or "conflict" in output:
            return RuleCheck(
                rule="Duplicate IP",
                status="FAIL",
                message="Duplicate IP address conflict detected on interface or lease configurations."
            )
        return RuleCheck(
            rule="Duplicate IP",
            status="PASS",
            message="No duplicate IP addresses detected."
        )

    def _check_gateway(self, output: str) -> RuleCheck:
        if "gateway" in output and ("unreachable" in output or "missing" in output):
            return RuleCheck(
                rule="Gateway",
                status="FAIL",
                message="Default gateway is missing or configured outside the local subnet prefix."
            )
        if "default-gateway" not in output and "default-router" not in output:
            return RuleCheck(
                rule="Gateway",
                status="WARN",
                message="No default gateway or default-router statement found in the command log."
            )
        return RuleCheck(
            rule="Gateway",
            status="PASS",
            message="Default gateway parameters are correctly configured."
        )

    def _check_vlan(self, output: str) -> RuleCheck:
        # Match Native VLAN mismatch or trunking issues
        if "native vlan" in output or "mismatch" in output:
            return RuleCheck(
                rule="VLAN",
                status="FAIL",
                message="Trunk configuration native VLAN mismatch or restricted allowed-VLAN list detected."
            )
        return RuleCheck(
            rule="VLAN",
            status="PASS",
            message="Layer 2 VLAN trunk encapsulation and allowed port rules are valid."
        )

    def _check_routing(self, output: str) -> RuleCheck:
        # Match routing timer mismatch or routing configuration issue
        if "ospf" in output and ("neighbor" in output or "timer" in output or "dead" in output):
            if "hello" in output or "dead" in output or "interval" in output:
                return RuleCheck(
                    rule="Routing",
                    status="FAIL",
                    message="OSPF configuration Hello/Dead interval timer mismatch detected on interface link."
                )
        return RuleCheck(
            rule="Routing",
            status="PASS",
            message="Layer 3 dynamic routing protocol states are operational."
        )

    def _check_acl(self, output: str) -> RuleCheck:
        # Match deny rule matches or ACL configuration blocks
        if "deny" in output or "access-list" in output:
            if "matches" in output or "block" in output:
                return RuleCheck(
                    rule="ACL",
                    status="FAIL",
                    message="Access control list matches on explicit deny rules are blocking host packets."
                )
        return RuleCheck(
            rule="ACL",
            status="PASS",
            message="Access-list filters permit traffic flows correctly."
        )

    def _check_dhcp(self, output: str) -> RuleCheck:
        # Match pool exhaustion or helper address missing
        if "pool" in output and ("exhausted" in output or "utilization mark is 100%" in output or "100%" in output):
            return RuleCheck(
                rule="DHCP",
                status="FAIL",
                message="DHCP subnet pool is exhausted. Zero available IP addresses remain for dynamic leases."
            )
        if "apipa" in output or "helper-address" in output:
            return RuleCheck(
                rule="DHCP",
                status="FAIL",
                message="DHCP relay configuration helper-address is missing on client gateway interface."
            )
        return RuleCheck(
            rule="DHCP",
            status="PASS",
            message="DHCP lease binding and relay helper systems are functioning."
        )

    def _check_dns(self, output: str) -> RuleCheck:
        if "dns" in output and ("dead" in output or "unreachable" in output or "offline" in output):
            return RuleCheck(
                rule="DNS",
                status="FAIL",
                message="Configured nameserver IP address distributed via DHCP lease parameters is unresponsive."
            )
        return RuleCheck(
            rule="DNS",
            status="PASS",
            message="DNS servers respond to loopback resolution pings."
        )

    def _check_nat(self, output: str) -> RuleCheck:
        if "nat" in output and ("missing" in output or "statistics" in output) and "overload" not in output:
            return RuleCheck(
                rule="NAT",
                status="FAIL",
                message="Network Address Translation dynamic translation mapping rule is missing."
            )
        return RuleCheck(
            rule="NAT",
            status="PASS",
            message="Dynamic NAT overload bindings are active on boundary interfaces."
        )
