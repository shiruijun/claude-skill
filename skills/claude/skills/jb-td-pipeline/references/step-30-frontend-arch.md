# Step 3a: 前端架构设计（串行）

## 检查

如果 `phases.frontendArch == true` 且 `design/frontend/architecture.md` 存在：

AskUserQuestion：
> `design/frontend/architecture.md` 已存在，复用还是重新执行？
> - **A)** 复用
> - **B)** 重新执行

## 执行

调用 `architect` agent：

```
Agent({
  subagent_type: "architect",
  prompt: "基于以下 PRD、后端设计和项目规范，进行前端架构设计：\n\nPRD：\n{prd.md 全文}\n\n后端 API：\n{design/backend/api.md 全文}\n\n代码现状摘要（由 CodeGraph 预分析产出）：\n{design/codegraph-summary.md 全文}\n\n项目前端规范：\n- jingbei-h5：Vue 3 + Vite + TypeScript + Vant 4 + Pinia\n- xiaogj-youli-platform-web：Vue 2.7 + Vite + Element UI + Vuex\n- xiaogj-youli-manage-frontend：Vue 3 + Vite + TypeScript + Ant Design Vue\n- xiaogj-youli-inventory-frontend：Vue 3 + Vite + TypeScript + Less + Arco Design Vue\n\n组件规范：\n- Vue 3：`<script lang=\"ts\" setup>` + `defineProps` + `defineEmits` + `v-bind=\"$attrs\"`\n- Vue 2：`defineComponent` + Options API + `v-bind=\"$attrs\"` + `v-on=\"$listeners\"`\n- 组件文件：PascalCase.vue\n- 工具文件：camelCase.ts\n- Store：camelCase.ts（Pinia）/ camelCase.js（Vuex）\n\n目录规范：\n- jingbei-h5：main/components/、main/pages/、main/api/、main/store/、tool/\n- platform-web：components/、pages/、store/\n\n只产出 architecture.md，包含页面结构、路由设计、状态管理、组件拆分。不产出 components 和 api-integration 细节。"
})
```

## 产出

使用 [templates/frontend-architecture.md](templates/frontend-architecture.md) 模板，写入 `$BASE_DIR/design/frontend/architecture.md`。

## 确认

Read 工具读取 `design/frontend/architecture.md`，AskUserQuestion：
> 前端架构设计确认？
> - **A)** 确认，进入前端详细设计
> - **B)** 需要修改
> - **C)** 重新执行

确认后更新 `phases.frontendArch = true`。