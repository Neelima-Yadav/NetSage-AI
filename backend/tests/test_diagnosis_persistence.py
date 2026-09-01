import os
import tempfile
import unittest
from unittest.mock import patch

from app.schemas.diagnosis_schema import DiagnoseRequest
from app.services.diagnosis_service import DiagnosisService
import app.services.diagnosis_service as diag_module


class TestDiagnosisPersistence(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.patcher = patch.object(diag_module, "DATA_DIR", self.temp_dir.name)
        self.patcher.start()
        self.service = DiagnosisService()

    def tearDown(self):
        self.patcher.stop()
        self.temp_dir.cleanup()

    def test_diagnosis_is_created(self):
        request = DiagnoseRequest(
            symptom="PC1 cannot ping PC2 across switches.",
            show_command_output="S1# show interfaces trunk\nFa0/24 trunking native vlan 1",
            topology_notes="S1 connected to S2 via Fa0/24",
            concept_tag="VLAN"
        )
        diagnosis = self.service.diagnose(request)
        self.assertIsNotNone(diagnosis.diagnosis_id)
        self.assertTrue(diagnosis.diagnosis_id.startswith("NSAI-"))
        self.assertEqual(diagnosis.status, "Pending Review")
        self.assertEqual(diagnosis.concept_tag, "VLAN")
        
        # Check that file exists on disk
        persisted_file = os.path.join(self.temp_dir.name, f"{diagnosis.diagnosis_id}.json")
        self.assertTrue(os.path.exists(persisted_file))

    def test_diagnosis_can_be_retrieved(self):
        request = DiagnoseRequest(
            symptom="OSPF adjacency stuck in ExStart",
            show_command_output="R1# show ip ospf neighbor\n2.2.2.2 EXSTART",
            topology_notes="R1 and R2 connected on Gi0/0",
            concept_tag="Routing"
        )
        created = self.service.diagnose(request)
        retrieved = self.service.get_diagnosis(created.diagnosis_id)
        
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.diagnosis_id, created.diagnosis_id)
        self.assertEqual(retrieved.root_cause, created.root_cause)
        self.assertEqual(retrieved.confidence, created.confidence)
        self.assertEqual(retrieved.osi_layer, created.osi_layer)


if __name__ == "__main__":
    unittest.main()
