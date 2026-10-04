| Case / task | Input → retained or pending records | Baseline text tokens | Prepared text tokens | Input reduction | Evidence / recall | Boundary |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| 1 · Subject review | 60 → 60 | 15,231 | 13,865 | 8.97% | 60/60 IDs; 58 items; all 12 configured original fields unchanged | R007 passes format rules but still needs semantic review; R008 has insufficient material. |
| 2 · Candidates top5 | 60 → 5 | 15,212 | 1,279 | 91.59% | Recall 5/12; evidence 5/12 | Missed: R003, R004, R005, R010, R013, R015, R017; lexical decoys may remain. |
| 2 · Candidates top15 | 60 → 15 | 15,212 | 3,421 | 77.51% | Recall 10/12; evidence 10/12 | Missed: R003, R017; lexical decoys may remain. |
| 2 · Full source fallback | 60 → 60 | 15,212 | 15,212 | 0.00% | Recall 12/12; evidence 12/12 | Complete fixture supplied; relevance judgment still required. Not exhaustive outside this fixture. |
| 3 · first | 60 → 60 | 13,865 | 13,865 | 0.00% | 60 pending; 0 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |
| 3 · second | 60 → 4 | 13,812 | 1,076 | 92.21% | 4 pending; 56 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |
| 3 · task-change | 60 → 60 | 14,856 | 14,856 | 0.00% | 60 pending; 0 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |
| 3 · vocabulary-change | 60 → 60 | 13,844 | 13,844 | 0.00% | 60 pending; 0 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |
| 3 · rules-change | 60 → 60 | 13,801 | 13,801 | 0.00% | 60 pending; 0 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |
