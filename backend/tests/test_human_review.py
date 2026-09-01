import json
import os
import tempfile
import unittest
from unittest.mock import patch

from app.services.human_review_service import HumanReviewService
import app.services.human_review_service as review_module


class TestHumanReview(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.patcher = patch.object(review_module, "DATA_DIR", self.temp_dir.name)
        self.patcher.start()
        self.service = HumanReviewService()

        # Seed a dummy diagnosis file
        self.diagnosis_id = "NSAI-20260823-0001"
        self.initial_data = {
            "diagnosis_id": self.diagnosis_id,
            "root_cause": "Initial AI root cause",
            "recommended_next_show_command": "show interfaces trunk",
            "suggested_configuration_changes": "interface Fa0/24\n switchport trunk native vlan 99",
            "step_by_step_troubleshooting": ["Step 1", "Step 2"],
            "confidence": 90,
            "osi_layer": 2,
            "severity": "High",
            "status": "Pending Review"
        }
        with open(os.path.join(self.temp_dir.name, f"{self.diagnosis_id}.json"), "w", encoding="utf-8") as f:
            json.dump(self.initial_data, f)

    def tearDown(self):
        self.patcher.stop()
        self.temp_dir.cleanup()

    def test_review_accepted(self):
        result = self.service.review_diagnosis(
            diagnosis_id=self.diagnosis_id,
            action="Accept",
            reviewer_notes="Confirmed correct diagnosis."
        )
        self.assertEqual(result["status"], "Accepted")
        self.assertEqual(result["reviewer_notes"], "Confirmed correct diagnosis.")
        self.assertIn("original_ai_diagnosis", result)
        self.assertEqual(result["original_ai_diagnosis"]["root_cause"], "Initial AI root cause")
        self.assertEqual(result["human_review"]["decision"], "Accept")

    def test_review_edited(self):
        result = self.service.review_diagnosis(
            diagnosis_id=self.diagnosis_id,
            action="Edit",
            reviewer_notes="Adjusted specific dead-timer parameter.",
            root_cause="Corrected root cause: OSPF dead interval mismatch",
            recommended_next_show_command="show ip ospf interface Gi0/0",
            suggested_configuration_changes="interface Gi0/0\n ip ospf dead-interval 40",
            step_by_step_troubleshooting=["Verify timer", "Update timer"]
        )
        self.assertEqual(result["status"], "Edited")
        self.assertEqual(result["root_cause"], "Corrected root cause: OSPF dead interval mismatch")
        self.assertEqual(result["recommended_next_show_command"], "show ip ospf interface Gi0/0")
        self.assertEqual(result["suggested_configuration_changes"], "interface Gi0/0\n ip ospf dead-interval 40")
        self.assertEqual(result["step_by_step_troubleshooting"], ["Verify timer", "Update timer"])
        self.assertEqual(result["original_ai_diagnosis"]["root_cause"], "Initial AI root cause")

    def test_review_rejected(self):
        result = self.service.review_diagnosis(
            diagnosis_id=self.diagnosis_id,
            action="Reject",
            reviewer_notes="Completely wrong diagnosis."
        )
        self.assertEqual(result["status"], "Rejected")
        self.assertEqual(result["human_review"]["decision"], "Reject")
        self.assertIsNone(result["human_review"]["final_diagnosis"])

    def test_human_correction_and_reason_preserved(self):
        result = self.service.review_diagnosis(
            diagnosis_id=self.diagnosis_id,
            action="Edit",
            reviewer_notes="Native VLAN was wrong, not trunk encapsulation",
            root_cause="Native VLAN 99 configured on peer but not local switch"
        )
        self.assertIn("human_review", result)
        self.assertEqual(result["human_review"]["reason"], "Native VLAN was wrong, not trunk encapsulation")
        self.assertIsNotNone(result["human_review"]["correction"])
        self.assertEqual(result["human_review"]["correction"]["root_cause"], "Native VLAN 99 configured on peer but not local switch")
        self.assertTrue(len(result["review_history"]) >= 1)


if __name__ == "__main__":
    unittest.main()
