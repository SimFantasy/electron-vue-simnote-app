# 笔记应用产品开发文档

## 1. 产品概述

### 1.1 产品定位

一款基于 Electron + Vue + @nuxt/ui 的桌面笔记应用，采用类似 Notion 的富文本编辑体验，支持 Markdown 格式存储，具备 AI 辅助写作功能。

### 1.2 核心特性

- **混合存储**：SQLite 存储元数据和索引，Markdown 文件存储正文内容
- **富文本编辑**：基于 @nuxt/ui Editor 组件（TipTap），支持实时预览
- **AI 辅助**：集成 AI 功能支持续写、扩写、精简、翻译等
- **标签系统**：支持笔记标签，可按标签搜索
- **单工作区**：单一工作区模式，支持自定义存储位置
- **图片管理**：自动管理图片附件，支持清理无用图片

## 2. 技术架构

### 2.1 技术栈

| 层级      | 技术                               |
| --------- | ---------------------------------- |
| 框架      | Electron 39 + Vue 3.5 + TypeScript |
| 构建工具  | Electron Vite 5                    |
| UI 组件   | @nuxt/ui 4.40 + Tailwind CSS 4     |
| 编辑器    | @nuxt/ui Editor (TipTap)           |
| 数据库    | better-sqlite3                     |
| ORM/Query | knex                               |
| 配置存储  | electron-store                     |
| 状态管理  | Pinia                              |
| 国际化    | vue-i18n                           |
| 工具库    | @vueuse/core                       |

### 2.2 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      渲染进程 (Renderer)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   左侧栏     │  │   编辑器     │  │   右侧栏     │       │
│  │  目录树      │  │  UEditor     │  │  大纲视图    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                      Vue 3 + Pinia + i18n                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ IPC (预加载脚本)
                            │
┌─────────────────────────────────────────────────────────────┐
│                      主进程 (Main)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              窗口管理 (单窗口模式)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              IPC 处理器                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ storage  │  │ window   │  │ settings │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              服务层                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │ Storage      │  │ AI Proxy     │                 │  │
│  │  │ - SQLite     │  │              │                 │  │
│  │  │ - Files      │  │              │                 │  │
│  │  └──────────────┘  └──────────────┘                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 3. 项目结构

```
electron-vue-note-app/
├── src/
│   ├── main/                          # 主进程
│   │   ├── index.ts                  # 入口
│   │   ├── window.ts                 # 窗口管理（单窗口）
│   │   ├── tray.ts                   # 系统托盘
│   │   ├── ipc/                      # IPC处理器
│   │   │   ├── index.ts             # 统一注册
│   │   │   ├── storage.ts           # 存储相关IPC
│   │   │   ├── window.ts            # 窗口控制IPC
│   │   │   └── settings.ts          # 设置IPC
│   │   └── services/                 # 服务层
│   │       ├── storage/             # 存储服务
│   │       │   ├── index.ts         # 存储管理器
│   │       │   ├── database.ts      # SQLite操作
│   │       │   └── files.ts         # 文件系统操作
│   │       └── ai.ts                # AI服务代理
│   ├── preload/                       # 预加载脚本
│   │   ├── index.ts                 # 统一导出
│   │   ├── storage.ts               # 存储API
│   │   ├── window.ts                # 窗口API
│   │   └── settings.ts              # 设置API
│   ├── i18n/                          # 国际化（主进程/渲染进程共享）
│   │   ├── index.ts                 # i18n配置与导出
│   │   ├── locales/                 # 语言文件
│   │   │   ├── zh-CN.json           # 简体中文
│   │   │   └── en-US.json           # 英文（预留）
│   │   └── types.ts                 # 类型定义
│   ├── renderer/                      # 渲染进程
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.ts               # 入口
│   │       ├── App.vue               # 根组件
│   │       ├── layout/               # 布局组件
│   │       │   ├── AppLayout.vue    # 主布局
│   │       │   ├── TitleBar.vue     # 标题栏
│   │       │   ├── SidebarLeft.vue  # 左侧栏
│   │       │   ├── SidebarRight.vue # 右侧栏
│   │       │   └── StatusBar.vue    # 状态栏
│   │       ├── views/                # 页面视图
│   │       │   ├── EditorView.vue   # 编辑器页面
│   │       │   └── SettingsView.vue # 设置页面
│   │       ├── components/           # 业务组件
│   │       │   ├── tree/            # 目录树
│   │       │   ├── editor/          # 编辑器相关
│   │       │   └── settings/        # 设置相关
│   │       ├── services/             # 服务层
│   │       │   └── storage/         # 存储服务
│   │       │       ├── noteService.ts
│   │       │       ├── folderService.ts
│   │       │       └── searchService.ts
│   │       ├── composables/          # 组合式函数
│   │       ├── stores/               # Pinia状态
│   │       └── utils/                # 工具函数
│   └── shared/                        # 源代码内共享
│       ├── constants/               # 常量
│       │   ├── ipc.ts              # IPC通道名
│       │   └── app.ts              # 应用常量
│       └── types/                   # 类型定义
│           ├── ipc.ts              # IPC类型
│           ├── storage.ts          # 存储类型
│           └── note.ts             # 笔记类型
├── docs/                              # 文档
│   └── product.md                   # 产品文档（本文件）
├── resources/                         # 静态资源
└── electron.vite.config.ts
```

## 4. 存储方案

### 4.1 混合存储策略

#### 4.1.1 文件系统结构

```
📁 工作区目录/ (默认: ~/Documents/NoteApp，可配置)
├── 📄 notes.db                 # SQLite: 元数据、索引
├── 📁 content/                 # Markdown文件
│   ├── 📁 工作笔记/
│   │   ├── 📄 会议纪要.md      # 笔记正文
│   │   └── 📁 images/
│   │       ├── 会议纪要_截图1_1707830400000.png
│   │       └── 会议纪要_图表_1707830500000.jpg
│   └── 📁 个人/
│       ├── 📄 日记.md
│       └── 📁 images/
└── 📁 .meta/                   # 应用内部数据（隐藏）
    └── attachments_index.json  # 附件索引（可选）
```

#### 4.1.2 SQLite 数据库设计

**表结构：**

```typescript
// folders 表 - 文件夹/目录
interface Folder {
  id: string // UUID
  name: string // 显示名称
  parent_id: string | null // 父文件夹ID，null表示根
  path: string // 相对content的路径
  sort_order: number // 排序序号
  created_at: number // 创建时间戳
  updated_at: number // 更新时间戳
}

// notes 表 - 笔记元数据
interface Note {
  id: string // UUID
  title: string // 笔记标题
  folder_id: string // 所属文件夹ID
  content_path: string // Markdown文件相对路径
  content_plain: string // 纯文本内容（用于搜索）
  tags: string // JSON数组字符串，如["标签1","标签2"]
  is_favorite: boolean // 是否收藏
  is_deleted: boolean // 软删除标记
  sort_order: number // 排序序号
  created_at: number // 创建时间戳
  updated_at: number // 更新时间戳
  accessed_at: number // 最后访问时间戳
}

// note_links 表 - 双向链接关系
interface NoteLink {
  id: string // UUID
  source_note_id: string // 源笔记ID（引用者）
  target_note_id: string // 目标笔记ID（被引用者）
  created_at: number // 创建时间戳
}

// note_fts 虚拟表 - 全文搜索（FTS5）
// 自动同步 notes 表的 content_plain 和 tags 字段
```

**索引设计：**

- `folders(parent_id)` - 加速树形查询
- `notes(folder_id)` - 加速文件夹内笔记查询
- `notes(is_deleted)` - 加速回收站查询
- `notes(tags)` - 标签搜索（使用JSON提取）
- `note_fts` - 全文搜索虚拟表
- `note_links(source_note_id)` - 加速出链查询
- `note_links(target_note_id)` - 加速入链查询
- `note_links(source_note_id, target_note_id)` - 唯一索引，防止重复链接

**标签搜索实现：**

```sql
-- 按标签搜索笔记
SELECT * FROM notes
WHERE is_deleted = 0
AND EXISTS (
  SELECT 1 FROM json_each(notes.tags)
  WHERE json_each.value = '标签名'
);

-- 全文搜索（内容+标签）
SELECT n.* FROM notes n
JOIN note_fts fts ON n.id = fts.rowid
WHERE note_fts MATCH '搜索关键词'
AND n.is_deleted = 0;
```

#### 4.1.3 双向链接设计

**实现原理：**
使用 @nuxt/ui Editor 的 Mention 功能，通过输入 `[[` 或 `@` 触发笔记选择器，建立笔记间的引用关系。

**数据表设计：**

```typescript
// note_links 表 - 存储笔记间的链接关系
interface NoteLink {
  id: string // UUID
  source_note_id: string // 源笔记ID（引用者）
  target_note_id: string // 目标笔记ID（被引用者）
  created_at: number // 创建时间戳
}
```

**链接解析策略：**

```typescript
// 保存笔记时解析双向链接
async function parseNoteLinks(noteId: string, content: string): Promise<void> {
  // 1. 提取所有 mention 标记
  // TipTap mention 格式: <span data-type="mention" data-id="target-note-id"></span>
  const mentionRegex = /data-type="mention"\s+data-id="([^"]+)"/g
  const linkedNoteIds: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    linkedNoteIds.push(match[1])
  }

  // 2. 删除旧的链接关系
  await db('note_links').where('source_note_id', noteId).delete()

  // 3. 插入新的链接关系
  if (linkedNoteIds.length > 0) {
    const links = linkedNoteIds.map((targetId) => ({
      id: generateUUID(),
      source_note_id: noteId,
      target_note_id: targetId,
      created_at: Date.now()
    }))
    await db('note_links').insert(links)
  }
}
```

**查询接口：**

```typescript
// 获取笔记的出链（当前笔记引用了哪些笔记）
async function getOutgoingLinks(noteId: string): Promise<Note[]> {
  return db('notes')
    .join('note_links', 'notes.id', 'note_links.target_note_id')
    .where('note_links.source_note_id', noteId)
    .where('notes.is_deleted', 0)
    .select('notes.*')
}

// 获取笔记的入链（哪些笔记引用了当前笔记）
async function getIncomingLinks(noteId: string): Promise<Note[]> {
  return db('notes')
    .join('note_links', 'notes.id', 'note_links.source_note_id')
    .where('note_links.target_note_id', noteId)
    .where('notes.is_deleted', 0)
    .select('notes.*')
}

// 检查是否存在链接关系
async function hasLink(sourceId: string, targetId: string): Promise<boolean> {
  const count = await db('note_links')
    .where('source_note_id', sourceId)
    .where('target_note_id', targetId)
    .count('* as count')
    .first()
  return count.count > 0
}
```

**编辑器集成：**

```typescript
// 编辑器 mention 配置
const mentionItems = computed(() => {
  // 从所有笔记中生成 mention 列表
  return allNotes.value.map(note => ({
    id: note.id,
    label: note.title,
    // 可以添加其他元数据，如文件夹路径等
  }));
});

// Mention 渲染
<UEditorMentionMenu
  :editor="editor"
  :items="mentionItems"
  @select="handleMentionSelect"
/>

// 自定义 mention 节点渲染为双向链接样式
// 显示为 [[笔记标题]] 格式，带下划线或特殊颜色
```

**UI 展示：**

- **编辑器内**：mention 以 `[[笔记标题]]` 格式显示，带特殊样式（如下划线、颜色）
- **右侧面板**：新增「双向链接」区域，显示：
  - 入链（被引用）：列出引用当前笔记的笔记列表
  - 出链（引用）：列出当前笔记引用的笔记列表
- **点击跳转**：点击链接可直接跳转到对应笔记

### 4.2 文件操作规范

#### 4.2.1 笔记文件命名

- 使用用户输入的标题作为文件名
- 文件名格式：`{标题}.md`
- 文件路径：`content/{文件夹路径}/{标题}.md`

#### 4.2.2 重名处理策略

保存时检测到同名文件，提供用户选择：

1. **重命名**：用户输入新标题
2. **自动编号**：保存为 `标题(1).md`、`标题(2).md`
3. **覆盖**：直接覆盖已有文件（需确认）

#### 4.2.3 图片存储规则

- **存储位置**：`content/{文件夹路径}/images/`
- **命名格式**：`{笔记标题}_{原文件名}_{时间戳}.{ext}`
- **示例**：`会议纪要_截图1_1707830400000.png`
- **引用方式**：相对路径 `./images/会议纪要_截图1_1707830400000.png`
- **清理策略**：笔记删除时自动清理对应的 images 目录

### 4.3 数据一致性

#### 4.3.1 写入流程

```
1. 写入 Markdown 文件到磁盘
2. 提取纯文本内容
3. 解析标签（从内容中提取 #标签 格式）
4. 更新 SQLite 记录
5. 更新 FTS 索引
```

#### 4.3.2 异常处理

- 文件写入失败：回滚 SQLite 操作
- 数据库写入失败：保留文件，记录错误日志
- 启动时检查：对比文件系统和数据库，修复不一致

## 5. 功能模块

### 5.1 左侧面板 - 目录树

#### 5.1.1 功能

- 无限级文件夹嵌套
- 笔记只能存在于文件夹内，不能作为目录层级
- 文件夹/笔记的 CRUD 操作
- 右键菜单支持
- 拖拽排序
- 搜索过滤

#### 5.1.2 右键菜单

**笔记右键菜单：**

- 打开（默认）
- 重命名
- 复制
- 粘贴
- 克隆
- **收藏**
- 删除

**文件夹右键菜单：**

- 展开/折叠
- **新建笔记**
- **新建子文件夹**
- 重命名
- 复制
- 粘贴
- 删除

#### 5.1.3 数据结构

```typescript
interface TreeNode {
  id: string
  type: 'folder' | 'note'
  name: string
  children?: TreeNode[] // 仅 folder 有
  isExpanded?: boolean // 仅 folder 有
  isSelected: boolean
  isFavorite?: boolean // 仅 note 有
  tags?: string[] // 仅 note 有
  parentId: string | null
}
```

### 5.2 中间面板 - 编辑器

#### 5.2.1 编辑器特性

- 基于 @nuxt/ui UEditor 组件
- 支持 Markdown 格式
- 实时预览（类 Notion 体验）
- 自动保存（防抖 1 秒）
- 工具栏：固定工具栏 + 气泡工具栏

#### 5.2.2 双向链接（V1.0）

通过 @nuxt/ui Editor 的 Mention 功能实现：

- **触发方式**：输入 `[[` 或 `@` 唤起笔记选择器
- **链接格式**：显示为 `[[笔记标题]]`
- **实时解析**：保存时自动解析并存储链接关系到数据库
- **样式**：带下划线或特殊颜色标识

#### 5.2.3 AI 功能（V1.0）

通过编辑器内置 AI 菜单提供：

- **Continue**：续写
- **Extend**：扩写
- **Reduce**：精简
- **Summarize**：总结
- **Translate**：翻译
- **Fix**：修正拼写和语法

**AI 配置：**

- 用户自行配置 API Key
- 支持 OpenAI、Anthropic、自定义 API 等
- 配置存储在 electron-store

### 5.3 右侧面板 - 文档信息

#### 5.3.1 大纲视图

- 解析当前笔记的标题层级（H1-H6）
- 点击跳转对应位置
- 自动同步编辑器滚动位置

#### 5.3.2 双向链接（V1.0）

- **入链（被引用）**：显示引用当前笔记的笔记列表
- **出链（引用）**：显示当前笔记引用的笔记列表
- **快速跳转**：点击链接直接打开对应笔记
- **链接统计**：显示链接数量

### 5.4 设置面板

#### 5.4.1 存储方式

使用 **electron-store** 存储配置，不存 SQLite。

#### 5.4.2 设置项

**常规设置：**

- 主题：跟随系统 / 深色 / 浅色
- 语言：简体中文（V1 仅支持中文）
- 工作区位置：默认 ~/Documents/NoteApp，可更改

**窗口行为：**

- 最小化到托盘：开关
- 关闭到托盘：开关
- 跟随系统启动：开关
- 启动时最小化：开关

**编辑器设置：**

- 字体：结合 fontsource 选择
- 字号：12-24px
- 文档模式：页面（类似 Word）/ 无界
- 代码块行号：开关
- 悬浮菜单：开关
- 拖拽手柄：开关
- **双向链接**：开关（启用 `[[` 或 `@` 触发 mention）

**AI 配置：**

- Provider 选择：OpenAI / Anthropic / 自定义
- API Key：加密存储
- API Endpoint：自定义接口地址
- 模型选择

**快捷键：**

- 可配置的快捷键映射

## 6. 国际化（i18n）

### 6.1 设计思路

**问题：** 主进程（系统托盘菜单）和渲染进程（UI）都需要使用多语言

**方案：**

- i18n 目录放在 `src/` 下，与 `main`、`preload`、`renderer` 同级
- 使用 JSON 语言文件，便于主进程和渲染进程共享
- 主进程使用简单的 `t()` 函数获取文本
- 渲染进程使用 vue-i18n 插件

### 6.2 目录结构

```
src/i18n/
├── index.ts              # i18n配置与导出
├── locales/              # 语言文件（JSON格式，主进程/渲染进程共享）
│   ├── zh-CN.json       # 简体中文
│   └── en-US.json       # 英文（预留）
└── types.ts             # 类型定义
```

### 6.3 语言文件结构（JSON）

```json
// zh-CN.json
{
  "common": {
    "confirm": "确认",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "create": "新建",
    "search": "搜索",
    "setting": "设置"
  },
  "tray": {
    "showWindow": "显示笔记",
    "openSettings": "设置",
    "quit": "退出笔记"
  },
  "sidebar": {
    "newNote": "新建笔记",
    "newFolder": "新建文件夹",
    "rename": "重命名",
    "delete": "删除",
    "copy": "复制",
    "paste": "粘贴",
    "clone": "克隆",
    "favorite": "收藏",
    "unfavorite": "取消收藏"
  },
  "editor": {
    "placeholder": "开始写作...",
    "aiContinue": "续写",
    "aiExtend": "扩写",
    "aiReduce": "精简",
    "aiSummarize": "总结",
    "aiTranslate": "翻译",
    "aiFix": "修正语法"
  },
  "settings": {
    "general": "常规",
    "editor": "编辑器",
    "ai": "AI 配置",
    "shortcuts": "快捷键",
    "theme": "主题",
    "language": "语言",
    "workspace": "工作区位置"
  }
}
```

### 6.4 主进程使用方式

```typescript
// src/main/tray.ts
import { getCurrentLocale, t } from '../i18n'

// 创建托盘菜单
const trayMenu = Menu.buildFromTemplate([
  {
    label: t('tray.showWindow'), // "显示笔记"
    click: () => showMainWindow()
  },
  { type: 'separator' },
  {
    label: t('tray.openSettings'), // "设置"
    click: () => openSettings()
  },
  { type: 'separator' },
  {
    label: t('tray.quit'), // "退出笔记"
    click: () => quitApp()
  }
])

// 语言切换时更新菜单
ipcMain.on('language:changed', (event, locale: string) => {
  setCurrentLocale(locale)
  updateTrayMenu() // 重新创建托盘菜单
})
```

### 6.5 渲染进程使用方式

```typescript
// src/renderer/src/main.ts
import { createI18n } from 'vue-i18n'
import { getCurrentLocale, messages } from '../../i18n'

const i18n = createI18n({
  locale: getCurrentLocale(),
  messages
})

app.use(i18n)
```

```vue
<!-- 组件中使用 -->
<template>
  <button>{{ $t('common.save') }}</button>
  <span>{{ $t('sidebar.newNote') }}</span>
</template>
```

### 6.6 i18n 模块实现

```typescript
// src/i18n/index.ts
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { store } from '../main/services/store' // electron-store

// 当前语言
let currentLocale: string = store.get('settings.language', 'zh-CN')

// 加载语言文件
function loadLocale(locale: string): Record<string, any> {
  const localePath = path.join(__dirname, 'locales', `${locale}.json`)
  if (fs.existsSync(localePath)) {
    return JSON.parse(fs.readFileSync(localePath, 'utf-8'))
  }
  // 回退到默认语言
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'locales', 'zh-CN.json'), 'utf-8'))
}

// 所有语言包（用于 vue-i18n）
export const messages = {
  'zh-CN': loadLocale('zh-CN'),
  'en-US': loadLocale('en-US')
}

// 当前语言包（用于主进程）
let currentMessages = loadLocale(currentLocale)

// 获取当前语言
export function getCurrentLocale(): string {
  return currentLocale
}

// 设置当前语言
export function setCurrentLocale(locale: string): void {
  currentLocale = locale
  currentMessages = loadLocale(locale)
  store.set('settings.language', locale)
}

// 翻译函数（支持嵌套 key，如 'tray.showWindow'）
export function t(key: string): string {
  const keys = key.split('.')
  let value: any = currentMessages

  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) return key // 找不到返回 key
  }

  return typeof value === 'string' ? value : key
}
```

### 6.7 V2.0 扩展

- 支持简体中文、繁体中文、English
- 动态加载语言文件
- 语言切换实时生效（主进程菜单+渲染进程UI）

## 7. 窗口管理

### 7.1 窗口模式

- **单窗口应用**：无需多窗口支持
- 编辑器实时预览，无需预览窗口
- 窗口控制：最小化、最大化、关闭

### 7.2 窗口配置

```typescript
interface WindowConfig {
  width: number // 默认 1280
  height: number // 默认 800
  minWidth: number // 900
  minHeight: number // 600
  frame: false // 无边框，自定义标题栏
  resizable: true
}
```

### 7.3 系统托盘

#### 7.3.1 功能设计

- **托盘图标**：显示应用图标，支持自定义
- **左键点击**：显示/隐藏笔记主窗口
- **右键菜单**：
  - 显示笔记（打开主窗口）
  - 设置（打开设置页面）
  - 退出笔记（完全退出应用）

#### 7.3.2 托盘菜单

```typescript
// src/main/tray.ts
import { t } from '../i18n'

// 托盘右键菜单结构
interface TrayMenuItem {
  label: string // 菜单文本（支持 i18n）
  type?: 'normal' | 'separator' // 菜单项类型
  click?: () => void // 点击回调
}

// 菜单项（使用 i18n）
function createTrayMenu(): TrayMenuItem[] {
  return [
    { label: t('tray.showWindow'), click: () => showMainWindow() },
    { type: 'separator' },
    { label: t('tray.openSettings'), click: () => openSettings() },
    { type: 'separator' },
    { label: t('tray.quit'), click: () => quitApp() }
  ]
}
```

#### 7.3.3 IPC 路由控制

**设置页面跳转方案：**

方案 A：IPC 触发 + 路由跳转（推荐）

```typescript
// 主进程（main/tray.ts）
trayMenu.append(
  new MenuItem({
    label: '设置',
    click: () => {
      // 1. 显示主窗口
      showMainWindow()
      // 2. 发送 IPC 消息通知渲染进程打开设置
      mainWindow.webContents.send('navigate:to', '/settings')
    }
  })
)

// 渲染进程（renderer/src/main.ts）
ipcRenderer.on('navigate:to', (event, path) => {
  // 使用 vue-router 进行路由跳转
  router.push(path)
})
```

方案 B：IPC 触发 + 状态管理

```typescript
// 主进程
trayMenu.append(
  new MenuItem({
    label: '设置',
    click: () => {
      showMainWindow()
      mainWindow.webContents.send('settings:open')
    }
  })
)

// 渲染进程
ipcRenderer.on('settings:open', () => {
  // 通过 Pinia store 打开设置面板
  settingsStore.openSettings()
})
```

**推荐方案 A**，因为：

- 符合 SPA 路由跳转逻辑
- 可扩展性强，支持跳转到任意路由
- URL 可直接访问设置页面

#### 7.3.4 窗口行为与托盘联动

```typescript
// 设置项控制行为
interface TraySettings {
  minimizeToTray: boolean // 最小化到托盘（而非任务栏）
  closeToTray: boolean // 关闭到托盘（而非退出）
}

// 行为实现
// 1. 最小化到托盘
mainWindow.on('minimize', (event) => {
  if (settings.minimizeToTray) {
    event.preventDefault()
    mainWindow.hide() // 隐藏窗口，不显示在任务栏
  }
})

// 2. 关闭到托盘
mainWindow.on('close', (event) => {
  if (settings.closeToTray && !isQuitting) {
    event.preventDefault()
    mainWindow.hide() // 隐藏窗口，保持托盘运行
  }
})

// 3. 显示窗口
function showMainWindow() {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
  }
}
```

#### 7.3.5 IPC 接口

```typescript
// 托盘相关 IPC 通道
export const TRAY_CHANNELS = {
  SHOW_WINDOW: 'tray:show-window', // 显示主窗口
  HIDE_WINDOW: 'tray:hide-window', // 隐藏主窗口
  NAVIGATE_TO: 'navigate:to', // 路由跳转
  UPDATE_TOOLTIP: 'tray:update-tooltip' // 更新托盘提示文本
}
```

## 8. 开发规范

### 8.1 命名规范

- **文件命名**：kebab-case（如 `note-editor.vue`）
- **组件命名**：PascalCase（如 `NoteEditor.vue`）
- **变量/函数**：camelCase
- **常量**：UPPER_SNAKE_CASE
- **类型/接口**：PascalCase + 后缀（如 `NoteRepository`）

### 8.2 代码组织

- 每个模块独立目录
- 相关文件就近组织
- 共享类型放在 `src/shared/types`
- IPC 通道名统一在 `src/shared/constants/ipc.ts`

### 8.3 IPC 规范

```typescript
// src/shared/constants/ipc.ts
export const IPC_CHANNELS = {
  STORAGE: {
    CREATE_NOTE: 'storage:note:create',
    GET_NOTE: 'storage:note:get',
    SAVE_NOTE: 'storage:note:save',
    GET_TREE: 'storage:tree:get'
    // ...
  },
  WINDOW: {
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close'
  },
  TRAY: {
    SHOW_WINDOW: 'tray:show-window',
    HIDE_WINDOW: 'tray:hide-window',
    NAVIGATE_TO: 'navigate:to',
    UPDATE_TOOLTIP: 'tray:update-tooltip'
  },
  SETTINGS: {
    GET: 'settings:get',
    SET: 'settings:set'
  }
} as const
```

### 8.4 类型定义

```typescript
// 所有类型定义使用 .d.ts 或 interface
// 避免使用 any，启用 strict TypeScript
// 导出类型统一在 types/index.ts 聚合
```

## 9. MVP 功能清单

### 9.1 V1.0 MVP（核心功能）

#### 9.1.1 基础架构

- [ ] 项目初始化与配置
- [ ] electron-store 配置系统
- [ ] SQLite 数据库初始化与迁移
- [ ] IPC 通信框架
- [ ] i18n 国际化框架

#### 9.1.2 存储层

- [ ] 混合存储实现
- [ ] 文件夹 CRUD
- [ ] 笔记 CRUD
- [ ] **标签存储与搜索**
- [ ] **双向链接表设计与实现**
- [ ] 图片保存与引用
- [ ] 重名处理机制
- [ ] 图片自动清理

#### 9.1.3 左侧面板

- [ ] 目录树组件
- [ ] 无限级嵌套展示
- [ ] 文件夹/笔记右键菜单（含**收藏、新建笔记、新建子文件夹**）
- [ ] 新建、重命名、删除操作
- [ ] **标签搜索**
- [ ] 搜索过滤

#### 9.1.4 中间面板

- [ ] @nuxt/ui Editor 集成
- [ ] Markdown 编辑与预览
- [ ] 工具栏（固定 + 气泡）
- [ ] **双向链接 mention 功能**
- [ ] 自动保存
- [ ] AI 功能集成（用户配置）

#### 9.1.5 右侧面板

- [ ] 大纲视图
- [ ] 标题层级解析
- [ ] 点击跳转
- [ ] **双向链接展示（入链/出链）**

#### 9.1.6 设置

- [ ] 设置面板 UI
- [ ] 常规设置（主题、语言、工作区）
- [ ] 窗口行为设置
- [ ] 编辑器设置
- [ ] AI 配置

#### 9.1.7 窗口与托盘

- [ ] 自定义标题栏
- [ ] 窗口控制按钮（最小化/最大化/关闭）
- [ ] **系统托盘**
  - [ ] 托盘图标显示
  - [ ] 左键点击显示/隐藏窗口
  - [ ] 右键菜单（显示笔记、设置、退出）
  - [ ] IPC 路由跳转到设置页面
- [ ] 最小化到托盘功能
- [ ] 关闭到托盘功能

### 9.2 V1.5 增强

- [ ] 全文搜索（FTS5）
- [ ] 快捷键系统
- [ ] 导入/导出功能
- [ ] 回收站（软删除）

### 9.3 V2.0 进阶

- [ ] AI 对话面板
- [ ] 知识库 RAG
- [ ] 多语言支持
- [ ] 插件系统架构
- [ ] 同步功能（Git）

## 10. 附录

### 10.1 依赖清单

**核心依赖：**

- electron
- vue
- @nuxt/ui
- electron-vite
- electron-store
- better-sqlite3
- knex
- vue-i18n

**编辑器相关：**

- @tiptap/vue-3
- @tiptap/starter-kit
- @nuxt/ui（包含 Editor）
- ai（Vercel AI SDK）

**工具库：**

- @vueuse/core
- pinia
- vue-router（可选）
- date-fns

### 10.2 参考资源

- @nuxt/ui Editor: https://ui.nuxt.com/components/editor
- TipTap 文档: https://tiptap.dev/
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
- electron-store: https://github.com/sindresorhus/electron-store
- vue-i18n: https://vue-i18n.intlify.dev/

---

**文档版本：** v1.4  
**最后更新：** 2026-02-14  
**状态：** 待确认

## 11. 修改记录

### v1.4 (2026-02-14)

- ✅ 重构 i18n 国际化架构
  - i18n 目录位置从 `src/renderer/src/i18n` 移到 `src/i18n`
  - 与 main、preload、renderer 目录同级
  - 使用 JSON 语言文件格式（便于主进程/渲染进程共享）
  - 添加主进程 `t()` 翻译函数实现
  - 添加主进程托盘菜单使用 i18n 的示例
  - 添加渲染进程 vue-i18n 集成方案
  - 语言文件使用嵌套 JSON 结构（如 `tray.showWindow`）
- ✅ 更新项目结构，添加 `main/tray.ts` 文件
- ✅ 更新托盘菜单示例，使用 `t('tray.xxx')` 方式

### v1.3 (2026-02-14)

- ✅ 添加系统托盘完整设计
  - 托盘功能与交互设计
  - 右键菜单结构
  - IPC 路由控制方案（方案 A/B 对比）
  - 窗口行为与托盘联动
  - 托盘相关 IPC 通道定义
- ✅ 更新 i18n 语言文件，添加 tray 相关 key
- ✅ 更新 MVP 清单，托盘从"可选"改为"必须"
- ✅ 更新 IPC_CHANNELS，添加 TRAY 相关通道

### v1.2 (2026-02-14)

- ✅ 添加双向链接完整设计
  - `note_links` 关联表设计
  - 链接解析与存储策略
  - 编辑器 mention 集成方案
  - 右侧面板双向链接展示
- ✅ 更新数据库索引设计，添加链接相关索引
- ✅ 更新 MVP 清单，添加双向链接开发项

### v1.1 (2026-02-14)

- ✅ Note 表添加 `tags` 字段（JSON 格式）
- ✅ 添加国际化（i18n）模块结构和语言文件规范
- ✅ 移除项目级 `shared` 目录，保留 `src/shared`
- ✅ 调整 `renderer` 目录结构，添加 `layout/`、`views/`、`services/`
- ✅ 更新右键菜单：笔记增加「收藏」，文件夹增加「新建笔记」「新建子文件夹」
- ✅ 更新全文搜索策略，支持标签搜索
