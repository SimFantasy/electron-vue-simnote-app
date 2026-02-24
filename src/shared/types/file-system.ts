/**
 * 文件系统服务类型定义
 *
 * 定义文件操作相关的类型
 */

/**
 * 文件操作结果
 */
export interface FileOperationResult {
  success: boolean
  path?: string
  error?: string
}

/**
 * 文件信息
 */
export interface FileInfo {
  name: string
  path: string
  size: number
  isDirectory: boolean
  createdAt: Date
  modifiedAt: Date
}

/**
 * 图片保存选项
 */
export interface ImageSaveOptions {
  /** 笔记标题（用于生成文件名） */
  noteTitle: string
  /** 原始文件名 */
  originalName: string
  /** 图片数据（Buffer 或 Base64） */
  data: Buffer | string
  /** 是否使用 Base64 */
  isBase64?: boolean
}

/**
 * 图片信息
 */
export interface ImageInfo {
  /** 图片文件名 */
  fileName: string
  /** 完整路径 */
  fullPath: string
  /** 相对路径（用于 Markdown 引用） */
  relativePath: string
  /** 文件大小 */
  size: number
  /** 图片尺寸 */
  dimensions?: {
    width: number
    height: number
  }
}

/**
 * 工作区信息
 */
export interface WorkspaceInfo {
  /** 工作区根路径 */
  rootPath: string
  /** 是否存在 */
  exists: boolean
  /** 是否可写 */
  writable: boolean
  /** 可用空间（字节） */
  freeSpace?: number
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 导出格式 */
  format: 'markdown' | 'html' | 'pdf'
  /** 是否包含图片 */
  includeImages: boolean
  /** 导出路径 */
  outputPath: string
}

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: string[]
}
