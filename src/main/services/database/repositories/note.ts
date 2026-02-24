import { getKnex } from '../index'
import { TABLE_FOLDERS, TABLE_NOTES, TABLE_NOTE_FTS } from '../schema'
import type {
  Note,
  CreateNoteParams,
  UpdateNoteParams,
  SearchNotesParams,
  NoteListItem
} from '@shared/types'

/**
 * 笔记数据访问对象（Repository）
 *
 * 使用 Knex 查询构建器操作 notes 表
 * 提供笔记的增删改查、搜索等功能
 * 同时管理 Markdown 文件的读写
 */
export class NoteRepository {
  /**
   * 获取 Knex 查询构建器
   */
  private get db() {
    return getKnex()(TABLE_NOTES)
  }

  /**
   * 生成 UUID
   */
  private generateId(): string {
    return crypto.randomUUID()
  }

  /**
   * 获取当前时间戳（毫秒）
   */
  private now(): number {
    return Date.now()
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
   * 生成笔记文件路径
   * @param folderPath - 文件夹路径
   * @param title - 笔记标题
   * @returns Markdown 文件路径
   */
  private generateFilePath(folderPath: string, title: string): string {
    const sanitizedTitle = this.sanitizeFileName(title)
    return `content/${folderPath}/${sanitizedTitle}.md`
  }

  /**
   * 提取纯文本内容（从 Markdown/HTML 中）
   * 用于全文搜索索引
   */
  private extractPlainText(content: string): string {
    // 移除 Markdown 标记
    return content
      .replace(/#+ /g, '') // 移除标题标记
      .replace(/\*\*|__/g, '') // 移除粗体标记
      .replace(/\*|_/g, '') // 移除斜体标记
      .replace(/`{1,3}/g, '') // 移除代码标记
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 提取链接文本
      .replace(/<[^>]+>/g, '') // 移除 HTML 标签
      .replace(/\s+/g, ' ') // 合并空白
      .trim()
  }

  /**
   * 解析标签
   * 从内容中提取 #标签 格式
   */
  private parseTags(content: string): string[] {
    const tagRegex = /#([\u4e00-\u9fa5a-zA-Z0-9_-]+)/g
    const tags: string[] = []
    let match
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1])
    }
    return [...new Set(tags)] // 去重
  }

  /**
   * 创建笔记
   * @param params - 创建参数
   * @param content - 笔记内容（Markdown）
   * @returns 创建的笔记对象
   */
  async create(params: CreateNoteParams, content: string = ''): Promise<Note> {
    const { title, folder_id } = params
    const id = this.generateId()
    const now = this.now()

    // 获取文件夹路径
    const folder = await getKnex()(TABLE_FOLDERS).where('id', folder_id).first()

    if (!folder) {
      throw new Error(`文件夹不存在: ${folder_id}`)
    }

    // 生成文件路径
    const contentPath = this.generateFilePath(folder.path, title)

    // 提取纯文本和标签
    const contentPlain = this.extractPlainText(content)
    const tags = this.parseTags(content)

    const note: Note = {
      id,
      title,
      folder_id,
      content_path: contentPath,
      content_plain: contentPlain,
      tags: JSON.stringify(tags),
      is_favorite: false,
      is_deleted: false,
      sort_order: 0,
      created_at: now,
      updated_at: now,
      accessed_at: now
    }

    await this.db.insert(note)
    return note
  }

  /**
   * 根据 ID 查询笔记
   * @param id - 笔记 ID
   * @param updateAccessTime - 是否更新访问时间
   * @returns 笔记对象，如果不存在返回 null
   */
  async findById(id: string, updateAccessTime: boolean = true): Promise<Note | null> {
    const result = await this.db.where('id', id).first()

    if (result && updateAccessTime) {
      // 异步更新访问时间，不阻塞查询
      this.db.where('id', id).update({ accessed_at: this.now() }).catch(console.error)
    }

    return result || null
  }

  /**
   * 根据文件夹查询笔记
   * @param folderId - 文件夹 ID
   * @param includeDeleted - 是否包含已删除的笔记
   * @returns 笔记数组
   */
  async findByFolder(folderId: string, includeDeleted: boolean = false): Promise<Note[]> {
    let query = this.db
      .where('folder_id', folderId)
      .orderBy('sort_order', 'asc')
      .orderBy('updated_at', 'desc')

    if (!includeDeleted) {
      query = query.where('is_deleted', false)
    }

    return await query
  }

  /**
   * 查询所有笔记（简略信息）
   * @returns 笔记列表项数组
   */
  async findAllList(): Promise<NoteListItem[]> {
    const results = await this.db
      .select('id', 'title', 'folder_id', 'is_favorite', 'tags', 'updated_at')
      .where('is_deleted', false)
      .orderBy('updated_at', 'desc')

    return results.map((item) => ({
      ...item,
      tags: JSON.parse(item.tags || '[]')
    }))
  }

  /**
   * 查询收藏的笔记
   * @returns 笔记数组
   */
  async findFavorites(): Promise<Note[]> {
    return await this.db
      .where('is_favorite', true)
      .where('is_deleted', false)
      .orderBy('updated_at', 'desc')
  }

  /**
   * 查询最近访问的笔记
   * @param limit - 返回数量限制
   * @returns 笔记数组
   */
  async findRecent(limit: number = 10): Promise<Note[]> {
    return await this.db
      .where('is_deleted', false)
      .whereNotNull('accessed_at')
      .orderBy('accessed_at', 'desc')
      .limit(limit)
  }

  /**
   * 搜索笔记
   * @param params - 搜索参数
   * @returns 笔记数组
   */
  async search(params: SearchNotesParams): Promise<Note[]> {
    const { keyword, folder_id, tags, is_favorite, include_deleted } = params

    // 使用全文搜索
    if (keyword) {
      return await this.searchByFTS(keyword, folder_id, include_deleted)
    }

    // 普通筛选搜索
    let query = this.db

    if (folder_id) {
      query = query.where('folder_id', folder_id)
    }

    if (!include_deleted) {
      query = query.where('is_deleted', false)
    }

    if (is_favorite !== undefined) {
      query = query.where('is_favorite', is_favorite)
    }

    // 标签筛选
    if (tags && tags.length > 0) {
      // 使用 JSON 提取匹配标签
      for (const tag of tags) {
        query = query.whereRaw(`json_extract(tags, '$') LIKE ?`, [`%${tag}%`])
      }
    }

    return await query.orderBy('updated_at', 'desc')
  }

  /**
   * 使用 FTS5 全文搜索
   * @param keyword - 搜索关键词
   * @param folderId - 可选的文件夹过滤
   * @param includeDeleted - 是否包含已删除
   * @returns 笔记数组
   */
  private async searchByFTS(
    keyword: string,
    folderId?: string,
    includeDeleted?: boolean
  ): Promise<Note[]> {
    const knex = getKnex()

    // 构建 FTS 查询
    const ftsQuery = knex(TABLE_NOTE_FTS).select('rowid').whereRaw('note_fts MATCH ?', [keyword])

    // 获取匹配的行 ID
    const rowIds = await ftsQuery
    const ids = rowIds.map((r: { rowid: string }) => r.rowid)

    if (ids.length === 0) {
      return []
    }

    // 查询完整的笔记信息
    let query = this.db.whereIn('id', ids)

    if (folderId) {
      query = query.where('folder_id', folderId)
    }

    if (!includeDeleted) {
      query = query.where('is_deleted', false)
    }

    return await query
  }

  /**
   * 更新笔记
   * @param id - 笔记 ID
   * @param params - 更新参数
   * @param content - 新的笔记内容（可选）
   * @returns 更新后的笔记对象
   */
  async update(id: string, params: UpdateNoteParams, content?: string): Promise<Note | null> {
    const existing = await this.findById(id, false)
    if (!existing) {
      return null
    }

    const updateData: Partial<Note> = {
      updated_at: this.now()
    }

    // 更新标题
    if (params.title !== undefined) {
      updateData.title = params.title

      // 如果标题变了，更新文件路径
      if (params.title !== existing.title) {
        const folder = await getKnex()(TABLE_FOLDERS).where('id', existing.folder_id).first()

        if (folder) {
          updateData.content_path = this.generateFilePath(folder.path, params.title)
        }
      }
    }

    // 更新文件夹
    if (params.folder_id !== undefined && params.folder_id !== existing.folder_id) {
      updateData.folder_id = params.folder_id

      // 更新文件路径
      const folder = await getKnex()(TABLE_FOLDERS).where('id', params.folder_id).first()

      if (folder) {
        const title = updateData.title || existing.title
        updateData.content_path = this.generateFilePath(folder.path, title)
      }
    }

    // 更新内容
    if (content !== undefined) {
      updateData.content_plain = this.extractPlainText(content)

      // 如果内容中有标签，更新标签
      const tags = this.parseTags(content)
      if (tags.length > 0) {
        updateData.tags = JSON.stringify(tags)
      }
    }

    // 更新标签（如果直接传入）
    if (params.tags !== undefined) {
      updateData.tags = JSON.stringify(params.tags)
    }

    // 更新其他字段
    if (params.is_favorite !== undefined) {
      updateData.is_favorite = params.is_favorite
    }

    if (params.is_deleted !== undefined) {
      updateData.is_deleted = params.is_deleted
    }

    if (params.sort_order !== undefined) {
      updateData.sort_order = params.sort_order
    }

    await this.db.where('id', id).update(updateData)
    return await this.findById(id)
  }

  /**
   * 删除笔记（软删除）
   * @param id - 笔记 ID
   * @returns true 表示删除成功
   */
  async delete(id: string): Promise<boolean> {
    const count = await this.db.where('id', id).update({
      is_deleted: true,
      updated_at: this.now()
    })
    return count > 0
  }

  /**
   * 永久删除笔记
   * @param id - 笔记 ID
   * @returns true 表示删除成功
   */
  async deletePermanent(id: string): Promise<boolean> {
    const count = await this.db.where('id', id).delete()
    return count > 0
  }

  /**
   * 恢复已删除的笔记
   * @param id - 笔记 ID
   * @returns 恢复后的笔记对象
   */
  async restore(id: string): Promise<Note | null> {
    await this.db.where('id', id).update({
      is_deleted: false,
      updated_at: this.now()
    })
    return await this.findById(id)
  }

  /**
   * 移动笔记到另一个文件夹
   * @param id - 笔记 ID
   * @param targetFolderId - 目标文件夹 ID
   * @returns 移动后的笔记对象
   */
  async move(id: string, targetFolderId: string): Promise<Note | null> {
    return await this.update(id, { folder_id: targetFolderId })
  }

  /**
   * 重命名笔记
   * @param id - 笔记 ID
   * @param newTitle - 新标题
   * @returns 重命名后的笔记对象
   */
  async rename(id: string, newTitle: string): Promise<Note | null> {
    return await this.update(id, { title: newTitle })
  }

  /**
   * 切换收藏状态
   * @param id - 笔记 ID
   * @returns 更新后的笔记对象
   */
  async toggleFavorite(id: string): Promise<Note | null> {
    const note = await this.findById(id, false)
    if (!note) {
      return null
    }

    return await this.update(id, { is_favorite: !note.is_favorite })
  }

  /**
   * 获取回收站中的笔记
   * @returns 已删除的笔记数组
   */
  async findDeleted(): Promise<Note[]> {
    return await this.db.where('is_deleted', true).orderBy('updated_at', 'desc')
  }

  /**
   * 清空回收站
   * @returns 删除的笔记数量
   */
  async emptyTrash(): Promise<number> {
    // 这里应该同时删除对应的 Markdown 文件
    // TODO: 实现文件删除逻辑
    const count = await this.db.where('is_deleted', true).delete()
    return count
  }
}

// 导出单例实例
export const noteRepository = new NoteRepository()
