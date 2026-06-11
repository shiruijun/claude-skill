# Step 8: 发布上线（/ship + /land-and-deploy + /canary）

## 8.1 检查是否已完成

如果 `phases.ship == true` 且 `phases.deploy == true`：

AskUserQuestion：
> 已发布部署，是否重新执行？
> - A) 跳过，进入文档更新
> - B) 重新发布

## 8.2 执行 /ship

```
Skill({
  skill: "ship",
  args: "运行测试、审查、推送、开启 PR。Workspace-aware 版本队列。"
})
```

## 8.3 执行 /land-and-deploy

```
Skill({
  skill: "land-and-deploy",
  args: "合并 PR，等待 CI 和部署，验证生产环境健康。"
})
```

## 8.4 执行 /canary（金丝雀监控）

部署后监控：
```
Skill({
  skill: "canary",
  args: "对生产环境进行部署后监控循环。"
})
```

## 8.5 产出 deploy-report.md

使用 [templates/deploy-report.md](templates/deploy-report.md) 模板，写入 `$BASE_DIR/deploy-report.md`。

## 8.6 人工确认

发布后更新 `phases.ship = true`，`phases.deploy = true`。