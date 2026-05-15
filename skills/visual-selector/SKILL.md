---
name: visual-selector
description: 页面元素选择 — 构建 HTML 页面时需要选择、检查或定位特定元素进行修改。激活一个浮动选择器工具，支持可视化元素检查和 CSS/XPath 生成。
---

# Visual Selector（页面元素选择器）

## 概述

向任意 HTML 页面注入一个浮动的可视化选择按钮。激活后，鼠标悬停时会高亮元素，点击可捕获选中元素的 CSS 选择器路径、XPath、标签名、类名和 ID —— 实现精准的元素定位以便进行修改。

## 使用方法

### 快速引入

将以下代码添加到 HTML 的 `</body>` 之前：

```html
<script>
(function(){var s,a,t,o,u,n,e,i,l,f,d;function h(e){e.id===d||!e.className||"string"!=typeof e.className||!e.className.trim()||(a=e.className.trim().split(/\s+/).filter(function(n){return!n.startsWith("cc-")}),a.length>0&&(s+=a.slice(0,3).join(".")))}function c(e){if(!e.parentElement)return 1;var n=1,t=e.previousElementSibling;for(;t;)t.tagName===e.tagName&&n++,t=t.previousElementSibling;return n}function p(e){var n=[];for(;e&&e!==document.body;){var t=e.tagName.toLowerCase();e.id?(t="#"+e.id,n.unshift(t),h(e)):"";var r=e.parentElement;if(r){var o=Array.from(r.children).filter(function(n){return n.tagName===e.tagName});o.length>1&&(t+=":nth-child("+c(e)+")")}n.unshift(t),e=r}return n.join(" > ")}function g(e){var n=[];for(;e&&e!==document.body;){var t=1,r=e.previousElementSibling;for(;r;)r.tagName===e.tagName&&t++,r=r.previousElementSibling;n.unshift(e.tagName.toLowerCase()+"["+t+"]"),e=e.parentElement}return"/html/"+n.join("/")}function m(e){if(i||(i=document.createElement("div"),i.id="cc-hl",i.style.cssText="position:fixed;pointer-events:none;z-index:2147483646;border:2px dashed #2563eb;background:rgba(37,99,235,0.1);transition:all 0.1s;display:none;",document.body.appendChild(i)),!e)return void(i.style.display="none");var n=e.getBoundingClientRect();i.style.display="block",i.style.left=n.left+window.scrollX+"px",i.style.top=n.top+window.scrollY+"px",i.style.width=n.width+"px",i.style.height=n.height+"px"}function v(e){o||(o=document.createElement("div"),o.id="cc-panel",o.style.cssText="position:fixed;top:70px;right:20px;width:320px;max-height:60vh;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:2147483647;font-family:system-ui,sans-serif;font-size:13px;overflow:hidden;display:none;",o.innerHTML='<div style="padding:14px 16px;background:#2563eb;color:#fff;font-weight:600;display:flex;align-items:center;justify-content:space-between;"><span>🎯 元素选择器</span><button id="cc-close" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:0;line-height:1;">×</button></div><div style="padding:12px 16px;max-height:calc(60vh - 50px);overflow-y:auto;"><p style="color:#64748b;margin:0 0 12px;">点击任意元素进行选择。ClaudeCode 会读取你的选择并直接修改。</p><div id="cc-info" style="display:none;"><div style="font-weight:500;margin-bottom:8px;">已选中：</div><div id="cc-path" style="background:#f5f7fa;padding:8px 10px;border-radius:6px;margin-bottom:8px;word-break:break-all;font-size:12px;"></div><div id="cc-tag" style="color:#64748b;margin-bottom:4px;"></div><div id="cc-classes" style="color:#64748b;margin-bottom:4px;font-size:12px;"></div><div id="cc-id" style="color:#64748b;margin-bottom:8px;font-size:12px;"></div><button id="cc-copy" style="width:100%;padding:8px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">复制选择器</button></div></div>',document.body.appendChild(o),document.getElementById("cc-close").onclick=function(){o.style.display="none"})}function b(e){v(),o.style.display="block";var n=p(e),t=g(e),r=e.tagName.toLowerCase(),i=e.className&&"string"==typeof e.className?e.className.trim().split(/\s+/).filter(function(n){return!n.startsWith("cc-")}):[];document.getElementById("cc-info").style.display="block",document.getElementById("cc-path").textContent=n,document.getElementById("cc-tag").textContent="Tag: <"+r+">",document.getElementById("cc-classes").textContent="Classes: "+(i.length>0?"."+i.join(" ."):"none"),document.getElementById("cc-id").textContent="ID: "+(e.id||"none"),document.getElementById("cc-copy").onclick=function(){navigator.clipboard.writeText(n),this.textContent="Copied!",setTimeout(function(){document.getElementById("cc-copy").textContent="Copy Selector"},1500)},window.__ccSelector={element:e,cssPath:n,xpath:t,tagName:r,classes:i,id:e.id}}function w(){i&&(i.style.display="none"),o&&(o.style.display="none")}function k(){var e=document.createElement("button");e.id="cc-btn",e.textContent="🎯",e.title="Visual Selector",e.style.cssText="position:fixed;bottom:20px;right:20px;width:48px;height:48px;border-radius:50%;background:#2563eb;color:#fff;font-size:20px;border:none;box-shadow:0 4px 16px rgba(37,99,235,0.4);cursor:pointer;z-index:2147483645;transition:transform 0.2s;",e.onmouseenter=function(){this.style.transform="scale(1.1)"},e.onmouseleave=function(){this.style.transform="scale(1)"},e.onclick=function(){n=!n,e.style.background=n?"#1d4ed8":"#2563eb",e.style.boxShadow=n?"0 4px 20px rgba(37,99,235,0.6)":"0 4px 16px rgba(37,99,235,0.4)",e.title=n?"Exit selector mode":"Visual Selector",n||w()},document.body.appendChild(e)}var n=!1,s="",i=null,o=null;a="",k(),v();var y;document.addEventListener("mouseover",function(e){n&&e.target.id!=="cc-btn"&&e.target.id!=="cc-panel"&&(!o||!o.contains(e.target))&&e.target.id!=="cc-hl"&&(y=e.target,m(y))},!0),document.addEventListener("click",function(e){if(!n)return;if(e.target.id==="cc-btn"||e.target.id==="cc-panel"||o&&o.contains(e.target))return;e.stopPropagation(),y=e.target,m(y),b(y),t&&clearTimeout(t),t=setTimeout(function(){},2e3)},!0),document.addEventListener("mousemove",function(e){if(!n)return;n&&e.target!==y&&e.target.id!=="cc-btn"&&e.target.id!=="cc-panel"&&(!o||!o.contains(e.target))&&(y=e.target,m(y))},!0),window.__ccGetSelected=function(){return window.__ccSelector||null};var t;
</script>
```

### 备选版本（含注释，可自定义）

```html
<script>
(function() {
  var selectorActive = false;
  var hoveredEl = null;
  var selectedEl = null;
  var selectorPanel = null;
  var highlightLayer = null;

  function createHighlightLayer() {
    if (highlightLayer) return;
    highlightLayer = document.createElement('div');
    highlightLayer.id = 'cc-selector-highlight';
    highlightLayer.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px dashed #2563eb;background:rgba(37,99,235,0.1);transition:all 0.1s;display:none;';
    document.body.appendChild(highlightLayer);
  }

  function createPanel() {
    if (selectorPanel) return;
    selectorPanel = document.createElement('div');
    selectorPanel.id = 'cc-selector-panel';
    selectorPanel.style.cssText = 'position:fixed;top:70px;right:20px;width:320px;max-height:60vh;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:2147483647;font-family:system-ui,sans-serif;font-size:13px;overflow:hidden;display:none;';
    selectorPanel.innerHTML = `
      <div style="padding:14px 16px;background:#2563eb;color:#fff;font-weight:600;display:flex;align-items:center;justify-content:space-between;">
        <span>🎯 元素选择器</span>
        <button id="cc-panel-close" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:0;line-height:1;">×</button>
      </div>
      <div id="cc-panel-body" style="padding:12px 16px;max-height:calc(60vh - 50px);overflow-y:auto;">
        <p style="color:#64748b;margin:0 0 12px;">点击任意元素进行选择。ClaudeCode 会读取你的选择并直接修改。</p>
        <div id="cc-selected-info" style="display:none;">
          <div style="font-weight:500;margin-bottom:8px;color:#1a1f26;">已选中：</div>
          <div id="cc-selector-path" style="background:#f5f7fa;padding:8px 10px;border-radius:6px;margin-bottom:8px;word-break:break-all;font-size:12px;"></div>
          <div id="cc-selector-tag" style="color:#64748b;margin-bottom:4px;"></div>
          <div id="cc-selector-classes" style="color:#64748b;margin-bottom:4px;font-size:12px;"></div>
          <div id="cc-selector-id" style="color:#64748b;margin-bottom:8px;font-size:12px;"></div>
          <button id="cc-copy-selector" style="width:100%;padding:8px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">复制选择器</button>
        </div>
      </div>
    `;
    document.body.appendChild(selectorPanel);
    document.getElementById('cc-panel-close').onclick = function() { selectorPanel.style.display = 'none'; };
  }

  function getCssPath(el) {
    if (el.id) return '#' + el.id;
    if (el === document.body) return 'body';
    var path = [];
    while (el && el !== document.body) {
      var selector = el.tagName.toLowerCase();
      if (el.id) {
        selector = '#' + el.id;
        path.unshift(selector);
        break;
      }
      if (el.className && typeof el.className === 'string' && el.className.trim()) {
        var classes = el.className.trim().split(/\s+/).filter(function(c) { return c && !c.startsWith('cc-'); });
        if (classes.length > 0) {
          selector += '.' + classes.slice(0, 3).join('.');
        }
      }
      var parent = el.parentElement;
      if (parent) {
        var siblings = Array.from(parent.children).filter(function(s) { return s.tagName === el.tagName; });
        if (siblings.length > 1) {
          var idx = siblings.indexOf(el) + 1;
          selector += ':nth-child(' + idx + ')';
        }
      }
      path.unshift(selector);
      el = parent;
    }
    return path.join(' > ');
  }

  function getXPath(el) {
    if (el.id) return '//*[@id="' + el.id + '"]';
    if (el === document.body) return '/body';
    var path = [];
    while (el && el !== document.body) {
      var idx = 1;
      var sibling = el.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === el.tagName) idx++;
        sibling = sibling.previousElementSibling;
      }
      path.unshift(el.tagName.toLowerCase() + '[' + idx + ']');
      el = el.parentElement;
    }
    return '/html/' + path.join('/');
  }

  function highlightElement(el) {
    if (!highlightLayer) createHighlightLayer();
    var rect = el.getBoundingClientRect();
    highlightLayer.style.display = 'block';
    highlightLayer.style.left = (rect.left + window.scrollX) + 'px';
    highlightLayer.style.top = (rect.top + window.scrollY) + 'px';
    highlightLayer.style.width = rect.width + 'px';
    highlightLayer.style.height = rect.height + 'px';
  }

  function showPanel(el) {
    if (!selectorPanel) createPanel();
    selectorPanel.style.display = 'block';
    var cssPath = getCssPath(el);
    var xpath = getXPath(el);
    var tagName = el.tagName.toLowerCase();
    var classes = el.className && typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(function(c) { return c && !c.startsWith('cc-'); }) : [];
    document.getElementById('cc-selected-info').style.display = 'block';
    document.getElementById('cc-selector-path').textContent = cssPath;
    document.getElementById('cc-selector-tag').textContent = '标签: <' + tagName + '>';
    document.getElementById('cc-selector-classes').textContent = '类名: ' + (classes.length > 0 ? '.' + classes.join(' .') : '无');
    document.getElementById('cc-selector-id').textContent = 'ID: ' + (el.id || '无');
    document.getElementById('cc-copy-selector').onclick = function() {
      navigator.clipboard.writeText(cssPath);
      this.textContent = '已复制!';
      setTimeout(function() { document.getElementById('cc-copy-selector').textContent = '复制选择器'; }, 1500);
    };
    window.__ccSelector = { element: el, cssPath: cssPath, xpath: xpath, tagName: tagName, classes: classes, id: el.id };
  }

  function hidePanel() {
    if (selectorPanel) selectorPanel.style.display = 'none';
  }

  function createButton() {
    var btn = document.createElement('button');
    btn.id = 'cc-selector-btn';
    btn.textContent = '🎯';
    btn.title = '元素选择器';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:48px;height:48px;border-radius:50%;background:#2563eb;color:#fff;font-size:20px;border:none;box-shadow:0 4px 16px rgba(37,99,235,0.4);cursor:pointer;z-index:2147483645;transition:transform 0.2s;';
    btn.onmouseenter = function() { this.style.transform = 'scale(1.1)'; };
    btn.onmouseleave = function() { this.style.transform = 'scale(1)'; };
    btn.onclick = function() {
      selectorActive = !selectorActive;
      btn.style.background = selectorActive ? '#1d4ed8' : '#2563eb';
      btn.style.boxShadow = selectorActive ? '0 4px 20px rgba(37,99,235,0.6)' : '0 4px 16px rgba(37,99,235,0.4)';
      btn.title = selectorActive ? '退出选择模式' : '元素选择器';
      if (!selectorActive) { hideHighlight(); hidePanel(); }
    };
    document.body.appendChild(btn);
  }

  function hideHighlight() {
    if (highlightLayer) highlightLayer.style.display = 'none';
  }

  var btn;
  createHighlightLayer();
  createPanel();
  createButton();
  btn = document.getElementById('cc-selector-btn');

  document.addEventListener('mouseover', function(e) {
    if (!selectorActive) return;
    if (e.target === btn || e.target === selectorPanel || selectorPanel && selectorPanel.contains(e.target) || e.target === highlightLayer) return;
    hoveredEl = e.target;
    highlightElement(hoveredEl);
  }, true);

  document.addEventListener('click', function(e) {
    if (!selectorActive) return;
    if (e.target === btn || e.target === selectorPanel || selectorPanel && selectorPanel.contains(e.target)) return;
    e.stopPropagation();
    selectedEl = e.target;
    highlightElement(selectedEl);
    showPanel(selectedEl);
  }, true);

  document.addEventListener('mousemove', function(e) {
    if (!selectorActive) return;
    if (e.target !== hoveredEl && e.target !== highlightLayer) {
      hoveredEl = e.target;
      if (hoveredEl !== btn && (!selectorPanel || !selectorPanel.contains(hoveredEl))) {
        highlightElement(hoveredEl);
      }
    }
  }, true);

  window.__ccGetSelected = function() {
    return window.__ccSelector || null;
  };
})();
</script>
```

## 功能特点

| 功能 | 说明 |
|---------|-------------|
| **浮动按钮** | 蓝色圆形按钮，固定在右下角（距边缘 20px） |
| **选择模式** | 点击按钮切换。激活状态：深蓝色 + 更强的阴影 |
| **悬停高亮** | 虚线蓝色边框 + 半透明背景，跟随鼠标 |
| **点击选中** | 捕获元素并显示信息面板 |
| **CSS 选择器** | 生成路径，如 `#id > div.class:nth-child(2)` |
| **XPath** | 生成绝对 XPath 作为备选定位方式 |
| **复制按钮** | 一键复制 CSS 选择器到剪贴板 |
| **全局访问** | `window.__ccSelector` 存储最近选中元素的数据 |

## 全局 API

选中元素后，通过以下方式访问：

```javascript
window.__ccGetSelected()
// 返回: { element, cssPath, xpath, tagName, classes, id }
```

## 自定义项

| 元素 | 修改方式 |
|---------|----------------|
| 按钮位置 | 修改 `bottom:20px;right:20px` |
| 按钮颜色 | 修改 `#2563eb`（激活时：`#1d4ed8`） |
| 高亮样式 | 修改 highlightLayer 中的 `border` 和 `background` |
| 面板位置 | 修改 selectorPanel 中的 `top:70px;right:20px` |