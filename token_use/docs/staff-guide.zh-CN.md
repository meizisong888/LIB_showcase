# 把馆藏材料交给 HokieAI 前：六步操作

在 `token_use/` 目录操作，先完成 [README 中的一次性安装](../README.md#quick-start)。
先用合成数据练习。本程序只准备材料，不替你完成 AI 审核。

1. **先确定一项业务，选已有配置。** 标题／摘要与主题词匹配检查用
   [subject-review.json](../configs/subject-review.json)；寻找阿巴拉契亚地区洪水经历与社区应对材料用
   [research-candidates.json](../configs/research-candidates.json)；限定 2000–2025 年报告清单用
   [reports-2000-2025.json](../configs/reports-2000-2025.json)。最后一项由规则直接处理。
   不要把清单任务的年份限制套到主题审核。换业务前先核对保留字段。

2. **准备导出文件，保留原始版本。** 示例是
   [catalog-v1.jsonl](../data/raw/catalog-v1.jsonl)，每行一个 JSON 对象，包含唯一 ID、来源定位及
   [字段说明](../data/README.md) 中的字段。自己的文件放在被 Git 忽略的
   `outputs/my-export.jsonl`，运行时加 `--input outputs/my-export.jsonl`。
   先把原系统字段映射为本项目格式；这里没有 MARC 导入器。完整摘要、语言、版本、副本、日期、
   限制信息和稳定的馆藏来源不能随意省略。

3. **执行实际命令。** 主题审核材料准备：

   ```bash
   .venv/bin/python scripts/run.py prepare --out outputs/review
   ```

   研究候选：`.venv/bin/python scripts/run.py retrieve --top-k 15 --out outputs/research`。
   规则清单：`.venv/bin/python scripts/run.py filter --out outputs/inventory`。
   在支持隔离功能的 Linux 上，一条命令复现实验与网络阻断证据：`bash scripts/run_offline.sh`。

4. **发送前检查例外和来源。** 打开 `outputs/review/review-checks.json`，检查 `members` 中的 ID
   是否齐全，查看 `missing_fields`、`rule_issues`、日期与 `restrictions`。
   `insufficient_material` 表示材料不足，需要补齐或明确报告限制。示例的
   [保留审计](../results/case1/retention.json) 已逐条比较保留字段；自己的导出仍需核对字段映射与来源。
   重点看 R007（格式合格但主题错配）、R008（缺摘要）、R016（副本限制）。查看完整原记录：

   ```bash
   .venv/bin/python scripts/run.py show --id R016
   ```

   检索输出保留完整描述；R004 的地点和应对证据分处两段，两段都要读。规则例外在
   `outputs/inventory/inventory.json`。脚本完成的是格式与保留检查；语义正确性仍需员工或 AI 判断。

5. **复制指定文件，核对回答。** 主题审核复制整个 `outputs/review/pending.txt`；研究候选复制整个
   `outputs/research/candidates.txt`。文件已包含可直接用的
   [主题审核模板](../templates/subject-review.txt) 或 [研究候选模板](../templates/research-candidates.txt)，
   要求返回 ID、原文证据和材料不足标记。先回查原文，再修改目录记录。不要上传缓存或审计文件。
   `input-count.json` 只是该文本在指定编码下的大小，不是 HokieAI 实际扣减额度。
   遇到同义表达、其他语言、否定／限制条件或需要查全时，扩大 k 或取消筛选：

   ```bash
   .venv/bin/python scripts/run.py retrieve --all --out outputs/research-full
   ```

   此时用 `outputs/research-full/candidates.txt`。示例即使 top-15 仍漏 R003 和 R017。
   本地可查看的是完整馆藏描述，不是档案实物全文；关键词截取无法保证穷尽查全。

6. **更新后按依赖复用准备工作。** 保留第一次输出目录，再运行：

   ```bash
   .venv/bin/python scripts/run.py prepare --input data/raw/catalog-v2.jsonl --previous-cache outputs/review/cache.json --out outputs/review-v2
   ```

   在 `outputs/review-v2/status.json` 核对新增、修改、删除、失效和复用状态；新待处理材料在
   `outputs/review-v2/pending.txt`。任务、模板、规则、词表或代码变化会触发重建。
   **缓存不证明已经完成审核。** 只有另行保存并核对过旧结论，才可仅审核更新批次；否则还要处理
   第一次材料，或去掉 `--previous-cache` 重新准备所有有效记录。

| 工作任务 | 推荐方法 | 不能省略的信息 |
| --- | --- | --- |
| 主题匹配审核 | 显式字段选择、精确分组 | 全部 ID、标题、摘要、主题、语言、版本／副本、日期、限制和来源 |
| 日期／类型清单 | 规则与明确范围 | 原始日期／类型、例外、ID 和来源 |
| 研究候选材料 | TF-IDF（词频—逆文档频率）与扩大范围／完整来源 | 完整描述、限定条件、地点、限制与来源 |
| 更新导出 | 依赖感知的准备缓存 | 变化项、删除／失效记录、最新定位和另行核实的旧结论 |
