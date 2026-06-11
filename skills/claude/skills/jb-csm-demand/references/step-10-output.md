# Step 10: 生成需求文档并写入飞书

## 策略

完成信息完整性检查后，执行两件事：
1. 生成 Markdown 需求文档（输出代码块，供 CSM 复制）
2. 将结构化数据写入飞书多维表格（`IFusbLuzuaCLkRsMs4NcgoEznYg`）

## 10.1 生成 Markdown 文档

基于 [templates/demand-document.md](templates/demand-document.md) 模板填充：

- `author` — 当前系统用户名（自动获取）
- `createdAt` — 当前时间（自动生成）
- `CSM-{YYYYMMDD}-{HHMM}` — 临时需求编号，由日期+时间组成，确保唯一性
- 其余变量根据对话收集的信息填充

## 10.1.5 重复需求检测（创建记录前自动执行）

在写入新记录前，自动搜索该客户的历史需求，检测是否已有相似需求提报。

### 检测步骤

**Step 0a: 搜索该客户的历史需求**

```bash
lark-cli base +record-search \
  --as user \
  --base-token IFusbLuzuaCLkRsMs4NcgoEznYg \
  --table-id tblBkEB9HZTZMvUN \
  --json '{"keyword":"<客户名称>","search_fields":["客户名称"],"page_size":50}'
```

**返回处理：**
- 获取该客户的所有历史需求记录（最多 50 条）
- 提取每条记录的：`record_id`、`需求编号`、`需求描述`

**Step 0b: 关键词重叠检测**

对当前需求的场景描述提取关键词（去除停用词），与历史需求的场景/描述进行比对：

| 判定条件 | 结果 |
|----------|------|
| 同一客户 + 场景关键词有重叠 | **重复** → 记录关联 |
| 同一客户 + 场景关键词无重叠 | 不重复 → 正常创建 |
| 该客户无历史需求 | 不重复 → 正常创建 |

**关键词提取规则：**
- 提取名词、动词短语（如"批量导出"、"自动对账"、"报销审批"）
- 去除停用词（的、了、在、是、有等）
- 核心功能词重叠 ≥1 个即判定为重复

**Step 0c: 记录关联需求**

如果检测到重复，记录所有匹配的历史需求：
- `related_records`: `["rec_xxx", "rec_yyy", ...]` — 用于写入 Base link 字段

---

## 10.2 写入飞书多维表格

### 字段映射表

| Base 字段 | 字段 ID | 类型 | 写入值 | 规则 |
|-----------|---------|------|--------|------|
| 需求名称 | `fldSJQfqQD` | text | `D{编号}-{客户简称}-{一句话概括}` | 获取 Base 自动编号后更新 |
| 需求描述 | `fldtVZC0eC` | text | 场景+痛点+期望方案拼接 | 结构化文本 |
| 需求分类 | `fldboFiGvi` | select | 映射值 | 新功能→新功能 / 优化→功能优化 / Bug→产品缺陷 / 数据需求→功能优化 |
| 来源 | `fldJcmAab4` | select | **客户反馈** | 固定值 |
| 需求提出人 | `fldeFXWrBP` | user | 留空（系统自动填入当前用户） | 默认值 `current_user` |
| 客户名称 | `fldWFlVBDa` | link | 客户表 record_id 或留空 | Step 2.6 确认结果 |
| 优先级 | `fldwTDl17p` | select | 映射值 | P0→紧急-P0 / P1→高-P1 / P2→中-P2 / P3→低-P3 |
| 规模 | `fldawGtvi8` | number | Story Points | 1/2/3/5/8 |
| 标签池 | `fldNttfRou` | select | 映射值 | 紧急→紧急需求 / 阻断+影响续费→承诺需求 / 其他→常规需求 |
| 需求状态 | `fldIB8WtLB` | select | **待评审** | 固定值 |
| 一级功能模块 | `fldzRvnyt2` | select | Step 5.7 确认结果 | 可选 |
| 二级功能模块 | `fld882mnp9` | select | Step 5.7 确认结果 | 可选 |
| 项目 | `fldZEJiXbc` | select | **经贝管家** | 固定值 |
| 关联需求 | `fld2Za1VlD` | link（关联到同表） | `[{"id":"rec_xxx"}, {"id":"rec_yyy"}]` | Step 10.1.5 重复检测命中时写入关联记录的 record_id 列表 |
| 备注 | `fldTGHqYCS` | text | 客户原话 + 补充信息 + 重复提示 | 拼接 |
| 来源备注 | `fldMBVKGCP` | text | 客户信息兜底 | 见下方规则 |
| 客户成功需求链接 | `fldISVEczw` | text | 飞书文档 URL | Step 10.3 自动创建并回填 |
| 附件 | `fldQ4Iwocj` | attachment | 上传的文件列表 | Step 5.8 收集，Step 10.2.4 上传，可选 |

**来源备注规则：**
- 如果客户名称成功关联 → `机构ID: xxx | 角色: xxx`
- 如果客户名称未关联 → `客户: xxx（未在客户表中找到）| 机构ID: xxx | 角色: xxx`

**备注规则（重复检测）：**
- 如果检测到重复需求 → 在备注末尾追加：`⚠️ 该客户已有相似需求提报，详见关联需求字段：{需求编号列表}`
- 如果未检测到重复 → 正常拼接客户原话 + 补充信息

**模块匹配规则（避免写入失败）：**

在写入「一级功能模块」「二级功能模块」前，必须先查询 Base 中的实际可选值，避免猜测的模块名称不存在导致写入失败：

```bash
# 查询一级/二级功能模块的可选值
lark-cli base +field-list \
  --as user \
  --base-token IFusbLuzuaCLkRsMs4NcgoEznYg \
  --table-id tblBkEB9HZTZMvUN
```

- 从返回结果中提取 `fldzRvnyt2(一级功能模块)` 和 `fld882mnp9(二级功能模块)` 的 `options` 列表
- 将 AI 猜测的模块名称与可选值做模糊匹配，选择最接近的
- 如果没有匹配的选项，**留空不写入**，并在「备注」中标注：`⚠️ 功能模块未匹配：AI猜测一级模块为「xxx」、二级模块为「yyy」，请产品部补充`

> 注意：二级功能模块是 `dynamic_options_source`，其选项依赖于一级功能模块的选择。如果一级模块留空或匹配错误，二级模块也可能写入失败。

**需求名称规则：**
- 格式：`D{Base自动编号}-{客户简称}-{AI提炼的一句话}`
- 客户简称提取：取客户名称前 8 个字符（含中英文），超过则截断。优先使用客户表中的简称，无简称则取全称前 8 字
- 示例：`D1216-测试科技-报销审批增加批量导出功能`

**临时编号规则（无法获取 Base 自动编号时）：**
- 格式：`CSM-{YYYYMMDD}-{HHMM}-{客户简称}-{一句话概括}`
- 示例：`CSM-20260528-1032-测试科技-报销审批增加批量导出功能`
- 禁止使用的占位符：`D待定`、`待补充`、`TBD` 等模糊表述

> **⚠️ 注意：** 需求名称依赖 Base 自动编号，因此需**先创建记录获取编号，再更新需求名称**。若获取失败，使用 `CSM-{日期}-{时间}` 临时编号，并在备注中标注需人工补充。

### 写入命令

**Step 1: 创建记录（不含需求名称和附件）**

```bash
lark-cli base +record-upsert \
  --as user \
  --base-token IFusbLuzuaCLkRsMs4NcgoEznYg \
  --table-id tblBkEB9HZTZMvUN \
  --json '{
    "需求描述": "xxx",
    "需求分类": "新功能",
    "来源": "客户反馈",
    "客户名称": [{"id":"rec_xxx"}],
    "优先级": "中 - P2",
    "规模": 3,
    "标签池": "常规需求",
    "需求状态": "待评审",
    "一级功能模块": "费控与预算",
    "二级功能模块": "费用报销",
    "项目": "经贝管家",
    "关联需求": [{"id":"rec_xxx"}, {"id":"rec_yyy"}],
    "备注": "客户原话: xxx\n\n补充: xxx\n\n⚠️ 该客户已有相似需求提报，详见「关联需求」字段",
    "来源备注": "机构ID: xxx | 角色: 财务总监"
  }'
```

**返回处理：**
- 成功 → 获取 `record_id`
- 失败 → 向 CSM 展示错误，不阻断 Markdown 文档输出

**Step 2: 查询获取需求编号**

Base 的「需求编号」是 `auto_number` 类型，创建记录时自动生成。由于 OpenAPI 搜索存在延迟，按以下策略获取：

**策略 A（首选）：通过来源备注关键词搜索**

```bash
lark-cli base +record-search \
  --as user \
  --base-token IFusbLuzuaCLkRsMs4NcgoEznYg \
  --table-id tblBkEB9HZTZMvUN \
  --json '{"keyword":"{来源备注中的关键词}","search_fields":["来源备注"],"page_size":10}'
```

> 来源备注包含客户名称/角色，具有唯一性，比 `_record_id` 更可靠。

**策略 B：通过需求描述关键词搜索**

```bash
lark-cli base +record-search \
  --as user \
  --base-token IFusbLuzuaCLkRsMs4NcgoEznYg \
  --table-id tblBkEB9HZTZMvUN \
  --json '{"keyword":"{需求描述中的关键词}","search_fields":["需求描述"],"page_size":10}'
```

**策略 C：兜底——无法获取编号时**

如果上述搜索均未返回结果：
- 使用 `CSM-{YYYYMMDD}-{HHMM}` 作为临时编号
- 在「备注」中追加：`⚠️ Base 自动编号获取失败，需人工补充正式需求编号`
- 需求名称格式：`CSM-{日期}-{时间}-{客户简称}-{一句话概括}`

**Step 3: 更新需求名称**

```bash
lark-cli base +record-upsert \
  --as user \
  --base-token IFusbLuzuaCLkRsMs4NcgoEznYg \
  --table-id tblBkEB9HZTZMvUN \
  --record-id <record_id> \
  --json '{
    "需求名称": "D1216-测试科技-报销审批增加批量导出功能"
  }'
```

### 附件上传（如有）

```bash
# Step 4: 上传附件（单条记录）
lark-cli base +record-upload-attachment \
  --as user \
  --base-token IFusbLuzuaCLkRsMs4NcgoEznYg \
  --table-id tblBkEB9HZTZMvUN \
  --record-id <record_id> \
  --field-id fldQ4Iwocj \
  --files "/path/to/screenshot1.png" "/path/to/screenshot2.jpg"
```

**约束：**
- 单次最多上传 100 个文件
- 附件上传独立于记录创建，创建记录成功后串行执行
- 上传失败不阻断流程，在备注中标注 "附件上传失败，请手动补充"

## 10.3 创建飞书文档并回填链接

Base 记录创建并更新需求名称后，将 Markdown 需求文档同步到飞书知识库「客户成功原始需求」下，并回填文档链接到 Base。

**命名规则（与 Base 需求名称一致）：**
```
D{Base自动编号}-{客户简称}-{一句话概括}
# 示例：D1216-测试科技-报销审批增加批量导出功能
```

**临时编号场景（无法获取 Base 自动编号时）：**
```
CSM-{YYYYMMDD}-{HHMM}-{客户简称}-{一句话概括}
# 示例：CSM-20260528-1032-测试科技-报销审批增加批量导出功能
```

> ⚠️ 飞书文档创建时，命名必须与 Base 需求名称完全一致。如果 Base 使用临时编号，文档也使用临时编号，后续获取正式编号后需**重新导入正确名称的文档**并删除旧文档（`drive files patch` 修改标题需要 `base:app:update` 权限，通常不具备）。

**目录规则：**

知识库「客户成功原始需求」下按 `YYYY-MM` 格式创建月份目录，每月的需求文档放入对应月份目录下：

```
客户成功原始需求
├── 2026-05
│   ├── D1216-测试科技-报销审批增加批量导出功能
│   ├── D1217-xxx-xxx
│   └── D1218-xxx-xxx
├── 2026-06
│   └── D1219-xxx-xxx
```

**执行步骤：**

```bash
# Step 5a: 创建 csm-demand 目录并将 Markdown 写入临时文件
mkdir -p csm-demand
node -e "require('fs').writeFileSync('csm-demand/demand_xxx.md', '（Markdown 内容）')"

# Step 5b: 导入为飞书文档到云空间
lark-cli drive +import --type docx \
  --as user \
  --file "csm-demand/demand_xxx.md" \
  --name "D1216-测试科技-报销审批增加批量导出功能"
```

**返回处理：**
- 成功 → 获取云空间文档 `obj_token`（如 `QHCdd1jFnooF63xsPGjcjJEunwc`）
- 失败 → 在备注中标注 "飞书文档创建失败，请手动创建"

```bash
# Step 5c: 检查并创建日期目录节点
# 列出「客户成功原始需求」下的子节点，查找当前日期的目录
lark-cli wiki +node-list \
  --as user \
  --space-id 7575074829334760661 \
  --parent-node-token CSNlwZML0i5AoFk7b9Sc4LMdnde \
  --format json
```

**返回处理：**
- 如果存在标题为 `YYYY-MM`（如 `2026-05`）的节点 → 记录其 `node_token` 作为 `month_folder_token`
- 如果不存在 → 创建月份目录节点：

```bash
lark-cli wiki +node-create \
  --as user \
  --parent-node-token CSNlwZML0i5AoFk7b9Sc4LMdnde \
  --obj-type docx \
  --title "2026-05"
```

**返回处理：**
- 成功 → 获取 `node_token` 作为 `date_folder_token`
- 失败 → 退化为直接移入「客户成功原始需求」根节点

```bash
# Step 5d: 将云空间文档移入月份目录
lark-cli wiki +move \
  --as user \
  --obj-token <obj_token> \
  --obj-type docx \
  --target-space-id 7575074829334760661 \
  --target-parent-token <month_folder_token>
```

**返回处理：**
- 成功 → 获取 wiki 文档 URL（如 `https://zhihuiguanjia.feishu.cn/wiki/XXXX`）
- 失败 → 使用云空间文档 URL 回填

```bash
# Step 5e: 更新 Base 记录的客户成功需求链接字段
lark-cli base +record-upsert \
  --as user \
  --base-token IFusbLuzuaCLkRsMs4NcgoEznYg \
  --table-id tblBkEB9HZTZMvUN \
  --record-id <record_id> \
  --json '{
    "客户成功需求链接": "https://zhihuiguanjia.feishu.cn/wiki/XXXX"
  }'
```

## 10.4 输出后操作

输出文档并完成 Base 写入后，根据完整度给出不同提示：

**完整度 ≥ 70 分（达标）+ Base 写入成功 + 文档创建成功：**
> ✅ 需求已生成并同步到飞书！
>
> - 信息完整度：{XX}/100%
> - 需求编号：{Base自动编号或临时编号}
> - 飞书记录：{record_id}
> - 飞书文档：[{编号}-{客户简称}-{概括}]({文档URL})
> {关联需求提示：⚠️ **检测到该客户已有相似需求**，已自动关联到「关联需求」字段}
> {临时编号提示：⚠️ **当前使用临时编号**，Base 正式编号生成后需人工更新需求名称和飞书文档标题}
>
> 你可以：
> 1. **再提一个需求** — 输入 `/jb-csm-demand`
> 2. **修改内容** — 告诉我哪里需要调整
> 3. **补充客户原话** — 直接发送原话内容，我会追加到记录
> 4. **上传附件** — 直接发送截图或文件
>
> Markdown 文档如下（供复制）：
> ```markdown
> ...
> ```

**完整度 ≥ 70 分（达标）+ Base 写入成功 + 文档创建失败：**
> ⚠️ 需求已写入飞书多维表格，但飞书文档创建失败（{错误原因}）。
>
> - 需求编号：{Base自动编号}
> - 飞书记录：{record_id}
> - 请手动将下方 Markdown 复制到知识库「客户成功原始需求」下创建文档
>
> ```markdown
> ...
> ```

**完整度 ≥ 70 分（达标）+ Base 写入失败：**
> ⚠️ 需求文档已生成，但写入飞书失败（{错误原因}）。
>
> 请手动复制下方 Markdown 文档粘贴到飞书需求池中。
>
> ```markdown
> ...
> ```

**完整度 60 ~ 69 分（合格）：**
> ⚠️ 需求文档已生成，信息完整度 {XX}/100%。已写入飞书，文档中标注了"信息待补充"。
>
> - 需求编号：{Base自动编号}
> - 飞书记录：{record_id}
> - 飞书文档：[D{编号}-{客户简称}-{概括}]({文档URL})
>
> ```markdown
> ...
> ```

**完整度 < 60 分（不合格）：**
> 已阻断，不会生成文档，也不会写入飞书。请补充信息后重新检查。
