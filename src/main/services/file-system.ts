import { promises as fs, existsSync, mkdirSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import type {
  FileOperationResult,
  ImageSaveOptions,
  ImageInfo,
  WorkspaceInfo,
  ImportResult
} from '@shared/types'

/**
 * 文件系统服务
 *
 * 负责：
 * - Markdown 文件的读写
 * - 图片的保存和管理
 * - 工作区目录操作
 * - 导入导出功能
 */
class FileSystemService {
  /** 当前工作区路径 */
  private workspacePath: string = ''

  /**
   * 初始化工作区
   * @param workspacePath - 工作区根目录路径
   */
  initialize(workspacePath: string): void {
    this.workspacePath = workspacePath
    console.log('[FileSystem] 初始化工作区:', workspacePath)

    // 确保工作区目录存在
    this.ensureDir(workspacePath)

    // 创建必要的子目录
    this.ensureDir(join(workspacePath, 'content'))
    this.ensureDir(join(workspacePath, '.meta'))
  }

  /**
   * 获取当前工作区路径
   */
  getWorkspacePath(): string {
    return this.workspacePath
  }

  /**
   * 确保目录存在（不存在则创建）
   * @param dirPath - 目录路径
   */
  private ensureDir(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
    }
  }

  /**
   * 生成安全的文件名
   * 移除特殊字符，避免文件系统问题
   */
  private sanitizeFileName(name: string): string {
    return name
      .replace(/[<>:"/\\|?*]/g, '_') // Windows 禁止的字符
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim()
      .substring(0, 100) // 限制长度
  }

  /**
   * 生成当前时间戳
   */
  private getTimestamp(): number {
    return Date.now()
  }

  // ==================== Markdown 文件操作 ====================

  /**
   * 读取 Markdown 文件
   * @param relativePath - 相对工作区的文件路径
   * @returns 文件内容
   */
  async readMarkdown(relativePath: string): Promise<string> {
    const fullPath = join(this.workspacePath, relativePath)

    try {
      const content = await fs.readFile(fullPath, 'utf-8')
      return content
    } catch (error) {
      console.error('[FileSystem] 读取文件失败:', fullPath, error)
      throw new Error(`读取文件失败: ${relativePath}`)
    }
  }

  /**
   * 写入 Markdown 文件
   * @param relativePath - 相对工作区的文件路径
   * @param content - 文件内容
   * @returns 操作结果
   */
  async writeMarkdown(relativePath: string, content: string): Promise<FileOperationResult> {
    const fullPath = join(this.workspacePath, relativePath)

    try {
      // 确保目录存在
      const dir = dirname(fullPath)
      this.ensureDir(dir)

      // 写入文件
      await fs.writeFile(fullPath, content, 'utf-8')

      return { success: true, path: relativePath }
    } catch (error) {
      console.error('[FileSystem] 写入文件失败:', fullPath, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '写入文件失败'
      }
    }
  }

  /**
   * 删除 Markdown 文件
   * @param relativePath - 相对工作区的文件路径
   * @returns 操作结果
   */
  async deleteMarkdown(relativePath: string): Promise<FileOperationResult> {
    const fullPath = join(this.workspacePath, relativePath)

    try {
      await fs.unlink(fullPath)
      return { success: true, path: relativePath }
    } catch (error) {
      console.error('[FileSystem] 删除文件失败:', fullPath, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除文件失败'
      }
    }
  }

  /**
   * 移动 Markdown 文件
   * @param oldPath - 原路径（相对工作区）
   * @param newPath - 新路径（相对工作区）
   * @returns 操作结果
   */
  async moveMarkdown(oldPath: string, newPath: string): Promise<FileOperationResult> {
    const oldFullPath = join(this.workspacePath, oldPath)
    const newFullPath = join(this.workspacePath, newPath)

    try {
      // 确保目标目录存在
      const newDir = dirname(newFullPath)
      this.ensureDir(newDir)

      // 移动文件
      await fs.rename(oldFullPath, newFullPath)

      return { success: true, path: newPath }
    } catch (error) {
      console.error('[FileSystem] 移动文件失败:', oldPath, '->', newPath, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '移动文件失败'
      }
    }
  }

  /**
   * 重命名 Markdown 文件
   * @param relativePath - 相对工作区的文件路径
   * @param newName - 新文件名（不含扩展名）
   * @returns 操作结果
   */
  async renameMarkdown(relativePath: string, newName: string): Promise<FileOperationResult> {
    const dir = dirname(relativePath)
    const sanitizedName = this.sanitizeFileName(newName)
    const newPath = join(dir, `${sanitizedName}.md`)

    return await this.moveMarkdown(relativePath, newPath)
  }

  /**
   * 检查文件是否存在
   * @param relativePath - 相对工作区的文件路径
   * @returns 是否存在
   */
  exists(relativePath: string): boolean {
    const fullPath = join(this.workspacePath, relativePath)
    return existsSync(fullPath)
  }

  // ==================== 图片管理 ====================

  /**
   * 保存图片
   * @param options - 保存选项
   * @returns 图片信息
   */
  async saveImage(options: ImageSaveOptions): Promise<ImageInfo> {
    const { noteTitle, originalName, data, isBase64 = false } = options

    // 生成文件名
    const sanitizedNoteTitle = this.sanitizeFileName(noteTitle)
    const sanitizedOriginalName = this.sanitizeFileName(
      basename(originalName, extname(originalName))
    )
    const timestamp = this.getTimestamp()
    const ext = extname(originalName) || '.png'
    const fileName = `${sanitizedNoteTitle}_${sanitizedOriginalName}_${timestamp}${ext}`

    // 图片目录
    const imagesDir = join(this.workspacePath, 'content', sanitizedNoteTitle, 'images')
    this.ensureDir(imagesDir)

    // 完整路径
    const fullPath = join(imagesDir, fileName)

    try {
      // 转换并保存数据
      let buffer: Buffer
      if (isBase64 && typeof data === 'string') {
        // Base64 解码
        const base64Data = data.replace(/^data:image\/\w+;base64,/, '')
        buffer = Buffer.from(base64Data, 'base64')
      } else {
        buffer = data as Buffer
      }

      // 写入文件
      await fs.writeFile(fullPath, buffer)

      // 获取文件大小
      const stats = await fs.stat(fullPath)

      return {
        fileName,
        fullPath,
        relativePath: `./images/${fileName}`,
        size: stats.size
      }
    } catch (error) {
      console.error('[FileSystem] 保存图片失败:', fullPath, error)
      throw new Error(`保存图片失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 删除图片
   * @param relativePath - 相对工作区的图片路径
   * @returns 操作结果
   */
  async deleteImage(relativePath: string): Promise<FileOperationResult> {
    const fullPath = join(this.workspacePath, relativePath)

    try {
      await fs.unlink(fullPath)
      return { success: true, path: relativePath }
    } catch (error) {
      console.error('[FileSystem] 删除图片失败:', fullPath, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除图片失败'
      }
    }
  }

  /**
   * 删除笔记的所有图片
   * @param noteFolderPath - 笔记所在文件夹路径（相对 content）
   * @returns 删除的图片数量
   */
  async deleteNoteImages(noteFolderPath: string): Promise<number> {
    const imagesDir = join(this.workspacePath, 'content', noteFolderPath, 'images')

    if (!existsSync(imagesDir)) {
      return 0
    }

    try {
      const files = await fs.readdir(imagesDir)
      let deletedCount = 0

      for (const file of files) {
        const filePath = join(imagesDir, file)
        const stat = await fs.stat(filePath)

        if (stat.isFile()) {
          await fs.unlink(filePath)
          deletedCount++
        }
      }

      // 删除 images 目录
      await fs.rmdir(imagesDir)

      return deletedCount
    } catch (error) {
      console.error('[FileSystem] 删除笔记图片失败:', imagesDir, error)
      return 0
    }
  }

  // ==================== 目录操作 ====================

  /**
   * 创建目录
   * @param relativePath - 相对工作区的目录路径
   */
  async createDirectory(relativePath: string): Promise<void> {
    const fullPath = join(this.workspacePath, relativePath)
    this.ensureDir(fullPath)
  }

  /**
   * 删除目录
   * @param relativePath - 相对工作区的目录路径
   * @param recursive - 是否递归删除
   */
  async deleteDirectory(relativePath: string, recursive: boolean = false): Promise<void> {
    const fullPath = join(this.workspacePath, relativePath)

    if (recursive) {
      await fs.rm(fullPath, { recursive: true, force: true })
    } else {
      await fs.rmdir(fullPath)
    }
  }

  /**
   * 移动目录
   * @param oldPath - 原路径
   * @param newPath - 新路径
   */
  async moveDirectory(oldPath: string, newPath: string): Promise<void> {
    const oldFullPath = join(this.workspacePath, oldPath)
    const newFullPath = join(this.workspacePath, newPath)

    await fs.rename(oldFullPath, newFullPath)
  }

  // ==================== 导入导出 ====================

  /**
   * 导出笔记为 Markdown
   * @param notePath - 笔记路径
   * @param outputPath - 输出路径
   * @returns 操作结果
   */
  async exportToMarkdown(notePath: string, outputPath: string): Promise<FileOperationResult> {
    try {
      const content = await this.readMarkdown(notePath)
      await fs.writeFile(outputPath, content, 'utf-8')
      return { success: true, path: outputPath }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '导出失败'
      }
    }
  }

  /**
   * 导入 Markdown 文件
   * @param sourcePath - 源文件路径
   * @param targetFolder - 目标文件夹
   * @returns 导入结果
   */
  async importMarkdown(sourcePath: string, targetFolder: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    }

    try {
      // 读取源文件
      const content = await fs.readFile(sourcePath, 'utf-8')
      const fileName = basename(sourcePath)
      const targetPath = join(targetFolder, fileName)

      // 写入目标位置
      const writeResult = await this.writeMarkdown(targetPath, content)

      if (writeResult.success) {
        result.imported++
      } else {
        result.failed++
        result.errors.push(`导入失败: ${fileName}`)
      }
    } catch (error) {
      result.failed++
      result.errors.push(error instanceof Error ? error.message : '导入失败')
    }

    return result
  }

  // ==================== 工具方法 ====================

  /**
   * 获取工作区信息
   * @returns 工作区信息
   */
  async getWorkspaceInfo(): Promise<WorkspaceInfo> {
    try {
      await fs.access(this.workspacePath, fs.constants.W_OK)
      return {
        rootPath: this.workspacePath,
        exists: true,
        writable: true
      }
    } catch {
      return {
        rootPath: this.workspacePath,
        exists: existsSync(this.workspacePath),
        writable: false
      }
    }
  }

  /**
   * 清理未引用的图片
   * 扫描笔记内容，删除没有被引用的图片
   * @returns 清理的图片数量
   */
  async cleanupUnusedImages(): Promise<number> {
    // TODO: 实现清理逻辑
    // 1. 遍历所有笔记
    // 2. 提取所有图片引用
    // 3. 删除未被引用的图片
    return 0
  }
}

// 导出单例
export const fileSystemService = new FileSystemService()

// 便捷导出
export const initializeFileSystem = (path: string) => fileSystemService.initialize(path)
export const getWorkspacePath = () => fileSystemService.getWorkspacePath()
export const readMarkdown = (path: string) => fileSystemService.readMarkdown(path)
export const writeMarkdown = (path: string, content: string) =>
  fileSystemService.writeMarkdown(path, content)
export const deleteMarkdown = (path: string) => fileSystemService.deleteMarkdown(path)
export const moveMarkdown = (oldPath: string, newPath: string) =>
  fileSystemService.moveMarkdown(oldPath, newPath)
export const saveImage = (options: ImageSaveOptions) => fileSystemService.saveImage(options)
export const deleteNoteImages = (folderPath: string) =>
  fileSystemService.deleteNoteImages(folderPath)
