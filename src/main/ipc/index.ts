import { registerSettingsIPC } from './settings'
import { registerWindowIPC } from './window'
import { registerFolderIPC } from './folder'
import { registerNoteIPC } from './note'
import { registerNoteLinkIPC } from './note-link'
import { registerFileSystemIPC } from './file-system'

/**
 * 注册所有 IPC 处理器
 *
 * 在主进程启动时调用，统一注册所有 IPC 通道处理器
 */
export function registerAllIPC(): void {
  // 注册设置相关的 IPC
  registerSettingsIPC()

  // 注册窗口控制相关的 IPC
  registerWindowIPC()

  // 注册存储层 IPC（文件夹、笔记、双向链接）
  registerFolderIPC()
  registerNoteIPC()
  registerNoteLinkIPC()

  // 注册文件系统 IPC
  registerFileSystemIPC()

  // TODO: 注册托盘 IPC
  // registerTrayIPC()
}

// 导出各个 IPC 注册函数（便于单独使用）
export {
  registerSettingsIPC,
  registerWindowIPC,
  registerFolderIPC,
  registerNoteIPC,
  registerNoteLinkIPC,
  registerFileSystemIPC
}
