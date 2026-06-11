# Reference: 全局辅助类与 SCSS Mixins

为了保持页面样式轻量，应当优先使用项目中全局注入的 SCSS Mixins 和全局原子 CSS 类，无需为简单的位置偏移动手编写新的 Class。

---

## 1. 全局注入的 SCSS Mixins
*注：这些 Mixins 已在 SCSS 预处理器中全局加载，在 `<style lang="scss">` 中可直接调用，**切勿手动引入 `@import` 文件**。*

### A. 弹性盒子排布 (Flexbox Utilities)
*   **水平垂直居中**：
    ```scss
    @include flex-center($direction: row);
    ```
*   **垂直居中，水平方向两端分布**：
    ```scss
    @include flex-between($direction: row);
    ```
*   **垂直居中，水平方向平均分布**：
    ```scss
    @include flex-around($direction: row);
    ```

### B. 文本溢出截断 (Text Truncation)
*   **单行文本省略号 (`...`)**：
    ```scss
    @include ellipsis-single;
    ```
*   **多行文本省略号 (指定行数，默认2行)**：
    ```scss
    @include ellipsis-multi($num: 2);
    ```

### C. 字体与行高自适应 (Adaptive Font Layout)
使用 `font-size` 混合宏以确保在调整字号时，行高 (line-height) 能够成比例自适应对齐：
*   `@include font-size(12);` -> font-size: 12px, line-height: 20px
*   `@include font-size(13);` -> font-size: 13px, line-height: 22px
*   `@include font-size(14);` -> font-size: 14px, line-height: 22px
*   `@include font-size(16);` -> font-size: 16px, line-height: 24px
*   `@include font-size(18);` -> font-size: 18px, line-height: 26px
*   `@include font-size(20);` -> font-size: 20px, line-height: 28px

---

## 2. 全局原子 CSS 类 (`src/styles/global.scss`)
生成页面时，对于常见的间距和对齐，可以直接在 DOM 元素上加入以下 Class：

*   **布局辅助类**：
    *   `.g-flex-center`：快速令子元素居中的 Flex 容器。
    *   `.g-flex-column`：纵向 Flex 排布容器。
    *   `.g-flex-row`：横向 Flex 排布容器。
*   **外边距类 (Margin)**：
    *   `.g-mt10`、`.g-mt16`、`.g-mt20`（上外边距）
    *   `.g-mb10`、`.g-mb16`、`.g-mb20`（下外边距）
    *   `.g-ml10`、`.g-ml16`、`.g-mr10`（左右外边距）
*   **字体大小与颜色类**：
    *   `.g-fs14`（14px 字体）
    *   `.g-fc1`：字色对应 `var(--g1)`。
    *   `.g-fg3`：字色对应 `var(--g3)`。
    *   `.g-c1`：字色对应项目主色蓝 `var(--c1)`。
