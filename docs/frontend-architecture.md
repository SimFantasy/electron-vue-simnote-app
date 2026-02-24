# 笔记应用架构设计文档

## 1. 项目概述

基于 Electron + Vue + @nuxt/ui 的桌面笔记应用，采用分层架构设计。

## 2. 前端架构设计

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│  Components (UI 层)                                      │
│  ├── LayoutSidebarNoteItems    ← 左侧面板树形组件         │
│  ├── EditorPanel               ← 中间编辑器              │
│  ├── NotePropertiesPanel       ← 右侧面板属性/大纲        │
│  ├── CommandPalette            ← 搜索面板                │
│  └── MainItemsStats            ← 快捷入口/统计           │
├─────────────────────────────────────────────────────────┤
│  Composables (业务逻辑层)                                  │
│  ├── useNoteData               ← 数据增删改查、搜索       │
│  ├── useNoteTree               ← 树形结构、菜单、拖拽     │
│  └── useActiveNote             ← 当前笔记详情、大纲、属性  │
├─────────────────────────────────────────────────────────┤
│  Stores (数据层)                                          │
│  └── useNoteStore              ← 原始数据 + 当前状态      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 职责划分

#### useNoteStore（数据仓库）

**职责**：只存原始数据，无业务逻辑

- `folders`: Folder[] - 所有文件夹
- `notes`: Note[] - 所有笔记
- `activeNoteId`: string - 当前选中笔记ID
- `activeNoteContent`: string - 当前笔记内容
- `activeNoteOutline`: Heading[] - 当前笔记大纲
- `hasContentChanged`: boolean - 内容是否修改

#### useNoteData（数据业务）

**职责**：跨组件的数据查询、统计、搜索

- `getNoteById(id)` - 获取单个笔记
- `getNotesByFolder(folderId)` - 获取文件夹下笔记
- `searchNotes(keyword)` - 全文搜索
- `getFavoriteCount()` - 收藏数量统计
- `getRecentNotes(limit)` - 最近笔记
- `createNote()/updateNote()/deleteNote()` - CRUD

#### useNoteTree（树形交互）

**职责**：专用于左侧面板的树形展示和交互

- `treeData` - 嵌套结构数据
- `expandedIds` - 展开的文件夹ID集合
- `toggleExpand()` - 展开/收起
- `handleDragUpdate()` - 拖拽处理
- `contextMenu` - 右键菜单状态
- `handleCreateNote()/handleRename()/handleDelete()` - 树形操作

#### useActiveNote（当前笔记）

**职责**：管理当前选中的笔记

- `activeNote` - 当前笔记基本信息
- `activeContent` - 笔记内容
- `activeOutline` - 笔记大纲
- `activeProperties` - 笔记属性
- `setActiveNote()` - 切换笔记
- `saveContent()` - 保存内容
- `jumpToHeading()` - 跳转到大纲位置

## 3. 数据流向

```
用户操作
  ↓
Component (UI 组件)
  ↓
Composable (业务逻辑)
  ├── 本地状态修改
  └── Store 数据更新
        ↓
  Store (响应式数据)
        ↓
  所有订阅组件自动更新
```

## 4. 组件间通信

### 4.1 选中笔记流程

```
LayoutSidebarNoteItems (左)
  ├── 用户点击笔记
  ├── 调用 useActiveNote.setActiveNote(noteId)
  └── Store.activeNoteId 更新
        ↓
EditorPanel (中) + NotePropertiesPanel (右)
  ├── 监听 activeNoteId 变化
  └── 自动更新显示
```

### 4.2 树形拖拽流程

```
LayoutSidebarNoteItems
  ├── useSortable 捕获拖拽事件
  ├── 调用 useNoteTree.handleDragUpdate()
  ├── 内部调用 useNoteData.moveNoteToFolder()
  ├── 调用 API 移动笔记
  └── 刷新 Store 数据
```

## 5. 功能清单

### 5.1 左侧面板 (LayoutSidebar)

- [x] 搜索栏 (CommandPalette)
- [x] 快捷入口 (MainItems: 所有笔记、收藏、回收站)
- [x] 树形目录 (NoteTree)
  - [x] 无限级嵌套文件夹
  - [x] 笔记显示在文件夹下
  - [x] 展开/收起
  - [x] 拖拽排序和移动
  - [x] 右键菜单
  - [x] 滑过显示操作按钮

### 5.2 中间面板 (EditorPanel)

- [x] @nuxt/ui Editor 组件
- [x] 实时预览
- [x] 自动保存
- [x] AI 功能集成

### 5.3 右侧面板 (NotePropertiesPanel)

- [x] 大纲视图
- [x] 笔记属性
- [x] 双向链接

## 6. 配置项规划

### 6.1 编辑器设置

```typescript
editor: {
  showOutline: boolean // 是否显示大纲面板
  parseOutlineRealtime: boolean // 实时解析还是保存后解析
  autoSave: boolean // 自动保存
  autoSaveInterval: number // 自动保存间隔（秒）
}
```

### 6.2 性能设置

```typescript
performance: {
  cacheRecentNotes: boolean // 是否缓存最近笔记
  cacheSize: number // 缓存数量
}
```

## 7. 开发顺序

### Phase 1: 基础架构

1. [x] useNoteStore - 数据层
2. [x] useNoteData - 数据业务
3. [x] useNoteTree - 树形交互
4. [x] useActiveNote - 当前笔记

### Phase 2: 左侧面板

1. [x] LayoutSidebarSearchbar
2. [x] LayoutSidebarMainItems
3. [x] LayoutSidebarNoteItems
4. [x] SidebarNoteItem
5. [x] SidebarNoteContextMenu

### Phase 3: 中间和右侧面板

1. [ ] EditorPanel
2. [ ] NotePropertiesPanel

### Phase 4: 高级功能

1. [ ] 双向链接
2. [ ] AI 集成
3. [ ] 导入导出

## 8. 技术栈

- **UI 框架**: @nuxt/ui 4.40
- **状态管理**: Pinia
- **工具库**: @vueuse/core + @vueuse/integrations
- **编辑器**: @nuxt/ui Editor (TipTap)
- **图标**: Tabler Icons
- **拖拽**: useSortable (Sortable.js)

## 9. 文件结构

```
src/renderer/src/
├── components/
│   ├── layout/
│   │   ├── sidebar/
│   │   │   └── left/
│   │   │       ├── index.vue                 # 左侧面板容器
│   │   │       ├── sidebar-searchbar.vue     # 搜索栏
│   │   │       ├── sidebar-main-items.vue    # 快捷入口
│   │   │       ├── sidebar-note-items.vue    # 树形目录
│   │   │       ├── sidebar-note-item.vue     # 树节点项
│   │   │       └── sidebar-note-context-menu.vue  # 右键/下拉菜单
│   │   └── ...
│   └── ...
├── composables/
│   ├── use-note-data.ts      # 数据业务
│   ├── use-note-tree.ts      # 树形交互
│   └── use-active-note.ts    # 当前笔记
├── stores/
│   ├── index.ts              # Store 入口
│   └── modules/
│       └── note.ts           # Note Store
└── ...
```

## 10. 注意事项

1. **Store 只存数据，不做业务逻辑**
2. **Composables 处理业务，可复用**
3. **组件尽量简洁，逻辑交给 Composables**
4. **拖拽功能需要设置 nested=false（扁平化列表）**
5. **大纲解析根据设置决定实时还是保存后**

---

**创建日期**: 2024-02-15  
**最后更新**: 2024-02-15
