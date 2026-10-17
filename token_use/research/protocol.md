# Research protocol: token reduction for descriptions of library collection items

## Research question and scope

For a library workflow that drafts short descriptions from catalog metadata, how much can deterministic preprocessing reduce the input sent to a large language model (LLM), and what changes in the resulting descriptions?

This pilot separates two questions:

1. **Measured preparation question:** How do formatting and field selection change token counts for the same 100 real records? Which source field values remain available?
2. **Prospective quality question:** Do the shorter inputs still support accurate, appropriately qualified descriptions that library staff can use?

Stage 1 can establish input reduction and exact preservation of selected source values. It cannot establish semantic equivalence, acceptable staff output, monetary savings, or reductions in HokieAI allocation. Stage 2 requires actual model responses and independent human evaluation; those outcomes must remain pending until collected.

The intended contribution is a reproducible, task-specific empirical comparison with explicit failure cases. Field selection, compact serialization, deduplication, and prompt compression are established techniques. This project makes no first-of-its-kind claim. See [references and positioning](references.md).

## Data and provenance

Use every record in the Library of Congress (LOC) Free to Use and Reuse package's official 100-item sample. The source is frozen in [data/loc-sample.json](data/loc-sample.json); [data/manifest.json](data/manifest.json) records its URL, retrieval time, byte count, and SHA-256 digest. The publisher describes this as a random sample from its 2,610-item curated package but does not document the original sampling seed. No records are excluded because of their token counts or likely output quality.

These records are transformed metadata from a curated collection, not raw MARC exports and not a representative sample of all library materials. The frozen sample has 36 top-level fields, with a nonempty `Description` in 31 records and an empty `Description` in 69. An empty description is not itself a cataloging error: titles, notes, creator roles, dates, and other fields may still support a useful limited description.

The publisher documents standardization and location enrichment. Its derived `Location` objects can contain incorrect geocoding; retain the distinction between those objects and `Location_text`. An evaluator's evidence reference is the **full frozen metadata record**, not a verified account of the underlying photograph, map, recording, or other object. This study does not inspect those objects or establish that their metadata are factually correct.

Keep source attribution and item URLs. Preserve the original `Rights` statements and their qualifications; the package's reuse designation does not make every item an unconditional public-domain grant. A new software license must not be presented as replacing source-content rights. The source documentation is linked in [references.md](references.md).

## Task held constant

The exact instruction is [task.txt](task.txt). For one record, the model drafts a public-facing description of **at most 80 English words** for library staff to review. Shorter output is appropriate when the supplied evidence is sparse. The requested response is a JSON object containing `record_id`, `description`, `evidence_fields`, and `limitations`.

Each call describes **one catalog item**. The instruction's phrase “collection description” means an item description based on collection metadata; this study does not generate collection-level archival descriptions or finding aids. This clarification does not change the locked task text.

The model must use the supplied metadata without browsing or assuming that it has viewed the item. It should preserve uncertainty, attribution, creator roles, qualified dates, and qualified rights statements. Existing subject headings are evidence of catalog description, not independent confirmation of what an unseen object depicts. Missing information must not be filled by invention. The 80-word limit applies to the `description` value; the supporting JSON fields are still included in actual output-token accounting.

This is a description-drafting task, not a test of original subject-heading assignment, rights determination, or automatic catalog publication. Every condition receives the same task and output requirements.

## Stage 1: paired input measurements

### Conditions

Every one of the 100 records appears in all four conditions defined in [config.json](config.json).

| Condition | Transformation | What the comparison isolates |
|---|---|---|
| `full_pretty` | All 36 source fields, serialized as readable indented JSON. | A common readable representation; its whitespace is not essential metadata. |
| `full_compact` | The same complete record in compact JSON. | Formatting alone, compared with `full_pretty`. This is the primary baseline for field-selection comparisons. |
| `task_fields` | Compact JSON containing the 27 configured fields, with their source values unchanged. | A conservative, task-specific projection beyond formatting. |
| `title_subjects` | Compact JSON containing only `Id`, `Url`, `Title`, `Subjects`, and `Subject_headings`. | A deliberately sparse stress condition; its larger reduction is not presumed desirable. |

The 27 retained fields are:

```text
Id, Url, Title, Other_title, Description, Notes, Creators, Contributors,
Date, Date_text, Language, Subject_headings, Subjects, Original_format,
Type_of_resource, Medium, Genre, Rights, Source_collection, Repository,
Location_text, Part_of, Set, Call_number, Shelf_id, Lccn, Index
```

The nine omitted fields are `Digitized`, `IIIF_manifest`, `Last_updated_in_api`, `Location`, `Mime_type`, `Number_of_files`, `Online_format`, `Other_record_formats`, and `Preview_url`. This choice prioritizes description evidence and item traceability while omitting delivery details and derived geocoding for this particular task. It is a hypothesis to evaluate, not a declaration that those fields are useless in other library workflows. No strings are summarized, rewritten, truncated, translated, or normalized in `task_fields`; nested values and empty values are retained for selected fields. The original record remains available locally.

Do not combine whitespace reduction and field removal into one unexplained savings claim. Compare `full_compact` with `full_pretty` for serialization, and compare `task_fields` with `full_compact` for the additional effect of field selection. Report `title_subjects` as a stress test even if it saves the most tokens.

### Counting and preservation checks

Count each complete prepared request text, including the unchanged task instruction and its metadata delimiter, independently with `cl100k_base` and `o200k_base`. These are two diagnostic encodings, not two evaluated models. Local counts do not include any unknown chat-envelope overhead and must not be relabeled as provider-reported usage.

For record *i*, condition *c*, and encoding *e*, let `T(i,c,e)` be that count. Report absolute counts and the paired reduction `1 - T(i,c,e) / T(i,baseline,e)`. For an aggregate percentage, use `1 - sum(T_condition) / sum(T_baseline)` and identify it as an aggregate reduction; the mean of record-level percentages is a different statistic. Also show the paired distribution, including the median, interquartile range, and range, so a few long records cannot silently determine the interpretation. Keep the per-record measurements available for reproduction.

Check record identity and JSON value equality for every retained field. For full representations, verify equality with the entire parsed source record. For projected representations, verify equality with the specified projection. Report omitted fields explicitly. These checks demonstrate **source field-value preservation**, not preservation of every meaning needed for the task. Keeping an ID alone establishes neither evidential sufficiency nor output correctness.

Preprocessing uses ordinary JSON operations and local tokenizers. It requires no language model, embedding model, or model API. Initial downloading of source data, software, or tokenizer resources is separate from the local preparation run. Record local elapsed time and CPU time where the runner measures them; zero model calls does not mean zero computation or zero human setup effort. Keep any offline execution evidence scoped to the process actually tested.

### Design record

[design-lock.json](design-lock.json) records the configuration, task, and data hashes fixed before the first count run. This is an internal pilot design lock, **not public preregistration**. A change to a frozen input or condition requires a clearly versioned amendment and regenerated results. Do not replace earlier evidence without preserving its provenance.

## Stage 2: prospective response-quality pilot

### Sample and execution

Select 20 records from the frozen sample: ten with a nonempty `Description` and ten without one. Within each stratum, rank records using a deterministic hash of the seed `library-token-pilot-v1` and record identity; publish the selected IDs and exact selection procedure. Selection must not use model responses. This deliberately balanced sample supports inspection of sparse-evidence cases. Its combined score must not be described as an estimate for the original 31/69 composition without appropriate weighting and uncertainty.

Run all four conditions for each selected record: **80 planned independent model calls**. Choose and record one fixed model version, provider/deployment, parameters, output limit, and execution date before collecting responses. Use the same settings and task for every condition. Start each call with a fresh context; disable browsing and additional tools. Randomize condition order with a recorded seed, retain the resulting schedule, and keep paired records identifiable. A fixed model version reduces drift but does not guarantee deterministic outputs.

This first pilot uses one response per record-condition to keep the experiment manageable. It does not estimate repeat-run model variance. Any later repeat experiment must be labeled separately. No credentials are configured as part of this protocol, and no quality results should be generated or claimed from placeholders. If a selected deployment is unavailable, document a prospective amendment before starting a replacement run.

Save the exact request, raw response, parsed response or parsing failure, model identifiers, request timestamp, and available response metadata. Do not manually repair failed responses and score the repaired text as the original output. A retry policy must be fixed before execution: distinguish transport retries from a new attempt after malformed, truncated, refused, or empty output. Preserve all attempts and their costs, including failed attempts; never silently select the best answer.

### Independent, blinded staff evaluation

Two human reviewers independently evaluate the responses against the full frozen record. Hide the condition, input-token count, model name, and execution order, and shuffle the review items. Reviewers see the full evidence record and the candidate response. They may infer a condition from its content, so this is blinding of labels, not a guarantee of complete concealment.

Before seeing model outputs, each reviewer independently identifies salient, supported facts in each full record that matter for a useful item description. Resolve differences and freeze a shared reference list before output review, retaining the independent lists and adjudication. Prioritize a realistic set for an 80-word description; do not require all metadata fields or every available fact. Agree on minimum useful detail before collecting model responses, including how to handle genuinely sparse records.

Agree on the rubric before evaluating the pilot responses. Retain both original scores, document disagreements, and record any adjudication separately. Report agreement as well as final assessments. Automated checks for JSON validity, exact record identity, and the 80-word limit support the review but cannot replace factual and professional judgment.

| Outcome | Operational definition |
|---|---|
| Unsupported factual claims | Flag each factual assertion that cannot be supported by the full frozen metadata, including added identities, events, locations, ownership, or permissions. Distinguish source contradictions from claims for which the record supplies no evidence. |
| Lost qualifications | Flag a stated claim whose source uncertainty, attribution, creator role, or qualification has been materially strengthened or removed. An omitted fact is not automatically a qualification error; assess qualifications attached to claims the response actually makes. |
| Informativeness and completeness | Record the number of frozen salient facts correctly conveyed, the number available in the reference list, and their ratio. Require faithful qualifications when matching a fact. Use the same denominator for all four conditions of a record. Record omissions separately from unsupported claims. If no supported salient fact is available, report the ratio as not applicable and evaluate the handling of insufficient evidence. |
| Usable staff draft | Record whether the description meets the agreed minimum useful detail and can be used after ordinary stylistic editing without substantive factual correction or addition. Give reasons for rejection or necessary editing. A responsibly short description may pass for sparse evidence; saying almost nothing must not pass merely because it contains no factual errors. |
| Evidence handling | Check whether `evidence_fields` refer to supplied fields and whether `limitations` accurately describe relevant missing evidence or uncertainty. A self-reported evidence list is not proof that a claim is supported. |
| Editing time, if observed | Measure actual time spent bringing a draft to the agreed usable state, using a consistent procedure. Record failures that cannot be repaired from the available metadata. If this activity is not performed, report the measure as not collected; do not estimate saved staff minutes. |

Call the first outcome “unsupported by the supplied metadata,” rather than claiming to determine all real-world falsehoods. The full record can itself contain errors, including the publisher's documented location-enrichment limitations. Reviewers should note such ambiguity rather than invent a resolution from an unseen object. Preserve historical language and rights qualifications appropriately in the evidence record; a readable description need not reproduce every source term.

### Actual resource accounting

For each attempt, retain provider-reported input and output tokens and, where available, cached-input and reasoning-token fields with their provider-defined meanings. Do not assume these are mutually exclusive totals: reasoning tokens may already be included in output usage, and cached tokens may be a subset of input usage. Keep the raw usage object. Missing counters are missing data, not zeros.

Record failures, retries, model-call latency, and measured end-to-end latency including preprocessing. Report local preparation time separately from model latency. If converting usage to currency, retain the price schedule, effective date, and treatment of cached tokens or other discounts; do not infer a charge from a local tokenizer count alone. Development-time Codex usage is outside the measured workflow unless it is separately recorded.

The study does not measure HokieAI quota deduction. A decrease in local input-token counts is not a measured decrease in that service's allocation meter, total inference cost, output length, or staff workload.

### Analysis and decision rule

Use paired comparisons because each record appears in every condition. The primary field-selection contrast is `task_fields` versus `full_compact`; the sparse condition tests the consequences of removing much more evidence. Report outcomes overall and by description-availability stratum, along with record-level failure examples. Plot or tabulate token reduction alongside usability, salient-fact coverage, and factual-error outcomes instead of ranking conditions by token reduction alone.

Before inspecting quality outcomes, agree with the supervising teacher and reviewers on what practical loss in usability or salient-fact coverage, or increase in serious factual errors, would be unacceptable, and document those criteria. This protocol does not invent a numerical quality margin. Treat the 20-record experiment as a feasibility and precision pilot; do not infer noninferiority, equivalence, or “no quality loss” from a nonsignificant difference. Use observed paired variation and the chosen practical margin to plan a larger sample and its uncertainty analysis. Preserve the record as the unit of pairing and account for repeated ratings from the two reviewers.

The decision to recommend a preparation method requires both a useful input reduction and quality compatible with the predeclared practical criterion. If evidence is insufficient to decide, report that uncertainty rather than promote the lowest-token condition.

## Later experiments kept separate

- **Exact deduplication:** use naturally occurring duplicates and preserve record-to-item mappings. Report the observed duplicate prevalence. Do not inflate savings by inserting duplicate records into the primary corpus.
- **Incremental processing:** use real dated snapshots or an explicitly labeled controlled update scenario. Distinguish cached preparation from cached model responses, account for the initial run, and invalidate reuse when relevant records, tasks, rules, or vocabularies change.
- **Keyword retrieval:** use independently judged relevance sets and report recall as well as input counts. Assess wording variation and language coverage; the model cannot recover evidence that retrieval never supplies.
- **Model-based compression:** an optional later comparator, with its own inference, latency, and quality costs included. It is outside the no-model preprocessing condition.

Each extension needs a task-appropriate denominator and evaluation design. Their percentages should not be combined with field-selection results as if they measured the same operation.

## Reporting boundary

Publish the frozen input provenance, configuration, task, generated inputs, counting environment, per-record measurements, and checks. Publish model outputs and human assessments only after actual execution and review, clearly distinguishing planned measures from observed ones. Keep source-content rights separate from code licensing.

Conclusions from this pilot apply to the sampled, transformed LOC metadata and the specified description task. They do not automatically generalize to other collections, languages, metadata standards, professional cataloging judgments, models, deployment settings, or repeated production workloads. A larger study should choose additional collections and sample size based on the pilot's concrete limitations and precision, rather than adding many models without a research reason.
