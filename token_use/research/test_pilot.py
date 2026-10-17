"""Small checks for the pilot's content-preservation and missingness risks."""
import json
import unittest

import pilot


class PilotChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config, _, cls.records, cls.manifest = pilot.load_design()

    def test_every_real_row_has_identical_pretty_and_compact_content(self):
        self.assertEqual(len(self.records), self.manifest["record_count"])
        for record in self.records:
            pretty = json.loads(pilot.render_payload(record, "full_pretty"))
            compact = json.loads(pilot.render_payload(record, "full_compact"))
            self.assertEqual(pretty, record)
            self.assertEqual(compact, record)

    def test_all_projected_source_values_remain_exact(self):
        for record in self.records:
            for name, prepared in pilot.variants(record, self.config).items():
                audit = pilot.audit_variant(record, prepared, self.config["retained_fields"])
                self.assertTrue(all(audit["preserved_values_equal_source"].values()), name)
                self.assertTrue(set(prepared).issubset(record), name)
            projected = pilot.project(record, self.config["retained_fields"])
            self.assertEqual(set(projected), set(record) & set(self.config["retained_fields"]))

    def test_nested_nulls_are_missing_but_false_and_zero_are_values(self):
        self.assertFalse(pilot.has_content([{"Name": None}, {"Role": "  "}]))
        self.assertTrue(pilot.has_content([{"Name": "Doe", "Role": None}]))
        self.assertTrue(pilot.has_content(False))
        self.assertTrue(pilot.has_content(0))


if __name__ == "__main__":
    unittest.main()
