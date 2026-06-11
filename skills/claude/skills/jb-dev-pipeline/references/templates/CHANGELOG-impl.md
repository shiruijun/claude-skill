---
ticket: {ticketId}
---

# {ticketId} 实现变更记录

## 后端变更

| 文件 | 类型 | 说明 | Commit |
|------|------|------|--------|
| WarehouseExportModel.java | 新增 | Excel 导出模型 | a1b2c3d |
| ExportTypeEnum.java | 修改 | 新增 WAREHOUSE 枚举值 | e4f5g6h |
| ExportController.java | 修改 | 新增 exportWarehouse / toWarehouseExport | i7j8k9l |
| ExportControllerTest.java | 新增 | 导出接口单元测试 | m0n1o2p |

## 前端变更

| 文件 | 类型 | 说明 | Commit |
|------|------|------|--------|
| Warehouse.vue | 修改 | 新增导出按钮和 handleExport | q3r4s5t |

## 测试变更

| 文件 | 类型 | 说明 |
|------|------|------|
| ExportControllerTest.java | 新增 | 3 个测试方法，覆盖率 85% |
