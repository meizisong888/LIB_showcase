"""Contract checks with explicit synthetic responses, never research outcomes."""
import contextlib
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

import prepare_review

ROOT = Path(__file__).resolve().parent


class ReviewContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        rows = prepare_review.load_jsonl(ROOT / "outputs/pilot-requests.jsonl")
        cls.request = next(row for row in rows if row["condition"] == "title_subjects")

    def fixture(self):
        return {"request_id": self.request["request_id"], "prompt_sha256": self.request["prompt_sha256"],
                "model": "SYNTHETIC-CONTRACT-TEST", "settings": {}, "status": "success",
                "response": json.dumps({"record_id": self.request["source_id"], "description": "Synthetic test only.",
                                        "evidence_fields": ["Title", "Notes"], "limitations": []}),
                "attempts": 1, "usage": None, "latency_seconds": None}

    def run_import(self, rows):
        with tempfile.TemporaryDirectory(prefix="library-review-test-") as directory:
            root = Path(directory)
            source = root / "synthetic.jsonl"
            source.write_text("".join(json.dumps(row) + "\n" for row in rows))
            with patch.object(sys, "argv", ["prepare_review.py", "--responses", str(source), "--out", str(root / "review")]), contextlib.redirect_stdout(io.StringIO()):
                prepare_review.main()
            return json.loads((root / "review/response-audit.json").read_text())

    def test_partial_run_unknown_usage_and_absent_evidence(self):
        audit = self.run_import([self.fixture()])
        self.assertEqual(audit["planned_quality_requests"], 80)
        self.assertEqual(audit["observed_quality_requests"], 1)
        self.assertFalse(audit["quality_pilot_all_conditions_attempted"])
        self.assertIsNone(audit["results"][0]["usage"])
        self.assertEqual(audit["results"][0]["claimed_evidence_fields_not_supplied"], ["Notes"])

    def test_rejects_unreliable_imports(self):
        row = self.fixture()
        variants = [[row, row], [dict(row, prompt_sha256="wrong")],
                    [dict(row, latency_seconds=-1)], [dict(row, status="pending")],
                    [{key: value for key, value in row.items() if key != "usage"}]]
        for rows in variants:
            with self.subTest(rows=rows), self.assertRaises(ValueError):
                self.run_import(rows)


if __name__ == "__main__":
    unittest.main()
