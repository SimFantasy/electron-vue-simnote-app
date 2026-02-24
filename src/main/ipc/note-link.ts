import { ipcMain } from 'electron'
import { noteLinkRepository } from '../services/database/repositories'

/**
 * 注册双向链接相关的 IPC 处理器
 *
 * 提供笔记间链接关系的查询和管理
 */
export function registerNoteLinkIPC(): void {
  // 创建链接
  ipcMain.handle('noteLink:create', async (_, sourceNoteId: string, targetNoteId: string) => {
    try {
      const link = await noteLinkRepository.create(sourceNoteId, targetNoteId)
      return { success: true, data: link }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建链接失败'
      }
    }
  })

  // 删除链接
  ipcMain.handle('noteLink:delete', async (_, sourceNoteId: string, targetNoteId: string) => {
    try {
      const result = await noteLinkRepository.delete(sourceNoteId, targetNoteId)
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除链接失败'
      }
    }
  })

  // 获取出链（该笔记引用了哪些笔记）
  ipcMain.handle('noteLink:getOutgoing', async (_, noteId: string) => {
    try {
      const notes = await noteLinkRepository.getOutgoingLinks(noteId)
      return { success: true, data: notes }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取出链失败'
      }
    }
  })

  // 获取入链（哪些笔记引用了该笔记）
  ipcMain.handle('noteLink:getIncoming', async (_, noteId: string) => {
    try {
      const notes = await noteLinkRepository.getIncomingLinks(noteId)
      return { success: true, data: notes }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取入链失败'
      }
    }
  })

  // 获取出链数量
  ipcMain.handle('noteLink:getOutgoingCount', async (_, noteId: string) => {
    try {
      const count = await noteLinkRepository.getOutgoingCount(noteId)
      return { success: true, data: count }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取出链数量失败'
      }
    }
  })

  // 获取入链数量
  ipcMain.handle('noteLink:getIncomingCount', async (_, noteId: string) => {
    try {
      const count = await noteLinkRepository.getIncomingCount(noteId)
      return { success: true, data: count }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取入链数量失败'
      }
    }
  })

  // 获取链接统计
  ipcMain.handle('noteLink:getStats', async (_, noteId: string) => {
    try {
      const stats = await noteLinkRepository.getLinkStats(noteId)
      return { success: true, data: stats }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取链接统计失败'
      }
    }
  })

  // 同步链接（根据笔记内容更新链接关系）
  ipcMain.handle('noteLink:sync', async (_, noteId: string, linkedNoteIds: string[]) => {
    try {
      await noteLinkRepository.syncLinks(noteId, linkedNoteIds)
      return { success: true, data: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '同步链接失败'
      }
    }
  })

  // 检查链接是否存在
  ipcMain.handle('noteLink:hasLink', async (_, sourceNoteId: string, targetNoteId: string) => {
    try {
      const exists = await noteLinkRepository.hasLink(sourceNoteId, targetNoteId)
      return { success: true, data: exists }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '检查链接失败'
      }
    }
  })
}
