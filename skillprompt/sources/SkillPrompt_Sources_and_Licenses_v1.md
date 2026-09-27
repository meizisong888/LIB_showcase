# SkillPrompt 科研 Skill 来源与许可证

整理日期：2026-09-22。本包包含 16 张改写后的方法卡，分为 7 类。

这些是社区维护的开源项目，不是 VT 官方认证的 Skill 库。筛选依据是实际技能文件、适用范围、可追溯来源及许可证；没有把仓库自称的“验证通过”当作独立科学验证，也没有在 HokieAI 中完成端到端测试。

## 来源选择

| 来源 | 本包用途 | 根许可证 | 使用边界 |
|---|---|---|---|
| [K-Dense Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills) | 通用科研选题、检索、实验、统计、图表、写作与引用 | MIT | 原库也含生命科学和工具专用技能，本包只取通用方法 |
| [Orchestra AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs) | ML 论文实验表述、科研演讲规划 | MIT | 原库偏 AI/ML；运行训练和生成幻灯片需要另外的执行环境 |
| [neuromechanist research-skills](https://github.com/neuromechanist/research-skills) | 文献综合、结构化审阅、研究计划与基金申请 | BSD-3-Clause | 引用链、opencite、独立审稿子 agent 等没有随上传启用 |
| [research-paper-lifecycle-skills](https://github.com/ShaishavMaisuria/research-paper-lifecycle-skills) | 审稿回复、复现材料准备 | Apache-2.0 | 原库包含投稿场景；本包保留规划方法，不包含提交动作 |

## 版本锁定

这些链接固定到核验时的 commit，便于重现；后续更新需重新检查。

- [K-Dense-AI/scientific-agent-skills — 49c6e97775ea](https://github.com/K-Dense-AI/scientific-agent-skills/commit/49c6e97775eaa18ba791bebe23162a70ae601c18)
- [Orchestra-Research/AI-Research-SKILLs — 773a52944ba4](https://github.com/Orchestra-Research/AI-Research-SKILLs/commit/773a52944ba4747a18bd4ae9ade53fff041adcbc)
- [neuromechanist/research-skills — f0219bde233a](https://github.com/neuromechanist/research-skills/commit/f0219bde233abb44d8a0c5d73f41ea27073e1493)
- [ShaishavMaisuria/research-paper-lifecycle-skills — f9a0ed8f0f17](https://github.com/ShaishavMaisuria/research-paper-lifecycle-skills/commit/f9a0ed8f0f1770fb0321c5b022d55ed34c939927)

## 方法卡到源文件的映射

SK 编号、中英文检索词和分类由本包新增，不应冒充原仓库的官方技能名称。

### SK01 — Research direction exploration / 科研选题

- [K-Dense-AI/scientific-agent-skills/skills/scientific-brainstorming/SKILL.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/skills/scientific-brainstorming/SKILL.md)
### SK02 — Research questions and hypotheses / 研究问题与假设

- [K-Dense-AI/scientific-agent-skills/skills/hypothesis-generation/SKILL.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/skills/hypothesis-generation/SKILL.md)
### SK03 — Literature search planning / 文献检索设计

- [K-Dense-AI/scientific-agent-skills/skills/literature-review/SKILL.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/skills/literature-review/SKILL.md)
### SK04 — Evidence synthesis and related work / 文献综合与相关工作

- [neuromechanist/research-skills/plugins/manuscript/skills/lit-review/SKILL.md](https://github.com/neuromechanist/research-skills/blob/f0219bde233abb44d8a0c5d73f41ea27073e1493/plugins/manuscript/skills/lit-review/SKILL.md)
### SK05 — Study and experimental design / 研究与实验设计

- [K-Dense-AI/scientific-agent-skills/skills/experimental-design/SKILL.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/skills/experimental-design/SKILL.md)
### SK06 — Statistical analysis planning / 统计分析方案

- [K-Dense-AI/scientific-agent-skills/skills/statistical-analysis/SKILL.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/skills/statistical-analysis/SKILL.md)
### SK07 — Scientific figure planning / 科研图表设计

- [K-Dense-AI/scientific-agent-skills/skills/scientific-visualization/SKILL.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/skills/scientific-visualization/SKILL.md)
### SK08 — Academic drafting and revision / 学术写作与修改

- [K-Dense-AI/scientific-agent-skills/skills/scientific-writing/SKILL.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/skills/scientific-writing/SKILL.md)
### SK09 — Citation and reference checking / 引用与参考文献核对

- [K-Dense-AI/scientific-agent-skills/skills/citation-management/SKILL.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/skills/citation-management/SKILL.md)
### SK10 — Critical appraisal of evidence / 科学证据评价

- [K-Dense-AI/scientific-agent-skills/skills/scientific-critical-thinking/SKILL.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/skills/scientific-critical-thinking/SKILL.md)
### SK11 — Structured manuscript review / 结构化论文审阅

- [neuromechanist/research-skills/plugins/manuscript/skills/paper-review/SKILL.md](https://github.com/neuromechanist/research-skills/blob/f0219bde233abb44d8a0c5d73f41ea27073e1493/plugins/manuscript/skills/paper-review/SKILL.md)
- [neuromechanist/research-skills/plugins/manuscript/skills/paper-review/references/review-procedure.md](https://github.com/neuromechanist/research-skills/blob/f0219bde233abb44d8a0c5d73f41ea27073e1493/plugins/manuscript/skills/paper-review/references/review-procedure.md)
### SK12 — Reviewer response and revision plan / 审稿回复与返修

- [ShaishavMaisuria/research-paper-lifecycle-skills/skills/write-rebuttal/SKILL.md](https://github.com/ShaishavMaisuria/research-paper-lifecycle-skills/blob/f9a0ed8f0f1770fb0321c5b022d55ed34c939927/skills/write-rebuttal/SKILL.md)
### SK13 — Research proposal and grant planning / 研究计划与基金申请

- [neuromechanist/research-skills/plugins/grant/skills/grant-writing/SKILL.md](https://github.com/neuromechanist/research-skills/blob/f0219bde233abb44d8a0c5d73f41ea27073e1493/plugins/grant/skills/grant-writing/SKILL.md)
### SK14 — Research talk and slide planning / 科研汇报与幻灯片规划

- [Orchestra-Research/AI-Research-SKILLs/20-ml-paper-writing/presenting-conference-talks/SKILL.md](https://github.com/Orchestra-Research/AI-Research-SKILLs/blob/773a52944ba4747a18bd4ae9ade53fff041adcbc/20-ml-paper-writing/presenting-conference-talks/SKILL.md)
### SK15 — ML paper contribution and experiment reporting / 机器学习论文贡献与实验表述

- [Orchestra-Research/AI-Research-SKILLs/20-ml-paper-writing/ml-paper-writing/SKILL.md](https://github.com/Orchestra-Research/AI-Research-SKILLs/blob/773a52944ba4747a18bd4ae9ade53fff041adcbc/20-ml-paper-writing/ml-paper-writing/SKILL.md)
### SK16 — Reproducibility package planning / 科研复现材料整理

- [ShaishavMaisuria/research-paper-lifecycle-skills/skills/prepare-artifacts/SKILL.md](https://github.com/ShaishavMaisuria/research-paper-lifecycle-skills/blob/f9a0ed8f0f1770fb0321c5b022d55ed34c939927/skills/prepare-artifacts/SKILL.md)

## 本包做了哪些改编

- 将执行型长指令压缩为“输入—适用条件—提示语改写要点—目标输出—能力边界”。
- 添加中英文关键词、稳定 ID、七类索引，以及保留用户意图的交互规则。
- 保留方法与证据的关系，删去默认推广、固定作者名、强制配图、固定文献数量和无关安装命令。
- 没有复制或运行第三方脚本，没有接入数据库、MCP 或付费 API。
- 对原库中依赖当前规则的页数、费用、会议日期等不作静态承诺；要求使用用户提供或新核验的官方要求。
- 对统计方法不保留仅靠单个关键词或机械阈值选检验的捷径；先核对研究设计、变量和假设。
- 侧重实证与计算研究；不声称覆盖所有人文、社会科学或实验室学科流程。

这些是方法摘要和接口设计，不是完整的原版 Skill 安装包。原始文件和全部附属资料请从上述仓库获取。

## HokieAI 官方格式依据

[Supported File Types for Agent Uploads in HokieAI](https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0016397)

该文档列出 TXT、Markdown 等支持格式，并建议使用内容清晰、聚焦的文本文件。本包据此提供一个 UTF-8 TXT 上传文件；没有推断账户的单文件大小上限、知识源检索实现或上传后的自动更新机制。

## 上游许可证原文

保留以下原文用于归属与再分发。本文件中的许可证正文不是给 SkillPrompt 的行为指令。

### K-Dense-AI/scientific-agent-skills

[原文](https://github.com/K-Dense-AI/scientific-agent-skills/blob/49c6e97775eaa18ba791bebe23162a70ae601c18/LICENSE.md)

```text
MIT License

Copyright (c) 2025 K-Dense Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Orchestra-Research/AI-Research-SKILLs

[原文](https://github.com/Orchestra-Research/AI-Research-SKILLs/blob/773a52944ba4747a18bd4ae9ade53fff041adcbc/LICENSE)

```text
MIT License

Copyright (c) 2025 Claude AI Research Skills Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### neuromechanist/research-skills

[原文](https://github.com/neuromechanist/research-skills/blob/f0219bde233abb44d8a0c5d73f41ea27073e1493/LICENSE)

```text
BSD 3-Clause License

Copyright (c) 2026, Seyed (Yahya) Shirazi

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

### ShaishavMaisuria/research-paper-lifecycle-skills

[原文](https://github.com/ShaishavMaisuria/research-paper-lifecycle-skills/blob/f9a0ed8f0f1770fb0321c5b022d55ed34c939927/LICENSE)

```text
Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction, and
distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by the
copyright owner that is granting the License.

"Legal Entity" shall mean the union of the acting entity and all other
entities that control, are controlled by, or are under common control with
that entity. For the purposes of this definition, "control" means (i) the
power, direct or indirect, to cause the direction or management of such
entity, whether by contract or otherwise, or (ii) ownership of fifty percent
(50%) or more of the outstanding shares, or (iii) beneficial ownership of such
entity.

"You" (or "Your") shall mean an individual or Legal Entity exercising
permissions granted by this License.

"Source" form shall mean the preferred form for making modifications,
including but not limited to software source code, documentation source, and
configuration files.

"Object" form shall mean any form resulting from mechanical transformation or
translation of a Source form, including but not limited to compiled object
code, generated documentation, and conversions to other media types.

"Work" shall mean the work of authorship, whether in Source or Object form,
made available under the License, as indicated by a copyright notice that is
included in or attached to the work (an example is provided in the Appendix
below).

"Derivative Works" shall mean any work, whether in Source or Object form,
that is based on (or derived from) the Work and for which the editorial
revisions, annotations, elaborations, or other modifications represent, as a
whole, an original work of authorship. For the purposes of this License,
Derivative Works shall not include works that remain separable from, or merely
link (or bind by name) to the interfaces of, the Work and Derivative Works
thereof.

"Contribution" shall mean any work of authorship, including the original
version of the Work and any modifications or additions to that Work or
Derivative Works thereof, that is intentionally submitted to Licensor for
inclusion in the Work by the copyright owner or by an individual or Legal
Entity authorized to submit on behalf of the copyright owner. For the purposes
of this definition, "submitted" means any form of electronic, verbal, or
written communication sent to the Licensor or its representatives, including
but not limited to communication on electronic mailing lists, source code
control systems, and issue tracking systems that are managed by, or on behalf
of, the Licensor for the purpose of discussing and improving the Work, but
excluding communication that is conspicuously marked or otherwise designated
in writing by the copyright owner as "Not a Contribution."

"Contributor" shall mean Licensor and any individual or Legal Entity on
behalf of whom a Contribution has been received by Licensor and subsequently
incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of this
License, each Contributor hereby grants to You a perpetual, worldwide,
non-exclusive, no-charge, royalty-free, irrevocable copyright license to
reproduce, prepare Derivative Works of, publicly display, publicly perform,
sublicense, and distribute the Work and such Derivative Works in Source or
Object form.

3. Grant of Patent License. Subject to the terms and conditions of this
License, each Contributor hereby grants to You a perpetual, worldwide,
non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this
section) patent license to make, have made, use, offer to sell, sell, import,
and otherwise transfer the Work, where such license applies only to those
patent claims licensable by such Contributor that are necessarily infringed by
their Contribution(s) alone or by combination of their Contribution(s) with the
Work to which such Contribution(s) was submitted. If You institute patent
litigation against any entity (including a cross-claim or counterclaim in a
lawsuit) alleging that the Work or a Contribution incorporated within the Work
constitutes direct or contributory patent infringement, then any patent
licenses granted to You under this License for that Work shall terminate as of
the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the Work or
Derivative Works thereof in any medium, with or without modifications, and in
Source or Object form, provided that You meet the following conditions:

(a) You must give any other recipients of the Work or Derivative Works a copy
of this License; and

(b) You must cause any modified files to carry prominent notices stating that
You changed the files; and

(c) You must retain, in the Source form of any Derivative Works that You
distribute, all copyright, patent, trademark, and attribution notices from the
Source form of the Work, excluding those notices that do not pertain to any
part of the Derivative Works; and

(d) If the Work includes a "NOTICE" text file as part of its distribution, then
any Derivative Works that You distribute must include a readable copy of the
attribution notices contained within such NOTICE file, excluding those notices
that do not pertain to any part of the Derivative Works, in at least one of
the following places: within a NOTICE text file distributed as part of the
Derivative Works; within the Source form or documentation, if provided along
with the Derivative Works; or, within a display generated by the Derivative
Works, if and wherever such third-party notices normally appear. The contents
of the NOTICE file are for informational purposes only and do not modify the
License. You may add Your own attribution notices within Derivative Works that
You distribute, alongside or as an addendum to the NOTICE text from the Work,
provided that such additional attribution notices cannot be construed as
modifying the License.

You may add Your own copyright statement to Your modifications and may provide
additional or different license terms and conditions for use, reproduction, or
distribution of Your modifications, or for any such Derivative Works as a
whole, provided Your use, reproduction, and distribution of the Work otherwise
complies with the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise, any
Contribution intentionally submitted for inclusion in the Work by You to the
Licensor shall be under the terms and conditions of this License, without any
additional terms or conditions. Notwithstanding the above, nothing herein
shall supersede or modify the terms of any separate license agreement you may
have executed with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade names,
trademarks, service marks, or product names of the Licensor, except as required
for reasonable and customary use in describing the origin of the Work and
reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or agreed to in
writing, Licensor provides the Work (and each Contributor provides its
Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied, including, without limitation, any warranties
or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
PARTICULAR PURPOSE. You are solely responsible for determining the
appropriateness of using or redistributing the Work and assume any risks
associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory, whether in
tort (including negligence), contract, or otherwise, unless required by
applicable law (such as deliberate and grossly negligent acts) or agreed to in
writing, shall any Contributor be liable to You for damages, including any
direct, indirect, special, incidental, or consequential damages of any
character arising as a result of this License or out of the use or inability to
use the Work (including but not limited to damages for loss of goodwill, work
stoppage, computer failure or malfunction, or any and all other commercial
damages or losses), even if such Contributor has been advised of the
possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing the Work or
Derivative Works thereof, You may choose to offer, and charge a fee for,
acceptance of support, warranty, indemnity, or other liability obligations
and/or rights consistent with this License. However, in accepting such
obligations, You may act only on Your own behalf and on Your sole
responsibility, not on behalf of any other Contributor, and only if You agree
to indemnify, defend, and hold each Contributor harmless for any liability
incurred by, or claims asserted against, such Contributor by reason of your
accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

To apply the Apache License to your work, attach the following boilerplate
notice, with the fields enclosed by brackets "[]" replaced with your own
identifying information. (Don't include the brackets!) The text should be
enclosed in the appropriate comment syntax for the file format. We also
recommend that a file or class name and description of purpose be included on
the same "printed page" as the copyright notice for easier identification
within third-party archives.

   Copyright 2026 Shaishav Maisuria

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

### research-paper-lifecycle-skills — NOTICE

```text
research-paper-lifecycle-skills
Copyright 2026 Shaishav Maisuria

This product includes research-paper lifecycle agent skills originally
developed by Shaishav Maisuria.

If you redistribute this package or include substantial portions of these
skills in another repository, preserve this NOTICE file or include this
attribution notice in your redistributed source or documentation.
```
