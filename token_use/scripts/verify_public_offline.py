"""Isolate and trace the new public-data case, without replacing old evidence."""
import argparse
import ast
from datetime import datetime, timezone
import errno
import hashlib
import importlib.metadata
import os
from pathlib import Path
import socket
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from library_token_use.core import write_json


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--outer-net", required=True)
    args = parser.parse_args()
    os.chdir(ROOT)
    inner = os.readlink("/proc/self/ns/net")
    interfaces = [name for _, name in socket.if_nameindex()]
    if inner == args.outer_net or interfaces != ["lo"]:
        raise RuntimeError("No verified network isolation")
    probes = []
    for family, target in [(socket.AF_INET, ("1.1.1.1", 443)), (socket.AF_INET6, ("2606:4700:4700::1111", 443))]:
        try:
            with socket.socket(family, socket.SOCK_STREAM) as sock:
                sock.settimeout(2)
                sock.connect(target)
            raise RuntimeError("Unexpected external connectivity")
        except OSError as exc:
            if exc.errno not in {errno.ENETUNREACH, errno.EADDRNOTAVAIL, errno.EAFNOSUPPORT, errno.EPROTONOSUPPORT}:
                raise
            probes.append({"family": family.name, "target": str(target), "errno": exc.errno, "result": str(exc)})
    evidence = ROOT / "results/public-case-evidence"
    evidence.mkdir(exist_ok=True)
    trace = evidence / "network-syscalls.log"
    command = ["strace", "-f", "-e", "trace=network", "-o", str(trace.relative_to(ROOT)), ".venv/bin/python", "scripts/prepare_public_case.py", "--out", "results/public-case"]
    started = datetime.now(timezone.utc).isoformat()
    run = subprocess.run(command, text=True, capture_output=True)
    (evidence / "run.stdout.txt").write_text(run.stdout, encoding="utf-8")
    (evidence / "run.stderr.txt").write_text(run.stderr, encoding="utf-8")
    calls = [s for s in trace.read_text().splitlines() if "(" in s and "+++" not in s]
    tests = subprocess.run([".venv/bin/python", "-m", "unittest", "discover", "-s", "tests", "-p", "test_public_case.py", "-v"], text=True, capture_output=True)
    (evidence / "tests.txt").write_text(tests.stdout + tests.stderr, encoding="utf-8")
    paths = ["scripts/prepare_public_case.py", "scripts/verify_public_offline.py", "scripts/run_public_offline.sh", "tests/test_public_case.py", "configs/public-subject-review.json", "templates/public-subject-review.txt", "src/library_token_use/core.py", "src/library_token_use/counting.py", "src/library_token_use/__init__.py", "data/public-loc/records.jsonl", "data/public-loc/manifest.json", "requirements-lock.txt"]
    imports = {}
    for name in paths:
        if name.endswith(".py"):
            tree = ast.parse((ROOT / name).read_text())
            imports[name] = sorted({a.name for n in ast.walk(tree) if isinstance(n, ast.Import) for a in n.names} | {n.module or "" for n in ast.walk(tree) if isinstance(n, ast.ImportFrom)})
    write_json(evidence / "offline-run.json", {
        "started_utc": started, "finished_utc": datetime.now(timezone.utc).isoformat(),
        "command": "bash scripts/run_public_offline.sh", "traced_command": command,
        "method": "unshare --user --map-root-user --net; distinct namespace; IPv4/IPv6 probes; strace -f -e trace=network",
        "outer_network_namespace": args.outer_net, "inner_network_namespace": inner, "interfaces": interfaces, "external_probes": probes,
        "preprocessing_exit_status": run.returncode, "tests_exit_status": tests.returncode, "preprocessing_network_syscall_count": len(calls),
        "source_sha256": {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in paths}, "imports_by_file": imports,
        "dependencies": {d.metadata["Name"]: d.version for d in importlib.metadata.distributions()},
        "code_inspection": "The entry point reads fixed JSON, projects fields, compares values, groups exact text and constructs a local tokenizer. No model client, local model loading, embeddings or online fallback. urllib is confined to the separate acquisition script. Socket use in this verification wrapper is limited to isolation probes.",
        "model_calls_in_preprocessing": 0, "codex_development_usage": "not measured", "hokieai_allocation": "not measured", "model_answer_quality": "not measured",
        "scope": "The new public-sample preprocessing process and descendants, after online acquisition/setup. Historical synthetic-run evidence is preserved separately. Not a librarian user test or an AI-answer evaluation.",
    })
    if run.returncode or tests.returncode or calls:
        raise SystemExit(run.stderr + tests.stderr + "Public-case isolation verification failed")
    print(run.stdout, end="")
    print("Public-case isolated run and four targeted checks passed; zero traced network syscalls.")


if __name__ == "__main__":
    main()
