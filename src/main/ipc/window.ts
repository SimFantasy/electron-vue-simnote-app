import { ipcMain } from 'electron'
import { windowManager } from '../services/window'

/**
 * 注册窗口控制相关的 IPC 处理器
 *
 * 这些处理器允许渲染进程控制窗口行为，
 * 包括最小化、最大化、关闭等操作。
 *
 * 注册的通道：
 * - window:minimize - 最小化窗口
 * - window:maximize - 最大化/恢复窗口
 * - window:close - 关闭窗口（实际为隐藏）
 * - window:show - 显示窗口
 * - window:hide - 隐藏窗口
 * - window:isMaximized - 检查窗口是否最大化
 * - window:isMinimized - 检查窗口是否最小化
 * - window:isVisible - 检查窗口是否可见
 * - window:setTitle - 设置窗口标题
 * - window:getTitle - 获取窗口标题
 */
export function registerWindowIPC(): void {
  /**
   * 最小化窗口
   * 触发：window.api.window.minimize()
   */
  ipcMain.handle('window:minimize', () => {
    windowManager.minimizeMainWindow()
    return true
  })

  /**
   * 最大化/恢复窗口
   * 触发：window.api.window.maximize()
   * 如果当前是最大化状态则恢复，否则最大化
   */
  ipcMain.handle('window:maximize', () => {
    windowManager.toggleMaximizeMainWindow()
    return true
  })

  /**
   * 关闭窗口（实际为隐藏到托盘）
   * 触发：window.api.window.close()
   */
  ipcMain.handle('window:close', () => {
    windowManager.closeMainWindow()
    return true
  })

  /**
   * 显示窗口
   * 触发：window.api.window.show()
   */
  ipcMain.handle('window:show', () => {
    windowManager.showMainWindow()
    return true
  })

  /**
   * 隐藏窗口
   * 触发：window.api.window.hide()
   */
  ipcMain.handle('window:hide', () => {
    windowManager.hideMainWindow()
    return true
  })

  /**
   * 检查窗口是否最大化
   * 触发：window.api.window.isMaximized()
   * 返回：true 表示已最大化
   */
  ipcMain.handle('window:isMaximized', () => {
    const win = windowManager.getMainWindow()
    return win?.isMaximized() ?? false
  })

  /**
   * 检查窗口是否最小化
   * 触发：window.api.window.isMinimized()
   * 返回：true 表示已最小化
   */
  ipcMain.handle('window:isMinimized', () => {
    const win = windowManager.getMainWindow()
    return win?.isMinimized() ?? false
  })

  /**
   * 检查窗口是否可见
   * 触发：window.api.window.isVisible()
   * 返回：true 表示可见
   */
  ipcMain.handle('window:isVisible', () => {
    const win = windowManager.getMainWindow()
    return win?.isVisible() ?? false
  })

  /**
   * 设置窗口标题
   * 触发：window.api.window.setTitle('新标题')
   * 参数：title - 新标题
   */
  ipcMain.handle('window:setTitle', (_, title: string) => {
    windowManager.setTitle(title)
    return true
  })

  /**
   * 获取窗口标题
   * 触发：window.api.window.getTitle()
   * 返回：当前窗口标题
   */
  ipcMain.handle('window:getTitle', () => {
    return windowManager.getTitle()
  })
}
