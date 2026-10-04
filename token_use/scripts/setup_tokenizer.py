"""Online setup only: materialize the chosen encoding for strict local loading."""
import base64
import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
cache = ROOT / ".cache"
cache.mkdir(exist_ok=True)
os.environ["TIKTOKEN_CACHE_DIR"] = str(cache / "download")

from tiktoken_ext.openai_public import cl100k_base  # noqa: E402

spec = cl100k_base()
ranks = spec.pop("mergeable_ranks")
resource = cache / "cl100k_base.tiktoken"
resource.write_bytes(b"".join(base64.b64encode(token) + b" " + str(rank).encode() + b"\n" for token, rank in sorted(ranks.items(), key=lambda pair: pair[1])))
spec["resource"] = resource.name
spec["sha256"] = hashlib.sha256(resource.read_bytes()).hexdigest()
(cache / "tokenizer.json").write_text(json.dumps(spec, indent=2) + "\n", encoding="utf-8")
print(f"Prepared local {spec['name']}; sha256={spec['sha256']}")
