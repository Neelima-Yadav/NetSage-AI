import json
import os
import tempfile
import unittest
from unittest.mock import patch

from app.services.dashboard_service import DashboardService
import app.services.dashboard_service as dash_module


class TestDashboardAnalytics(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.patcher = patch.object(dash_module, "DATA_DIR", self.temp_dir.name)
        self.patcher.start()
        self.service = DashboardService()

    def tearDown(self):
        self.patcher.stop()
        self.temp_dir.cleanup()

    def _seed_record(self, diag_id: str, status: str, confidence: int = 90, concept_tag: str = "VLAN"):
        data = {
            "diagnosis_id": diag_id,
            "status": status,
            "confidence": confidence,
            "concept_tag": concept_tag,
            "severity": "High",
            "osi_layer": 2
        }
        file_path = os.path.join(self.temp_dir.name, f"{diag_id}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f)

    def test_review_counts(self):
        self._seed_record("NSAI-001", "Accepted")
        self._seed_record("NSAI-002", "Accepted")
        self._seed_record("NSAI-003", "Edited")
        self._seed_record("NSAI-004", "Rejected")
        self._seed_record("NSAI-005", "Pending Review")

        stats = self.service.get_dashboard_stats()
        self.assertEqual(stats["totalDiagnoses"], 5)
        self.assertEqual(stats["acceptedReviews"], 2)
        self.assertEqual(stats["editedReviews"], 1)
        self.assertEqual(stats["rejectedReviews"], 1)
        self.assertEqual(stats["pendingReviews"], 1)
        self.assertEqual(stats["humanCorrections"], 1)

    def test_ai_human_agreement_calculation(self):
        # 2 Accepted, 1 Edited, 1 Rejected -> Reviewed = 4
        # Accuracy = (2 + 1 * 0.7) / 4 * 100 = 2.7 / 4 * 100 = 67.5%
        self._seed_record("NSAI-001", "Accepted")
        self._seed_record("NSAI-002", "Accepted")
        self._seed_record("NSAI-003", "Edited")
        self._seed_record("NSAI-004", "Rejected")

        stats = self.service.get_dashboard_stats()
        self.assertEqual(stats["aiAccuracy"], 67.5)

        # 3 Accepted, 0 Edited, 0 Rejected -> 100.0%
        status_counts = {"Accepted": 3, "Edited": 0, "Rejected": 0}
        accuracy = self.service._calculate_accuracy(status_counts)
        self.assertEqual(accuracy, 100.0)


if __name__ == "__main__":
    unittest.main()
