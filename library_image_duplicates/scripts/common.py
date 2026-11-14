"""Small shared I/O helpers. No inference or network work at import time."""
import hashlib, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
def read(path): return json.loads(Path(path).read_text())
def write(path, value):
    path=Path(path); path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,indent=2,ensure_ascii=False,allow_nan=False)+'\n')
def digest(data): return hashlib.sha256(data).hexdigest()
def canonical(value): return json.dumps(value,sort_keys=True,separators=(',',':')).encode()
