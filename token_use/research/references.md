# References and research positioning

Sources checked on 2026-10-17. These references motivate the design; their reported performance is not a prediction of this pilot's results. The literature review is targeted, not a systematic review or proof of novelty.

## Library workflow evidence

1. **Chow, E. H. C., Kao, T., and Li, X. (2024). _An Experiment with the Use of ChatGPT for LCSH Subject Assignment on Electronic Theses and Dissertations._** [Author manuscript, version 3](https://arxiv.org/abs/2403.16424), [full text](https://arxiv.org/pdf/2403.16424). DOI: [10.48550/arXiv.2403.16424](https://doi.org/10.48550/arXiv.2403.16424).

   The study uses titles and abstracts of 30 electronic theses and dissertations to evaluate generated subject headings. It separates MARC coding, controlled-vocabulary validity, specificity, and exhaustivity. For our design, it illustrates why correctly formatted output and plausible subject language are insufficient quality measures. Our task is description drafting, so we borrow the distinction between formal validity and useful content rather than transfer its subject-heading scores.

2. **Moutran, H. C., Murphy, D., Sanchez, K., Borkgren, W., Pierce Meyer, K., and Conrad, J. (2025). _Assessing Large Language Models: Architectural Archive Metadata and Transcription._ Proceedings of the International Conference on Dublin Core and Metadata Applications.** [Publication and full text](https://dcpapers.dublincore.org/article/952583993). DOI: [10.23106/dcmi.952583993](https://doi.org/10.23106/dcmi.952583993).

   A library team evaluates metadata and transcription tasks on historical architecture materials, considering quality, cost, and time. Reviewers score completeness, accuracy, and usefulness with model labels hidden. This provides a practical precedent for human assessment and workload accounting. It does not establish that any particular field can be removed safely from our records.

3. **Library of Congress Labs. _Exploring Computational Description._** [Official project account](https://labs.loc.gov/work/experiments/ECD/).

   The project describes cataloger review of AI-assisted description and subject work, including different performance across metadata fields. It places quality and practical implementation conditions alongside computational cost. This supports evaluating a usable staff workflow and retaining professional review; it does not justify fully automatic publication or a universal accuracy claim.

## Compression and adjacent efficiency research

4. **Jiang, H., Wu, Q., Lin, C.-Y., Yang, Y., and Qiu, L. (2023). _LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models._ Proceedings of EMNLP, 13358–13376.** [ACL Anthology](https://aclanthology.org/2023.emnlp-main.825/). DOI: [10.18653/v1/2023.emnlp-main.825](https://doi.org/10.18653/v1/2023.emnlp-main.825).

   LLMLingua uses a smaller language model and a controlled compression procedure, evaluating downstream tasks as well as compression. It is relevant prior work for reducing prompts, but its model-based preprocessing differs from this pilot's JSON formatting and explicit field selection. A future comparison must include the compressor's own computation and inference costs.

5. **Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., and Liang, P. (2024). _Lost in the Middle: How Language Models Use Long Contexts._ Transactions of the Association for Computational Linguistics, 12, 157–173.** [ACL Anthology](https://aclanthology.org/2024.tacl-1.9/). DOI: [10.1162/tacl_a_00638](https://doi.org/10.1162/tacl_a_00638).

   In the studied retrieval and question-answering tasks, the position of relevant information affects performance. This motivates testing task quality instead of assuming that longer input always helps. It also makes input order a potential experimental factor. The findings concern the models and tasks tested in that paper, not a universal property of every later deployment.

6. **Cazzaro, M., and Silvello, G. (2026). _Large language models as digital libraries: a multi-benchmark and multi-model study._ International Journal on Digital Libraries, 27, article 13.** Published 2026-09-08. [Publication and full text](https://link.springer.com/article/10.1007/s00799-026-00448-w). DOI: [10.1007/s00799-026-00448-w](https://doi.org/10.1007/s00799-026-00448-w).

   This study compares direct prompting and structured querying strategies on cultural-heritage benchmarks, including quality versus token consumption. It is an important adjacent study: efficiency trade-offs in digital-library settings are already being investigated. Its system treats the model as a noisy information source, whereas our pilot transforms supplied metadata for a source-grounded description task. That narrower distinction is a research scope, not proof that our approach is unprecedented.

## Dataset documentation

**Library of Congress Labs and AVP. _Free to Use and Reuse Data Package README_, version 1.2, updated 2024-04-17.** [Official documentation](https://data.labs.loc.gov/free-to-use/README.html), [official 100-record sample](https://data.labs.loc.gov/free-to-use/sample-data/metadata.json).

The documentation describes the package's sampling, field transformations, rights context, and potentially inaccurate derived geocoding. Our frozen copy and retrieval provenance are recorded in [data/manifest.json](data/manifest.json). Consult item-level rights information rather than assigning a new blanket license to source content.

## Position of this study

The proposed contribution is a transparent comparison of **deterministic input preparation for one library task**: describing one catalog item per call. It separately measures formatting, task-based projection, sparse-input failure cases, and downstream staff usability. Human review must assess both factual support and coverage of salient evidence, so an uninformative answer cannot succeed merely by avoiding errors. The pilot cannot establish semantic quality from token counts alone, and it cannot support claims about all library workflows or HokieAI quota savings.
