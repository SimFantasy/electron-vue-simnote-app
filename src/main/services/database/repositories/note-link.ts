import { getKnex } from '../index'
import { TABLE_NOTE_LINKS, TABLE_NOTES } from '../schema'
import type { NoteLink, Note } from '@shared/types'

/**
 * 双向链接数据访问对象（Repository）
 *
 * 管理笔记之间的引用关系
 * 提供入链（被引用）和出链（引用）查询
 */
export class NoteLinkRepository {
  /**
   * 获取 Knex 查询构建器
   */
  private get db() {
    return getKnex()(TABLE_NOTE_LINKS)
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
   * 创建双向链接
   * @param sourceNoteId - 源笔记ID（引用者）
   * @param targetNoteId - 目标笔记ID（被引用者）
   * @returns 创建的链接对象
   */
  async create(sourceNoteId: string, targetNoteId: string): Promise<NoteLink> {
    // 检查是否已存在
    const existing = await this.findLink(sourceNoteId, targetNoteId)
    if (existing) {
      return existing
    }

    const link: NoteLink = {
      id: this.generateId(),
      source_note_id: sourceNoteId,
      target_note_id: targetNoteId,
      created_at: this.now()
    }

    await this.db.insert(link)
    return link
  }

  /**
   * 批量创建链接
   * @param sourceNoteId - 源笔记ID
   * @param targetNoteIds - 目标笔记ID数组
   * @returns 创建的链接数组
   */
  async createBatch(sourceNoteId: string, targetNoteIds: string[]): Promise<NoteLink[]> {
    const links: NoteLink[] = []

    for (const targetId of targetNoteIds) {
      const link = await this.create(sourceNoteId, targetId)
      links.push(link)
    }

    return links
  }

  /**
   * 删除双向链接
   * @param sourceNoteId - 源笔记ID
   * @param targetNoteId - 目标笔记ID
   * @returns true 表示删除成功
   */
  async delete(sourceNoteId: string, targetNoteId: string): Promise<boolean> {
    const count = await this.db
      .where('source_note_id', sourceNoteId)
      .where('target_note_id', targetNoteId)
      .delete()
    return count > 0
  }

  /**
   * 删除笔记的所有出链
   * @param noteId - 笔记ID
   * @returns 删除的链接数量
   */
  async deleteBySource(noteId: string): Promise<number> {
    const count = await this.db.where('source_note_id', noteId).delete()
    return count
  }

  /**
   * 删除笔记的所有入链
   * @param noteId - 笔记ID
   * @returns 删除的链接数量
   */
  async deleteByTarget(noteId: string): Promise<number> {
    const count = await this.db.where('target_note_id', noteId).delete()
    return count
  }

  /**
   * 删除笔记的所有链接（入链和出链）
   * @param noteId - 笔记ID
   * @returns 删除的链接数量
   */
  async deleteAllByNote(noteId: string): Promise<number> {
    const count = await this.db
      .where('source_note_id', noteId)
      .orWhere('target_note_id', noteId)
      .delete()
    return count
  }

  /**
   * 查找特定链接
   * @param sourceNoteId - 源笔记ID
   * @param targetNoteId - 目标笔记ID
   * @returns 链接对象，如果不存在返回 null
   */
  async findLink(sourceNoteId: string, targetNoteId: string): Promise<NoteLink | null> {
    const result = await this.db
      .where('source_note_id', sourceNoteId)
      .where('target_note_id', targetNoteId)
      .first()
    return result || null
  }

  /**
   * 检查链接是否存在
   * @param sourceNoteId - 源笔记ID
   * @param targetNoteId - 目标笔记ID
   * @returns true 表示链接存在
   */
  async hasLink(sourceNoteId: string, targetNoteId: string): Promise<boolean> {
    const link = await this.findLink(sourceNoteId, targetNoteId)
    return link !== null
  }

  /**
   * 获取笔记的出链（该笔记引用了哪些笔记）
   * @param noteId - 笔记ID
   * @returns 被引用的笔记数组
   */
  async getOutgoingLinks(noteId: string): Promise<Note[]> {
    const knex = getKnex()

    return await knex(TABLE_NOTES)
      .select('notes.*')
      .join(TABLE_NOTE_LINKS, 'notes.id', 'note_links.target_note_id')
      .where('note_links.source_note_id', noteId)
      .where('notes.is_deleted', false)
  }

  /**
   * 获取笔记的入链（哪些笔记引用了该笔记）
   * @param noteId - 笔记ID
   * @returns 引用该笔记的笔记数组
   */
  async getIncomingLinks(noteId: string): Promise<Note[]> {
    const knex = getKnex()

    return await knex(TABLE_NOTES)
      .select('notes.*')
      .join(TABLE_NOTE_LINKS, 'notes.id', 'note_links.source_note_id')
      .where('note_links.target_note_id', noteId)
      .where('notes.is_deleted', false)
  }

  /**
   * 获取出链数量
   * @param noteId - 笔记ID
   * @returns 出链数量
   */
  async getOutgoingCount(noteId: string): Promise<number> {
    const result = (await this.db.where('source_note_id', noteId).count('id as count').first()) as {
      count: number
    }
    return result?.count || 0
  }

  /**
   * 获取入链数量
   * @param noteId - 笔记ID
   * @returns 入链数量
   */
  async getIncomingCount(noteId: string): Promise<number> {
    const result = (await this.db.where('target_note_id', noteId).count('id as count').first()) as {
      count: number
    }
    return result?.count || 0
  }

  /**
   * 同步笔记的链接关系
   * 根据笔记内容中的 mention 标记更新链接
   * @param noteId - 笔记ID
   * @param linkedNoteIds - 内容中引用的笔记ID数组
   */
  async syncLinks(noteId: string, linkedNoteIds: string[]): Promise<void> {
    // 1. 获取现有的出链
    const existingLinks = await this.db.where('source_note_id', noteId).select('target_note_id')
    const existingIds = existingLinks.map((l) => l.target_note_id)

    // 2. 计算需要添加和删除的链接
    const toAdd = linkedNoteIds.filter((id) => !existingIds.includes(id))
    const toDelete = existingIds.filter((id) => !linkedNoteIds.includes(id))

    // 3. 添加新链接
    for (const targetId of toAdd) {
      await this.create(noteId, targetId)
    }

    // 4. 删除旧链接
    for (const targetId of toDelete) {
      await this.delete(noteId, targetId)
    }
  }

  /**
   * 查找孤立的链接（指向已删除笔记的链接）
   * @returns 孤立链接数组
   */
  async findOrphanedLinks(): Promise<NoteLink[]> {
    const knex = getKnex()

    // 查找目标笔记已被删除的链接
    const orphaned = await knex(TABLE_NOTE_LINKS)
      .select('note_links.*')
      .leftJoin(TABLE_NOTES, 'note_links.target_note_id', 'notes.id')
      .whereNull('notes.id')
      .orWhere('notes.is_deleted', true)

    return orphaned
  }

  /**
   * 清理孤立的链接
   * @returns 清理的链接数量
   */
  async cleanupOrphanedLinks(): Promise<number> {
    const orphaned = await this.findOrphanedLinks()

    if (orphaned.length === 0) {
      return 0
    }

    const ids = orphaned.map((l) => l.id)
    const count = await this.db.whereIn('id', ids).delete()
    return count
  }

  /**
   * 获取笔记的链接统计
   * @param noteId - 笔记ID
   * @returns 入链数和出链数
   */
  async getLinkStats(noteId: string): Promise<{ incoming: number; outgoing: number }> {
    const [incoming, outgoing] = await Promise.all([
      this.getIncomingCount(noteId),
      this.getOutgoingCount(noteId)
    ])

    return { incoming, outgoing }
  }
}

// 导出单例实例
export const noteLinkRepository = new NoteLinkRepository()
