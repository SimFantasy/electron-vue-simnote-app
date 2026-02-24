import { ipcMain } from 'electron'
import { noteRepository } from '../services/database/repositories'
import { fileSystemService } from '../services/file-system'
import type { CreateNoteParams, UpdateNoteParams, SearchNotesParams } from '@shared/types'

/**
 * 注册笔记相关的 IPC 处理器
 *
 * 提供笔记的增删改查、搜索等操作
 * 同时管理 Markdown 文件的读写
 */
export function registerNoteIPC(): void {
  // 创建笔记
  ipcMain.handle('note:create', async (_, params: CreateNoteParams, content: string = '') => {
    try {
      // 1. 创建数据库记录
      const note = await noteRepository.create(params, content)

      // 2. 写入 Markdown 文件
      const writeResult = await fileSystemService.writeMarkdown(note.content_path, content)
      if (!writeResult.success) {
        // 如果文件写入失败，删除数据库记录
        await noteRepository.deletePermanent(note.id)
        throw new Error(writeResult.error || '写入文件失败')
      }

      return { success: true, data: note }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建笔记失败'
      }
    }
  })

  // 根据 ID 获取笔记
  ipcMain.handle('note:getById', async (_, id: string) => {
    try {
      const note = await noteRepository.findById(id)
      if (!note) {
        return { success: false, error: '笔记不存在' }
      }

      // 同时读取 Markdown 内容
      let content = ''
      try {
        content = await fileSystemService.readMarkdown(note.content_path)
      } catch {
        // 文件可能不存在，返回空内容
      }

      return { success: true, data: { ...note, content } }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取笔记失败'
      }
    }
  })

  // 获取文件夹下的笔记
  ipcMain.handle(
    'note:getByFolder',
    async (_, folderId: string, includeDeleted: boolean = false) => {
      try {
        const notes = await noteRepository.findByFolder(folderId, includeDeleted)
        return { success: true, data: notes }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '获取笔记列表失败'
        }
      }
    }
  )

  // 获取所有笔记（简略信息）
  ipcMain.handle('note:getAllList', async () => {
    try {
      const notes = await noteRepository.findAllList()
      return { success: true, data: notes }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取笔记列表失败'
      }
    }
  })

  // 获取收藏的笔记
  ipcMain.handle('note:getFavorites', async () => {
    try {
      const notes = await noteRepository.findFavorites()
      return { success: true, data: notes }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取收藏笔记失败'
      }
    }
  })

  // 获取最近访问的笔记
  ipcMain.handle('note:getRecent', async (_, limit: number = 10) => {
    try {
      const notes = await noteRepository.findRecent(limit)
      return { success: true, data: notes }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取最近笔记失败'
      }
    }
  })

  // 搜索笔记
  ipcMain.handle('note:search', async (_, params: SearchNotesParams) => {
    try {
      const notes = await noteRepository.search(params)
      return { success: true, data: notes }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '搜索笔记失败'
      }
    }
  })

  // 更新笔记
  ipcMain.handle(
    'note:update',
    async (_, id: string, params: UpdateNoteParams, content?: string) => {
      try {
        // 1. 获取原笔记信息
        const oldNote = await noteRepository.findById(id, false)
        if (!oldNote) {
          return { success: false, error: '笔记不存在' }
        }

        // 2. 更新数据库记录
        const note = await noteRepository.update(id, params, content)
        if (!note) {
          return { success: false, error: '更新笔记失败' }
        }

        // 3. 如果内容有变化，更新 Markdown 文件
        if (content !== undefined) {
          // 如果文件路径变了，先移动文件
          if (oldNote.content_path !== note.content_path) {
            await fileSystemService.moveMarkdown(oldNote.content_path, note.content_path)
          }

          // 写入新内容
          const writeResult = await fileSystemService.writeMarkdown(note.content_path, content)
          if (!writeResult.success) {
            throw new Error(writeResult.error || '写入文件失败')
          }
        }

        return { success: true, data: note }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '更新笔记失败'
        }
      }
    }
  )

  // 删除笔记（软删除）
  ipcMain.handle('note:delete', async (_, id: string) => {
    try {
      const result = await noteRepository.delete(id)
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除笔记失败'
      }
    }
  })

  // 永久删除笔记
  ipcMain.handle('note:deletePermanent', async (_, id: string) => {
    try {
      // 1. 获取笔记信息
      const note = await noteRepository.findById(id, false)
      if (!note) {
        return { success: false, error: '笔记不存在' }
      }

      // 2. 删除 Markdown 文件
      await fileSystemService.deleteMarkdown(note.content_path)

      // 3. 删除相关图片
      const folderPath = note.content_path.replace('content/', '').replace(/\.md$/, '')
      await fileSystemService.deleteNoteImages(folderPath)

      // 4. 删除数据库记录
      await noteRepository.deletePermanent(id)

      return { success: true, data: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '永久删除笔记失败'
      }
    }
  })

  // 恢复已删除的笔记
  ipcMain.handle('note:restore', async (_, id: string) => {
    try {
      const note = await noteRepository.restore(id)
      return { success: true, data: note }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '恢复笔记失败'
      }
    }
  })

  // 移动笔记
  ipcMain.handle('note:move', async (_, id: string, targetFolderId: string) => {
    try {
      const note = await noteRepository.move(id, targetFolderId)
      return { success: true, data: note }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '移动笔记失败'
      }
    }
  })

  // 重命名笔记
  ipcMain.handle('note:rename', async (_, id: string, newTitle: string) => {
    try {
      const note = await noteRepository.rename(id, newTitle)
      return { success: true, data: note }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '重命名笔记失败'
      }
    }
  })

  // 切换收藏状态
  ipcMain.handle('note:toggleFavorite', async (_, id: string) => {
    try {
      const note = await noteRepository.toggleFavorite(id)
      return { success: true, data: note }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '切换收藏失败'
      }
    }
  })

  // 获取回收站笔记
  ipcMain.handle('note:getDeleted', async () => {
    try {
      const notes = await noteRepository.findDeleted()
      return { success: true, data: notes }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取回收站失败'
      }
    }
  })

  // 清空回收站
  ipcMain.handle('note:emptyTrash', async () => {
    try {
      // 1. 获取所有已删除的笔记
      const deletedNotes = await noteRepository.findDeleted()

      // 2. 删除每个笔记的文件和数据库记录
      for (const note of deletedNotes) {
        try {
          // 删除 Markdown 文件
          await fileSystemService.deleteMarkdown(note.content_path)

          // 删除图片
          const folderPath = note.content_path.replace('content/', '').replace(/\.md$/, '')
          await fileSystemService.deleteNoteImages(folderPath)

          // 删除数据库记录
          await noteRepository.deletePermanent(note.id)
        } catch (error) {
          console.error('[IPC] 删除笔记失败:', note.id, error)
        }
      }

      return { success: true, data: deletedNotes.length }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '清空回收站失败'
      }
    }
  })
}
