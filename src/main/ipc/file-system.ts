import { ipcMain, dialog } from 'electron'
import { fileSystemService } from '../services/file-system'
import type { ImageSaveOptions } from '@shared/types'

/**
 * 注册文件系统相关的 IPC 处理器
 *
 * 提供文件操作、图片管理、目录选择等功能
 */
export function registerFileSystemIPC(): void {
  // 初始化工作区
  ipcMain.handle('fs:initialize', async (_, workspacePath: string) => {
    try {
      fileSystemService.initialize(workspacePath)
      return { success: true, data: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '初始化工作区失败'
      }
    }
  })

  // 获取工作区路径
  ipcMain.handle('fs:getWorkspacePath', async () => {
    try {
      const path = fileSystemService.getWorkspacePath()
      return { success: true, data: path }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取工作区路径失败'
      }
    }
  })

  // 读取 Markdown 文件
  ipcMain.handle('fs:readMarkdown', async (_, relativePath: string) => {
    try {
      const content = await fileSystemService.readMarkdown(relativePath)
      return { success: true, data: content }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '读取文件失败'
      }
    }
  })

  // 写入 Markdown 文件
  ipcMain.handle('fs:writeMarkdown', async (_, relativePath: string, content: string) => {
    try {
      const result = await fileSystemService.writeMarkdown(relativePath, content)
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '写入文件失败'
      }
    }
  })

  // 删除 Markdown 文件
  ipcMain.handle('fs:deleteMarkdown', async (_, relativePath: string) => {
    try {
      const result = await fileSystemService.deleteMarkdown(relativePath)
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除文件失败'
      }
    }
  })

  // 移动 Markdown 文件
  ipcMain.handle('fs:moveMarkdown', async (_, oldPath: string, newPath: string) => {
    try {
      const result = await fileSystemService.moveMarkdown(oldPath, newPath)
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '移动文件失败'
      }
    }
  })

  // 检查文件是否存在
  ipcMain.handle('fs:exists', async (_, relativePath: string) => {
    try {
      const exists = fileSystemService.exists(relativePath)
      return { success: true, data: exists }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '检查文件失败'
      }
    }
  })

  // 保存图片
  ipcMain.handle('fs:saveImage', async (_, options: ImageSaveOptions) => {
    try {
      const imageInfo = await fileSystemService.saveImage(options)
      return { success: true, data: imageInfo }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存图片失败'
      }
    }
  })

  // 删除笔记的所有图片
  ipcMain.handle('fs:deleteNoteImages', async (_, noteFolderPath: string) => {
    try {
      const count = await fileSystemService.deleteNoteImages(noteFolderPath)
      return { success: true, data: count }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除图片失败'
      }
    }
  })

  // 创建目录
  ipcMain.handle('fs:createDirectory', async (_, relativePath: string) => {
    try {
      await fileSystemService.createDirectory(relativePath)
      return { success: true, data: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建目录失败'
      }
    }
  })

  // 删除目录
  ipcMain.handle(
    'fs:deleteDirectory',
    async (_, relativePath: string, recursive: boolean = false) => {
      try {
        await fileSystemService.deleteDirectory(relativePath, recursive)
        return { success: true, data: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '删除目录失败'
        }
      }
    }
  )

  // 移动目录
  ipcMain.handle('fs:moveDirectory', async (_, oldPath: string, newPath: string) => {
    try {
      await fileSystemService.moveDirectory(oldPath, newPath)
      return { success: true, data: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '移动目录失败'
      }
    }
  })

  // 显示打开文件对话框
  ipcMain.handle('dialog:showOpenDialog', async (_, options: Electron.OpenDialogOptions = {}) => {
    try {
      const result = await dialog.showOpenDialog(options)
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '打开对话框失败'
      }
    }
  })

  // 显示保存文件对话框
  ipcMain.handle('dialog:showSaveDialog', async (_, options: Electron.SaveDialogOptions = {}) => {
    try {
      const result = await dialog.showSaveDialog(options)
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存对话框失败'
      }
    }
  })

  // 选择工作区目录
  ipcMain.handle('dialog:selectWorkspace', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: '选择工作区目录',
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: '选择文件夹'
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: true, data: null }
      }

      const selectedPath = result.filePaths[0]
      return { success: true, data: selectedPath }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '选择目录失败'
      }
    }
  })
}
