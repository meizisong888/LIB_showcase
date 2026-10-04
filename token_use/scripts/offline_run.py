"""Linux network-namespace verification and traced full experiment execution."""
import argparse
import ast
from datetime import datetime, timezone
import errno
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import platform
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
    evidence = ROOT / "results/execution"
    evidence.mkdir(parents=True, exist_ok=True)
    inner = os.readlink("/proc/self/ns/net")
    interfaces = [name for _, name in socket.if_nameindex()]
    if inner == args.outer_net or interfaces != ["lo"]:
        raise RuntimeError("Isolation not established; refusing to label run offline.")
    probes = []
    for family, address in [(socket.AF_INET, ("1.1.1.1", 443)), (socket.AF_INET6, ("2606:4700:4700::1111", 443))]:
        try:
            with socket.socket(family, socket.SOCK_STREAM) as sock:
                sock.settimeout(2)
                sock.connect(address)
            raise RuntimeError("Unexpected external network connectivity")
        except OSError as exc:
            if exc.errno not in {errno.ENETUNREACH, errno.EAFNOSUPPORT, errno.EPROTONOSUPPORT, errno.EADDRNOTAVAIL}:
                raise RuntimeError(f"Unexpected probe result, not sufficient isolation evidence: {exc}") from exc
            probes.append({"family": family.name, "target": str(address), "errno": exc.errno, "result": str(exc)})
    trace = evidence / "network-syscalls.log"
    command = ["strace", "-f", "-e", "trace=network", "-o", str(trace.relative_to(ROOT)), ".venv/bin/python", "scripts/run.py", "demo"]
    started = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(command, text=True, capture_output=True, check=False)
    (evidence / "run.stdout.txt").write_text(result.stdout, encoding="utf-8")
    (evidence / "run.stderr.txt").write_text(result.stderr, encoding="utf-8")
    syscall_lines = [line for line in trace.read_text(encoding="utf-8").splitlines() if "(" in line and "+++" not in line]
    test = subprocess.run([".venv/bin/python", "-m", "unittest", "discover", "-s", "tests", "-v"], capture_output=True, text=True)
    (evidence / "tests.txt").write_text(test.stdout + test.stderr, encoding="utf-8")
    artifact_check = subprocess.run([".venv/bin/python", "scripts/verify_artifacts.py"], capture_output=True, text=True)
    (evidence / "artifact-checks.txt").write_text(artifact_check.stdout + artifact_check.stderr, encoding="utf-8")
    packages = sorted({d.metadata["Name"]: d.version for d in importlib.metadata.distributions()}.items())
    sources = [p for folder in ["src", "scripts", "tests", "configs", "templates", "data"] for p in (ROOT / folder).rglob("*") if p.is_file() and "__pycache__" not in p.parts]
    sources += [ROOT / "requirements.txt", ROOT / "requirements-lock.txt"]
    imports = {}
    for p in sources:
        if p.suffix == ".py":
            tree = ast.parse(p.read_text(encoding="utf-8"))
            imports[str(p.relative_to(ROOT))] = sorted({alias.name for node in ast.walk(tree) if isinstance(node, ast.Import) for alias in node.names} | {node.module or "" for node in ast.walk(tree) if isinstance(node, ast.ImportFrom)})
    write_json(evidence / "code-audit.json", {
        "imports_by_file": imports,
        "inspection": "Entry scripts/run.py -> local core/experiment/counting. No inference client, embedding model, query rewriting service or model endpoint. Counting constructs tiktoken.Encoding from local checked files. requests is a transitive tiktoken installation dependency, not used by the measured entry point.",
        "setup_separation": "scripts/setup_tokenizer.py downloads encoding resources during setup only. scripts/offline_run.py uses socket only for isolation probes before launching the traced experiment.",
        "source_sha256": {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(sources)},
    })
    write_json(evidence / "offline-run.json", {
        "started_utc": started, "finished_utc": datetime.now(timezone.utc).isoformat(),
        "command": "bash scripts/run_offline.sh", "traced_command": command,
        "method": "unshare --user --map-root-user --net; distinct Linux network namespace, only loopback, IPv4/IPv6 external probes blocked; strace network syscall audit of full demo",
        "outer_network_namespace": args.outer_net, "inner_network_namespace": inner,
        "interfaces": interfaces, "external_probes": probes,
        "ipv4_route_table": Path("/proc/net/route").read_text(),
        "ipv6_route_table": Path("/proc/net/ipv6_route").read_text() if Path("/proc/net/ipv6_route").exists() else "IPv6 unavailable",
        "preprocessing_exit_status": result.returncode, "tests_exit_status": test.returncode,
        "artifact_checks_exit_status": artifact_check.returncode,
        "preprocessing_network_syscall_count": len(syscall_lines),
        "python": platform.python_version(), "platform": platform.system(), "dependencies": dict(packages),
        "scope": "This measured local preprocessing process and children. Not dependency installation, this Codex development session, future edited scripts, or any HokieAI session.",
        "model_usage": {"preprocessing_inference_calls": 0, "codex_development_tokens": "not measured", "independent_model_answer_comparison": "not run", "hokieai_allocation": "not measured"},
    })
    if result.returncode or test.returncode or artifact_check.returncode or syscall_lines:
        print(result.stderr + test.stderr + artifact_check.stderr, file=sys.stderr)
        raise SystemExit("Offline verification failed; inspect results/execution.")
    print(result.stdout)
    print("Full isolated run and tests passed; zero network syscalls in the preprocessing process. Evidence: results/execution/offline-run.json")


if __name__ == "__main__":
    main()
