#!/usr/bin/env python3
"""Employee-facing command line. Execute from the project directory."""
import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from library_token_use.core import (candidate_items, dependencies, incremental,
                                    load_records, rank, read_json, scoped_rules, write_json)
from library_token_use.counting import LocalCounter, write_input
from library_token_use.experiment import run_demo


def safe_output(value):
    path = Path(value).resolve()
    if not any(path.is_relative_to(ROOT / name) for name in ["results", "outputs", "scratch"]):
        raise ValueError("Output must be inside this project's results/, outputs/ or scratch/; raw files are protected.")
    return path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    demo = sub.add_parser("demo", help="Reproduce all three comparisons")
    demo.add_argument("--out", default="results")
    for name in ["prepare", "retrieve", "filter", "show"]:
        p = sub.add_parser(name)
        p.add_argument("--input", default="data/raw/catalog-v1.jsonl")
        if name == "show":
            p.add_argument("--id", required=True)
            continue
        p.add_argument("--out", default=f"outputs/{name}")
        p.add_argument("--config", default={"prepare": "configs/subject-review.json", "retrieve": "configs/research-candidates.json", "filter": "configs/reports-2000-2025.json"}[name])
        if name == "prepare":
            p.add_argument("--previous-cache", help="Verified prepared-material cache, not an AI-answer cache")
        if name == "retrieve":
            group = p.add_mutually_exclusive_group()
            group.add_argument("--top-k", type=int)
            group.add_argument("--all", action="store_true", help="Supply the complete source, bypassing candidate filtering")
    args = parser.parse_args()
    if args.command == "demo":
        run_demo(safe_output(args.out))
        return
    records = load_records(args.input)
    if args.command == "show":
        import json
        matching = [r for r in records if r["id"] == args.id]
        if not matching:
            raise ValueError("ID not found")
        print(json.dumps(matching[0], ensure_ascii=False, indent=2))
        return
    out = safe_output(args.out)
    out.mkdir(parents=True, exist_ok=True)
    if args.command == "prepare":
        config, rules, vocab, context = dependencies(args.config)
        cache = read_json(args.previous_cache) if args.previous_cache else None
        items, new_cache, statuses = incremental(records, config, rules, vocab, context, cache)
        write_json(out / "cache.json", new_cache)
        write_json(out / "status.json", statuses)
        write_json(out / "review-checks.json", {"items": items, "meaning": "Rules and presence checks only; subject judgments remain undone."})
        path = write_input(out / "pending.txt", (ROOT / config["template"]).read_text(encoding="utf-8"), items)
    elif args.command == "retrieve":
        config = read_json(args.config)
        k = args.top_k if args.top_k is not None else config["top_k"]
        if k < 1:
            raise ValueError("top-k must be positive")
        scores = rank(records, config)
        write_json(out / "ranking.json", scores)
        items = records if args.all else candidate_items(records, config, scores, k)
        metadata = None if args.all else {"query": config["query"], "requested_k": k, "corpus_records": len(records), "coverage": "Candidates only; use --all or inspect original source locators."}
        path = write_input(out / "candidates.txt", (ROOT / config["template"]).read_text(encoding="utf-8"), items, metadata)
    else:
        _, rules, vocab, _ = dependencies(ROOT / "configs/subject-review.json")
        write_json(out / "inventory.json", {"scope": read_json(args.config), "records": scoped_rules(records, read_json(args.config), rules, vocab)})
        print(f"Rule-only inventory written to {out / 'inventory.json'}; no AI step is needed for these checks.")
        return
    counter = LocalCounter()
    write_json(out / "input-count.json", {"file": path.name, "text_tokens": counter.count(path), "tokenizer": counter.metadata})
    print(f"Prepared {path}; {counter.count(path)} text tokens ({counter.metadata['encoding']}). No model review performed.")


if __name__ == "__main__":
    main()
