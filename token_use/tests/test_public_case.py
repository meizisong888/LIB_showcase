"""Checks specific to real source qualifications and subject-review preparation."""
from copy import deepcopy
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from prepare_public_case import prepare_records
from library_token_use.core import load_records, read_json


class PublicCase(unittest.TestCase):
    def setUp(self):
        self.rows = load_records(ROOT / "data/public-loc/records.jsonl")
        self.config = read_json(ROOT / "configs/public-subject-review.json")
        self.sources = {r["id"]: r for r in read_json(ROOT / "data/public-loc/manifest.json")["records"]}

    def test_uncertain_dates_notes_rights_and_sources_survive(self):
        prepared, _ = prepare_records(self.rows, self.config, self.sources)
        indexed = {m["id"]: (p, m) for p in prepared for m in p["members"]}
        self.assertEqual(set(indexed), {r["id"] for r in self.rows})
        for r in self.rows:
            p, member = indexed[r["id"]]
            self.assertEqual(p["fields"], {k: r.get(k) for k in self.config["fields"]})
            self.assertEqual(member["source_url"], r["link"])
        self.assertEqual(indexed["2017877359"][0]["fields"]["date"], "194[1] Jan.?")
        self.assertIn("might be farm workers", indexed["2017877476"][0]["fields"]["summary"])

    def test_absent_summaries_are_not_reconstructed_from_captions(self):
        prepared, ledger = prepare_records(self.rows, self.config, self.sources)
        absent = [r for r in self.rows if not r.get("summary")]
        self.assertEqual(len(absent), 11)
        self.assertEqual(sum(p["preparation_status"] == "insufficient_material" for p in prepared), 11)
        self.assertTrue(all(p["fields"]["summary"] is None for p in prepared if "summary" in p["missing_fields"]))

    def test_same_title_is_not_same_catalog_item(self):
        prepared, _ = prepare_records(self.rows, self.config, self.sources)
        by_id = {m["id"]: p["item_id"] for p in prepared for m in p["members"]}
        self.assertNotEqual(by_id["2017877451"], by_id["2017877452"])
        self.assertNotEqual(by_id["2017877452"], by_id["2017877454"])

    def test_configuration_cannot_drop_required_rights(self):
        cfg = deepcopy(self.config)
        cfg["fields"].remove("rights_advisory")
        with self.assertRaisesRegex(ValueError, "required task field"):
            prepare_records(self.rows, cfg, self.sources)


if __name__ == "__main__":
    unittest.main()
