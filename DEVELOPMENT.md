# Development Guide

## 1. 环境要求

- Node.js 20+
- npm 9+
- Python 3（用于本地静态服务器）

## 2. 常用命令

在仓库根目录执行：

```bash
npm run validate
npm run build:index
npm run build
npm run serve
```

命令说明：
- `npm run validate`：校验 `data/people/*.md` 格式与必填字段
- `npm run build:index`：根据 Markdown 自动生成 `data/people.json`
- `npm run build`：先校验再生成索引
- `npm run serve`：本地启动静态服务器（默认 `http://localhost:8000`）

## 3. 本地预览流程

```bash
npm run build
npm run serve
```

浏览器打开：`http://localhost:8000`

说明：不要直接双击 HTML 打开文件，否则浏览器可能拦截 `fetch`。

## 4. 新增人物条目

1. 在 `data/people/` 新建 `xxx.md`
2. 在 `data/avatars/` 添加头像文件（建议 `jpg/png/webp/svg`）
3. front matter 中 `avatar` 填写仓库内路径（例如 `data/avatars/xxx.jpg`）
4. 正文补充时间线、事实描述、证据链接
5. 运行 `npm run build` 更新 `data/people.json`

推荐模板：

```md
---
name: 姓名
alias: 别名
organization: 机构
avatar: data/avatars/zhang-san.jpg
tags: [标签1, 标签2]
updated: 2026-03-07
---

## 概述

人物简介（可核查事实）。

## 关键时间线

1. 2024-08：事件 A。
2. 2025-12：事件 B。

## 证据与来源

1. [来源标题](https://example.com)
```

## 5. 当前校验规则

`npm run validate` 会检查：
- 必须有 front matter（`---` 块）
- 必填字段：`name`、`organization`、`avatar`、`updated`、`tags`
- `avatar` 必须位于 `data/avatars/` 且文件存在
- `updated` 必须是 `YYYY-MM-DD`
- 正文不能为空
- 必须包含 `## 证据与来源`
- 至少包含一个 `http/https` 来源链接

## 6. GitHub Actions 与 Pages

当前发布机制：
- push 到 `main` 后触发工作流
- 自动执行：`npm run validate` -> `npm run build:index`
- 构建后的静态文件自动推送到 `gh-page` 分支

GitHub Pages 配置：
1. `Settings -> Pages`
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `gh-page`，目录选择 `/ (root)`

## 7. 正确的贡献流程（Issue 与 PR）

仓库已提供两类 Issue Form（已关闭空白 issue）：
- `新增人物档案`
- `修改已有档案`

但请注意：
- Issue 只用于收集线索和修改建议，不会自动改动仓库文件。
- Issue 里上传的图片附件会托管在 GitHub 外链，不会自动写入仓库目录。
- 最终要上线到站点，必须有 PR 把文件改动合并进 `main`。

推荐流程：
1. 先提 Issue 说明内容（可附来源链接和截图）
2. 再提 PR 提交实际文件：`data/people/*.md`、`data/avatars/*` 等
3. 维护者 review 并合并 PR

入口：
- Issue：<https://github.com/evilwisdom2025/Archive-of-Chinese-Traitors/issues/new/choose>
- PR：<https://github.com/evilwisdom2025/Archive-of-Chinese-Traitors/compare>
