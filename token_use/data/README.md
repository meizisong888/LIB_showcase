# Synthetic collection data

**No production library records, real patrons or private collections.** These
are original, Codex-assisted teaching descriptions, authored on **2026-10-04**.
The target directory contained no usable data. A small fixed synthetic corpus
was chosen to cover missingness, restrictions, duplicates and retrieval failures
without an external data-acquisition project. No real catalog was sampled or
downloaded; there is therefore no external catalog download URL or acquisition
license to assert. The [fixture license](LICENSE) permits public reuse.

- [catalog-v1.jsonl](raw/catalog-v1.jsonl): 60 export rows, 58 distinct task
  inputs. Only two deliberately duplicated export rows (`R059`, `R060`).
- [catalog-v2.jsonl](raw/catalog-v2.jsonl): 61 rows in the updated snapshot,
  of which 60 are active. `R004` is absent; `R005` is inactive; `R007` has
  corrected subjects; `R020` has a changed restriction; `R061/R062` are new.
- [retrieval-gold.json](retrieval-gold.json): every original ID has a reviewed
  description, relevance decision and rationale. Positive rows include the
  complete evidence passage; `R008` is explicitly insufficient. Labels were
  fixed before ranking, with Codex assistance, not librarian annotation.
- [subject-boundaries.json](subject-boundaries.json): expected boundary cases.
- [fixture-lock.json](fixture-lock.json): hashes fixed at fixture creation.
  The experiment checks them before reading labels or running retrieval.
- [make_demo_data.py](../scripts/make_demo_data.py): authorship recipe, separate
  from the measured preprocessing path. It refuses to overwrite existing raw
  fixtures. You do not need to run it to reproduce the experiment.

There is no long repeated filler inserted to enlarge the baseline. Export-only
metadata has modest, plausible lengths. The synthetic descriptions are not
citations to historical events or evidence about actual holdings. The fictional
access conditions test whether constraints survive; they do not grant access
to a real archival item.

## Schema

The input is JSON Lines (JSONL): one object per line. Encoding is UTF-8.

| Field | Shape | Task role |
| --- | --- | --- |
| `id` | Unique nonempty string | Stable export-row ID; duplicate IDs are an error |
| `title`, `abstract` | Strings; missing/empty allowed and flagged | Subject/research evidence; full description is preserved |
| `subjects` | List of strings | Local teaching terms; not an authority file |
| `language` | `en`, `es`, `en-es` | Language context; `R017` is Spanish |
| `edition`, `copy` | Strings | Version/copy differences cannot be grouped away |
| `date` | `YYYY-MM-DD` string | Metadata date, not necessarily the event year; invalid dates flagged |
| `material_type` | String from rules | Used only when task scope specifies a type |
| `collection` | Stable collection/provenance string | Semantic provenance; changing it invalidates cache |
| `restrictions` | String | Access, absent material and interpretation limits |
| `source_locator` | Snapshot path plus `#L` line number | Current pointer to original row; refreshed on updates |
| `status` | `active` or `inactive` | Incremental workflow reports removal/inactivation; unknown status rejected |
| `import_batch`, `imported_at` | Strings | Export bookkeeping, excluded from subject input |
| `catalog_ui` | Object | Display bookkeeping, excluded from subject input |
| `local_shelf` | String | Excluded only because this task does not concern holding locations |
| `export_note` | String | Synthetic-data notice, excluded in default subject task |

`source_locator` in this schema is a movable snapshot pointer, not the only
provenance field. Preserve collection identity in `collection`; add any other
meaningful provenance or task requirement to the configuration before use.
Map your actual export explicitly; no MARC, PDF or image parsing is implemented.
Keep custom/private inputs in ignored `outputs/` or `scratch/`, not this public
fixture directory. The code reads JSON as data and never executes its content.

## Interpreting the gold standard

The query asks for descriptions giving evidence of Appalachian communities'
experience of or response to river floods. Twelve rows qualify, including two
duplicate export rows. Recall is **source-record recall**, not work-level or
entity-level recall. Duplicated rows can occupy multiple top-k places: this is
visible in the ranking and is a limitation of this simple retrieval example.
The gold standard covers the supplied descriptions only. It is an instructional
reference, not an independent expert assessment or an exhaustive collection
bibliography. Never use its labels to claim production retrieval quality.
