# Repository 层开发完成总结

## 已完成内容

### 1. 笔记 Repository (`note.ts`)

**核心功能：**

- ✅ `create()` - 创建笔记（自动生成文件路径、提取纯文本、解析标签）
- ✅ `findById()` - 根据 ID 查询（自动更新访问时间）
- ✅ `findByFolder()` - 查询文件夹下的笔记
- ✅ `findAllList()` - 查询所有笔记（简略信息）
- ✅ `findFavorites()` - 查询收藏的笔记
- ✅ `findRecent()` - 查询最近访问的笔记
- ✅ `search()` - 搜索笔记（支持关键词、标签、收藏筛选）
- ✅ `searchByFTS()` - FTS5 全文搜索
- ✅ `update()` - 更新笔记（自动处理标题、文件夹、内容变更）
- ✅ `delete()` - 软删除笔记
- ✅ `deletePermanent()` - 永久删除
- ✅ `restore()` - 恢复已删除笔记
- ✅ `move()` - 移动笔记到其他文件夹
- ✅ `rename()` - 重命名笔记
- ✅ `toggleFavorite()` - 切换收藏状态
- ✅ `findDeleted()` - 查询回收站笔记
- ✅ `emptyTrash()` - 清空回收站

**工具方法：**

- `sanitizeFileName()` - 清理文件名（移除特殊字符）
- `generateFilePath()` - 生成 Markdown 文件路径
- `extractPlainText()` - 从 Markdown 提取纯文本（用于搜索索引）
- `parseTags()` - 从内容解析 #标签

### 2. 双向链接 Repository (`noteLink.ts`)

**核心功能：**

- ✅ `create()` - 创建链接
- ✅ `createBatch()` - 批量创建链接
- ✅ `delete()` - 删除链接
- ✅ `deleteBySource()` - 删除笔记的所有出链
- ✅ `deleteByTarget()` - 删除笔记的所有入链
- ✅ `deleteAllByNote()` - 删除笔记的所有链接
- ✅ `findLink()` - 查找特定链接
- ✅ `hasLink()` - 检查链接是否存在
- ✅ `getOutgoingLinks()` - 获取出链（该笔记引用了谁）
- ✅ `getIncomingLinks()` - 获取入链（谁引用了该笔记）
- ✅ `getOutgoingCount()` - 出链数量
- ✅ `getIncomingCount()` - 入链数量
- ✅ `syncLinks()` - 同步链接（根据内容自动更新）
- ✅ `findOrphanedLinks()` - 查找孤立链接（指向已删除笔记）
- ✅ `cleanupOrphanedLinks()` - 清理孤立链接
- ✅ `getLinkStats()` - 获取链接统计

### 3. 文件结构

```
src/main/services/database/
├── index.ts                    # 统一导出
├── connection.ts               # Knex 连接管理
├── schema.ts                   # 表名常量
├── migrations/
│   └── 202402150001_create_tables.ts  # 迁移文件
└── repositories/
    ├── index.ts               # Repository 统一导出
    ├── folder.ts              # 文件夹 Repository（已存在）
    ├── note.ts                # 笔记 Repository（新增）
    └── noteLink.ts            # 双向链接 Repository（新增）
```

## 使用示例

### 笔记操作

```typescript
import { noteRepository } from './services/database/repositories'

// 创建笔记
const note = await noteRepository.create(
  { title: '会议纪要', folder_id: 'folder-uuid' },
  '# 会议纪要\n\n讨论了项目进展...'
)

// 查询笔记
const notes = await noteRepository.findByFolder('folder-uuid')

// 搜索笔记
const results = await noteRepository.search({
  keyword: '项目',
  folder_id: 'folder-uuid'
})

// 更新笔记
await noteRepository.update('note-uuid', { title: '新的标题' }, '# 新的内容\n\n更新后的内容...')

// 切换收藏
await noteRepository.toggleFavorite('note-uuid')

// 删除笔记（软删除）
await noteRepository.delete('note-uuid')
```

### 双向链接操作

```typescript
import { noteLinkRepository } from './services/database/repositories'

// 创建链接
await noteLinkRepository.create('note-a-uuid', 'note-b-uuid')

// 获取出链（该笔记引用了哪些笔记）
const outgoing = await noteLinkRepository.getOutgoingLinks('note-uuid')

// 获取入链（哪些笔记引用了该笔记）
const incoming = await noteLinkRepository.getIncomingLinks('note-uuid')

// 同步链接（根据笔记内容自动更新）
await noteLinkRepository.syncLinks('note-uuid', ['note-b-uuid', 'note-c-uuid'])

// 获取链接统计
const stats = await noteLinkRepository.getLinkStats('note-uuid')
console.log(stats) // { incoming: 5, outgoing: 3 }
```

## 下一步

接下来开发 **i18n 国际化框架**！
