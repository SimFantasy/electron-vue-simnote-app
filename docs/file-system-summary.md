# 文件系统服务开发完成总结

## 📁 文件位置

```
src/main/services/
├── file-system.ts          # 文件系统服务（新增）
└── database/
    └── repositories/       # Repository 层
```

## ✅ 核心功能

### 1. Markdown 文件操作

- `readMarkdown(path)` - 读取 Markdown 文件
- `writeMarkdown(path, content)` - 写入 Markdown 文件
- `deleteMarkdown(path)` - 删除 Markdown 文件
- `moveMarkdown(oldPath, newPath)` - 移动 Markdown 文件
- `renameMarkdown(path, newName)` - 重命名 Markdown 文件
- `exists(path)` - 检查文件是否存在

### 2. 图片管理

- `saveImage(options)` - 保存图片
  - 支持 Buffer 和 Base64 格式
  - 自动生成文件名：`{笔记标题}_{原文件名}_{时间戳}.{扩展名}`
  - 保存到 `content/{笔记文件夹}/images/`
- `deleteImage(path)` - 删除图片
- `deleteNoteImages(folderPath)` - 删除笔记的所有图片

### 3. 目录操作

- `createDirectory(path)` - 创建目录
- `deleteDirectory(path, recursive)` - 删除目录
- `moveDirectory(oldPath, newPath)` - 移动目录

### 4. 导入导出

- `exportToMarkdown(notePath, outputPath)` - 导出为 Markdown
- `importMarkdown(sourcePath, targetFolder)` - 导入 Markdown 文件

### 5. 工作区管理

- `initialize(workspacePath)` - 初始化工作区
- `getWorkspacePath()` - 获取工作区路径
- `getWorkspaceInfo()` - 获取工作区信息
- `cleanupUnusedImages()` - 清理未引用图片（TODO）

## 📝 使用示例

### 初始化

```typescript
import { fileSystemService } from './services/file-system'

// 初始化工作区
fileSystemService.initialize('/path/to/workspace')
```

### 读写 Markdown

```typescript
// 写入笔记
await fileSystemService.writeMarkdown('content/工作笔记/会议纪要.md', '# 会议纪要\n\n内容...')

// 读取笔记
const content = await fileSystemService.readMarkdown('content/工作笔记/会议纪要.md')
```

### 图片管理

```typescript
// 保存图片
const imageInfo = await fileSystemService.saveImage({
  noteTitle: '会议纪要',
  originalName: 'screenshot.png',
  data: buffer, // 或 base64 字符串
  isBase64: false
})

// 返回：
// {
//   fileName: '会议纪要_screenshot_1707830400000.png',
//   fullPath: '/workspace/content/工作笔记/images/会议纪要_screenshot_1707830400000.png',
//   relativePath: './images/会议纪要_screenshot_1707830400000.png',
//   size: 1024
// }
```

### 删除笔记（连带图片）

```typescript
// 删除笔记文件
await fileSystemService.deleteMarkdown('content/工作笔记/会议纪要.md')

// 删除笔记的图片
await fileSystemService.deleteNoteImages('工作笔记')
```

## 🔧 文件命名规范

- 使用 `sanitizeFileName()` 清理文件名
- 移除 Windows 禁止的字符：`<>:
