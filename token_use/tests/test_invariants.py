"""Risk-focused checks: provenance, missing material, omission and invalidation."""
from copy import deepcopy
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from library_token_use.core import (candidate_items, dependencies, incremental, load_records,
                                    prepare, rank, read_json, scoped_rules, write_json)
from library_token_use.counting import LocalCounter
from library_token_use.experiment import evaluate_retrieval


class Invariants(unittest.TestCase):
    def setUp(self):
        self.rows = load_records(ROOT / "data/raw/catalog-v1.jsonl")
        self.cfg, self.rules, self.vocab, self.context = dependencies(ROOT / "configs/subject-review.json")
        (ROOT / "scratch").mkdir(exist_ok=True)

    def test_mapping_restrictions_and_copy_edition_survive(self):
        groups = prepare(self.rows, self.cfg, self.rules, self.vocab)
        by_id = {m["id"]: (g, m) for g in groups for m in g["members"]}
        self.assertEqual(set(by_id), {r["id"] for r in self.rows})
        for row in self.rows:
            group, member = by_id[row["id"]]
            self.assertEqual(member["source_locator"], row["source_locator"])
            self.assertEqual(group["fields"], {key: row.get(key) for key in self.cfg["fields"]})
        self.assertEqual(by_id["R001"][0]["item_id"], by_id["R059"][0]["item_id"])
        self.assertNotEqual(by_id["R001"][0]["item_id"], by_id["R015"][0]["item_id"])
        self.assertNotEqual(by_id["R001"][0]["item_id"], by_id["R016"][0]["item_id"])

    def test_valid_format_mismatch_and_missing_abstract_remain(self):
        groups = prepare(self.rows, self.cfg, self.rules, self.vocab)
        by_id = {m["id"]: g for g in groups for m in g["members"]}
        self.assertEqual(by_id["R007"]["rule_issues"], [])
        self.assertEqual(by_id["R007"]["preparation_status"], "ready_for_review")
        self.assertEqual(by_id["R008"]["preparation_status"], "insufficient_material")
        self.assertIn("abstract", by_id["R008"]["missing_fields"])

    def test_ranking_misses_synonyms_and_full_scope_recovers_evidence(self):
        cfg = read_json(ROOT / "configs/research-candidates.json")
        gold = read_json(ROOT / "data/retrieval-gold.json")
        scores = rank(self.rows, cfg)
        narrow = evaluate_retrieval(candidate_items(self.rows, cfg, scores, 5), gold)
        wider = evaluate_retrieval(candidate_items(self.rows, cfg, scores, 15), gold)
        complete = evaluate_retrieval(self.rows, gold)
        self.assertLess(narrow["recall"], wider["recall"])
        self.assertIn("R003", wider["missed_ids"])
        self.assertIn("R017", wider["missed_ids"])
        self.assertEqual(complete["recall"], 1)
        self.assertEqual(complete["evidence_preserved"], complete["evidence_total"])

    def test_deleted_inactive_modified_and_relocated_sources(self):
        _, first_cache, _ = incremental(self.rows, self.cfg, self.rules, self.vocab, self.context)
        updated = load_records(ROOT / "data/raw/catalog-v2.jsonl")
        pending, cache, statuses = incremental(updated, self.cfg, self.rules, self.vocab, self.context, first_cache)
        states = {row["id"]: row["state"] for row in statuses}
        self.assertEqual(states["R004"], "deleted")
        self.assertEqual(states["R005"], "inactive")
        self.assertNotIn("R004", cache["entries"])
        self.assertNotIn("R005", cache["entries"])
        self.assertEqual({m["id"] for g in pending for m in g["members"]}, {"R007", "R020", "R061", "R062"})
        moved = next(row for row in statuses if row["id"] == "R006")
        self.assertEqual(moved["state"], "reused_preparation")
        self.assertEqual(moved["source_locator"], "data/raw/catalog-v2.jsonl#L5")

    def test_dependency_contents_invalidate_without_version_bump(self):
        with tempfile.TemporaryDirectory(dir=ROOT / "scratch") as td:
            for kind in ["task", "rules", "vocabulary", "template"]:
                cfg, rules, vocab = deepcopy(self.cfg), deepcopy(self.rules), deepcopy(self.vocab)
                cfg["rules_file"] = str(Path(td) / "rules.json")
                cfg["vocabulary_file"] = str(Path(td) / "vocabulary.json")
                cfg["template"] = str(Path(td) / "task.txt")
                task_text = (ROOT / self.cfg["template"]).read_text()
                Path(cfg["template"]).write_text(task_text)
                write_json(Path(td) / "rules.json", rules)
                write_json(Path(td) / "vocabulary.json", vocab)
                write_json(Path(td) / "config.json", cfg)
                start_cfg, start_rules, start_vocab, start_context = dependencies(Path(td) / "config.json")
                _, cache, _ = incremental(self.rows, start_cfg, start_rules, start_vocab, start_context)
                if kind == "task":
                    cfg["fields"].append("export_note")
                elif kind == "rules":
                    rules["allowed_types"].append("photocopy")
                elif kind == "vocabulary":
                    vocab["terms"].remove("Astronomy")
                else:
                    Path(cfg["template"]).write_text(task_text + "\nInclude a quoted title in each judgment.\n")
                write_json(Path(td) / "rules.json", rules)
                write_json(Path(td) / "vocabulary.json", vocab)
                write_json(Path(td) / "config.json", cfg)
                cfg, rules, vocab, context = dependencies(Path(td) / "config.json")
                pending, _, states = incremental(self.rows, cfg, rules, vocab, context, cache)
                self.assertEqual(sum(len(g["members"]) for g in pending), 60)
                self.assertTrue(all(s["state"] == "dependency_changed" for s in states))

    def test_corrupt_preparation_is_not_reused(self):
        _, cache, _ = incremental(self.rows, self.cfg, self.rules, self.vocab, self.context)
        cache["entries"]["R001"]["prepared"]["fields"]["restrictions"] = "lost"
        pending, _, statuses = incremental(self.rows, self.cfg, self.rules, self.vocab, self.context, cache)
        self.assertEqual([m["id"] for g in pending for m in g["members"]], ["R001"])
        self.assertEqual(pending[0]["fields"]["restrictions"], self.rows[0]["restrictions"])

    def test_scope_exceptions_are_not_silently_excluded(self):
        ledger = scoped_rules(self.rows, read_json(ROOT / "configs/reports-2000-2025.json"), self.rules, self.vocab)
        self.assertEqual(len(ledger), len(self.rows))
        by_id = {r["id"]: r for r in ledger}
        self.assertEqual(by_id["R018"]["status"], "exception_needs_review")
        self.assertEqual(by_id["R019"]["status"], "exception_needs_review")

    def test_missing_tokenizer_fails_without_network_fallback(self):
        with tempfile.TemporaryDirectory(dir=ROOT / "scratch") as td:
            with self.assertRaisesRegex(RuntimeError, "no download"):
                LocalCounter(td)

    def test_required_field_cannot_be_projected_away(self):
        cfg = deepcopy(self.cfg)
        cfg["fields"].remove("restrictions")
        with tempfile.TemporaryDirectory(dir=ROOT / "scratch") as td:
            write_json(Path(td) / "config.json", cfg)
            with self.assertRaisesRegex(ValueError, "required review field"):
                dependencies(Path(td) / "config.json")

    def test_unknown_status_cannot_silently_remove_a_record(self):
        rows = deepcopy(self.rows)
        rows[0]["status"] = "actvie"
        with self.assertRaisesRegex(ValueError, "refusing to silently omit"):
            incremental(rows, self.cfg, self.rules, self.vocab, self.context)


if __name__ == "__main__":
    unittest.main()
