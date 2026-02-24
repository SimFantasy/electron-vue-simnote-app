import { ipcMain } from 'electron'
import { folderRepository } from '../services/database/repositories'
import type { CreateFolderParams, UpdateFolderParams } from '@shared/types'

/**
 * 注册文件夹相关的 IPC 处理器
 *
 * 提供文件夹的增删改查操作
 */
export function registerFolderIPC(): void {
  // 创建文件夹
  ipcMain.handle('folder:create', async (_, params: CreateFolderParams) => {
    try {
      const folder = await folderRepository.create(params)
      return { success: true, data: folder }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建文件夹失败'
      }
    }
  })

  // 根据 ID 获取文件夹
  ipcMain.handle('folder:getById', async (_, id: string) => {
    try {
      const folder = await folderRepository.findById(id)
      return { success: true, data: folder }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取文件夹失败'
      }
    }
  })

  // 获取所有文件夹
  ipcMain.handle('folder:getAll', async () => {
    try {
      const folders = await folderRepository.findAll()
      return { success: true, data: folders }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取文件夹列表失败'
      }
    }
  })

  // 获取根级文件夹
  ipcMain.handle('folder:getRoots', async () => {
    try {
      const folders = await folderRepository.findRootFolders()
      return { success: true, data: folders }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取根文件夹失败'
      }
    }
  })

  // 获取子文件夹
  ipcMain.handle('folder:getChildren', async (_, parentId: string) => {
    try {
      const folders = await folderRepository.findChildren(parentId)
      return { success: true, data: folders }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取子文件夹失败'
      }
    }
  })

  // 更新文件夹
  ipcMain.handle('folder:update', async (_, id: string, params: UpdateFolderParams) => {
    try {
      const folder = await folderRepository.update(id, params)
      return { success: true, data: folder }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新文件夹失败'
      }
    }
  })

  // 删除文件夹
  ipcMain.handle('folder:delete', async (_, id: string) => {
    try {
      const result = await folderRepository.delete(id)
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除文件夹失败'
      }
    }
  })

  // 移动文件夹
  ipcMain.handle('folder:move', async (_, id: string, targetParentId: string | null) => {
    try {
      const folder = await folderRepository.move(id, targetParentId)
      return { success: true, data: folder }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '移动文件夹失败'
      }
    }
  })

  // 重命名文件夹
  ipcMain.handle('folder:rename', async (_, id: string, newName: string) => {
    try {
      const folder = await folderRepository.rename(id, newName)
      return { success: true, data: folder }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '重命名文件夹失败'
      }
    }
  })
}
