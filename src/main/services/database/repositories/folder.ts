import { getKnex } from '../index'
import { TABLE_FOLDERS } from '../schema'
import type { Folder, CreateFolderParams, UpdateFolderParams } from '@shared/types'

/**
 * 文件夹数据访问对象（Repository）
 *
 * 使用 Knex 查询构建器操作 folders 表
 * 提供文件夹的增删改查功能
 */
export class FolderRepository {
  /**
   * 获取 Knex 查询构建器
   */
  private get db() {
    return getKnex()(TABLE_FOLDERS)
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
   * 生成文件夹路径
   * @param parentPath - 父文件夹路径
   * @param name - 文件夹名称
   * @returns 完整路径
   */
  private generatePath(parentPath: string | null, name: string): string {
    const sanitizedName = name.replace(/[/\\]/g, '_')
    if (!parentPath) {
      return sanitizedName
    }
    return `${parentPath}/${sanitizedName}`
  }

  /**
   * 创建文件夹
   * @param params - 创建参数
   * @returns 创建的文件夹对象
   */
  async create(params: CreateFolderParams): Promise<Folder> {
    const { name, parent_id } = params
    const id = this.generateId()
    const now = this.now()

    // 获取父文件夹路径
    let parentPath: string | null = null
    if (parent_id) {
      const parent = await this.findById(parent_id)
      if (!parent) {
        throw new Error(`父文件夹不存在: ${parent_id}`)
      }
      parentPath = parent.path
    }

    const path = this.generatePath(parentPath, name)

    const folder: Folder = {
      id,
      name,
      parent_id: parent_id || null,
      path,
      sort_order: 0,
      created_at: now,
      updated_at: now
    }

    await this.db.insert(folder)
    return folder
  }

  /**
   * 根据 ID 查询文件夹
   * @param id - 文件夹 ID
   * @returns 文件夹对象，如果不存在返回 null
   */
  async findById(id: string): Promise<Folder | null> {
    const result = await this.db.where('id', id).first()
    return result || null
  }

  /**
   * 根据路径查询文件夹
   * @param path - 文件夹路径
   * @returns 文件夹对象，如果不存在返回 null
   */
  async findByPath(path: string): Promise<Folder | null> {
    const result = await this.db.where('path', path).first()
    return result || null
  }

  /**
   * 查询所有文件夹
   * @returns 文件夹数组
   */
  async findAll(): Promise<Folder[]> {
    return await this.db.orderBy('sort_order', 'asc').orderBy('created_at', 'asc')
  }

  /**
   * 查询根级文件夹
   * @returns 根级文件夹数组
   */
  async findRootFolders(): Promise<Folder[]> {
    return await this.db
      .whereNull('parent_id')
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'asc')
  }

  /**
   * 查询子文件夹
   * @param parentId - 父文件夹 ID
   * @returns 子文件夹数组
   */
  async findChildren(parentId: string): Promise<Folder[]> {
    return await this.db
      .where('parent_id', parentId)
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'asc')
  }

  /**
   * 更新文件夹
   * @param id - 文件夹 ID
   * @param params - 更新参数
   * @returns 更新后的文件夹对象
   */
  async update(id: string, params: UpdateFolderParams): Promise<Folder | null> {
    const existing = await this.findById(id)
    if (!existing) {
      return null
    }

    const updateData: Partial<Folder> = {
      updated_at: this.now()
    }

    if (params.name !== undefined) {
      updateData.name = params.name
      // 重新计算路径
      const parentPath = existing.parent_id
        ? (await this.findById(existing.parent_id))?.path || null
        : null
      updateData.path = this.generatePath(parentPath, params.name)
    }

    if (params.parent_id !== undefined) {
      updateData.parent_id = params.parent_id
      // 重新计算路径
      const parentPath = params.parent_id
        ? (await this.findById(params.parent_id))?.path || null
        : null
      updateData.path = this.generatePath(parentPath, updateData.name || existing.name)
    }

    if (params.sort_order !== undefined) {
      updateData.sort_order = params.sort_order
    }

    await this.db.where('id', id).update(updateData)
    return await this.findById(id)
  }

  /**
   * 删除文件夹
   * @param id - 文件夹 ID
   * @returns true 表示删除成功
   */
  async delete(id: string): Promise<boolean> {
    // 检查是否有子文件夹
    const children = await this.findChildren(id)
    if (children.length > 0) {
      throw new Error('无法删除包含子文件夹的文件夹')
    }

    const count = await this.db.where('id', id).delete()
    return count > 0
  }

  /**
   * 递归删除文件夹及其所有子项
   * @param id - 文件夹 ID
   * @returns true 表示删除成功
   */
  async deleteRecursive(id: string): Promise<boolean> {
    const count = await this.db.where('id', id).delete()
    return count > 0
  }

  /**
   * 移动文件夹
   * @param id - 文件夹 ID
   * @param targetParentId - 目标父文件夹 ID（null 表示移动到根目录）
   * @returns 移动后的文件夹对象
   */
  async move(id: string, targetParentId: string | null): Promise<Folder | null> {
    return await this.update(id, { parent_id: targetParentId })
  }

  /**
   * 重命名文件夹
   * @param id - 文件夹 ID
   * @param newName - 新名称
   * @returns 重命名后的文件夹对象
   */
  async rename(id: string, newName: string): Promise<Folder | null> {
    return await this.update(id, { name: newName })
  }

  /**
   * 获取文件夹的完整路径（包含所有父级）
   * @param id - 文件夹 ID
   * @returns 路径数组，从根到当前文件夹
   */
  async getPathChain(id: string): Promise<Folder[]> {
    const chain: Folder[] = []
    let currentId: string | null = id

    while (currentId) {
      const folder = await this.findById(currentId)
      if (!folder) break
      chain.unshift(folder)
      currentId = folder.parent_id
    }

    return chain
  }
}

// 导出单例实例
export const folderRepository = new FolderRepository()
