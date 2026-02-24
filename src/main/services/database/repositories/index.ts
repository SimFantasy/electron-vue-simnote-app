/**
 * 数据访问层（Repository）统一导出
 *
 * 所有 Repository 都从此文件导入
 */

// 文件夹 Repository
export { FolderRepository, folderRepository } from './folder'

// 笔记 Repository
export { NoteRepository, noteRepository } from './note'

// 双向链接 Repository
export { NoteLinkRepository, noteLinkRepository } from './note-link'
