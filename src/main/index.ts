import { app } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { registerAllIPC } from './ipc'
import { windowManager } from './services/window'

/**
 * 应用主入口
 *
 * 初始化流程：
 * 1. 注册 IPC 处理器
 * 2. 创建主窗口
 * 3. 处理应用生命周期事件
 */

// 应用就绪
app.whenReady().then(() => {
  // 设置 Windows 应用用户模型 ID（任务栏显示）
  electronApp.setAppUserModelId('com.electron')

  // 注册所有 IPC 处理器
  registerAllIPC()

  // 监听新窗口创建事件，启用 F12 快捷键打开/关闭开发者工具
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 创建主窗口
  windowManager.createMainWindow()

  // macOS: 点击 dock 图标时重新创建窗口
  app.on('activate', function () {
    if (windowManager.getMainWindow() === null) {
      windowManager.createMainWindow()
    }
  })
})

// 所有窗口关闭时退出应用（macOS 除外）
// macOS 通常保持应用在后台运行直到用户按 Cmd+Q
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
