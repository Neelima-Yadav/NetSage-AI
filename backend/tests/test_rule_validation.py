import unittest
from app.services.rule_validation_service import RuleValidationService


class TestRuleValidationService(unittest.TestCase):
    def setUp(self):
        self.service = RuleValidationService()

    def test_duplicate_ip(self):
        output_conflict = "IP-4-DUPADDR: Duplicate address 192.168.1.10 on GigabitEthernet0/1, collision detected"
        result_conflict = self.service.validate(output_conflict)
        dup_check = next((c for c in result_conflict.checks if c.rule == "Duplicate IP"), None)
        self.assertIsNotNone(dup_check)
        self.assertEqual(dup_check.status, "FAIL")

        output_clean = "Interface GigabitEthernet0/1 is up, line protocol is up. Internet address is 192.168.1.10/24"
        result_clean = self.service.validate(output_clean)
        dup_clean_check = next((c for c in result_clean.checks if c.rule == "Duplicate IP"), None)
        self.assertIsNotNone(dup_clean_check)
        self.assertEqual(dup_clean_check.status, "PASS")

    def test_gateway_mismatch(self):
        output_missing = "Default gateway 192.168.1.1 is unreachable or missing from subnet"
        result_missing = self.service.validate(output_missing)
        gw_check = next((c for c in result_missing.checks if c.rule == "Gateway"), None)
        self.assertIsNotNone(gw_check)
        self.assertEqual(gw_check.status, "FAIL")

        output_warn = "show ip interface brief\nGi0/0 10.0.0.1 up up"
        result_warn = self.service.validate(output_warn)
        gw_warn = next((c for c in result_warn.checks if c.rule == "Gateway"), None)
        self.assertIsNotNone(gw_warn)
        self.assertEqual(gw_warn.status, "WARN")

        output_pass = "ip default-gateway 192.168.1.1\ndefault-router 192.168.1.1"
        result_pass = self.service.validate(output_pass)
        gw_pass = next((c for c in result_pass.checks if c.rule == "Gateway"), None)
        self.assertIsNotNone(gw_pass)
        self.assertEqual(gw_pass.status, "PASS")

    def test_missing_vlan(self):
        output_mismatch = "%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on Gi0/1 (1) with S2 Gi0/1 (99)"
        result = self.service.validate(output_mismatch)
        vlan_check = next((c for c in result.checks if c.rule == "VLAN"), None)
        self.assertIsNotNone(vlan_check)
        self.assertEqual(vlan_check.status, "FAIL")

        output_clean = "Port Fa0/24 mode trunk encapsulation 802.1q trunking"
        result_clean = self.service.validate(output_clean)
        vlan_clean = next((c for c in result_clean.checks if c.rule == "VLAN"), None)
        self.assertIsNotNone(vlan_clean)
        self.assertEqual(vlan_clean.status, "PASS")

    def test_missing_route(self):
        output_ospf_mismatch = "OSPF: Dead timer 40 on Gi0/0, neighbor timer interval mismatch"
        result = self.service.validate(output_ospf_mismatch)
        routing_check = next((c for c in result.checks if c.rule == "Routing"), None)
        self.assertIsNotNone(routing_check)
        self.assertEqual(routing_check.status, "FAIL")

        output_clean = "Routing Process ospf 1 with ID 1.1.1.1, neighbor 2.2.2.2 is FULL"
        result_clean = self.service.validate(output_clean)
        routing_clean = next((c for c in result_clean.checks if c.rule == "Routing"), None)
        self.assertIsNotNone(routing_clean)
        self.assertEqual(routing_clean.status, "PASS")

    def test_interface_down(self):
        output_down = "GigabitEthernet0/1 is administratively down, line protocol is down\nHardware is Gigabit Ethernet"
        result = self.service.validate(output_down)
        self.assertIsNotNone(result.overall_score)
        self.assertEqual(len(result.checks), 8)


if __name__ == "__main__":
    unittest.main()
