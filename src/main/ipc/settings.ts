import { ipcMain } from 'electron'
import { appStore } from '../services/store'
import type { Settings } from '../../shared/types/settings'

/**
 * 注册设置相关的 IPC 处理器
 *
 * 这些处理器允许渲染进程通过 IPC 与主进程通信，
 * 实现配置的读取和修改。
 *
 * 注册的通道：
 * - settings:getAll - 获取完整配置
 * - settings:get - 获取指定分类配置
 * - settings:set - 设置指定分类配置
 * - settings:setMultiple - 批量设置配置
 * - settings:reset - 重置配置为默认值
 * - settings:getPath - 获取配置文件路径
 */
export function registerSettingsIPC(): void {
  /**
   * 获取完整配置对象
   * 触发：window.api.settings.getAll()
   * 返回：Settings 对象
   */
  ipcMain.handle('settings:getAll', () => {
    return appStore.getAll()
  })

  /**
   * 获取指定分类的配置
   * 触发：window.api.settings.get('general')
   * 参数：key - 配置分类键名
   * 返回：对应分类的配置对象
   */
  ipcMain.handle('settings:get', (_, key: keyof Settings) => {
    return appStore.get(key)
  })

  /**
   * 设置指定分类的配置
   * 触发：window.api.settings.set('general', { theme: 'dark' })
   * 参数：
   *   - key: 配置分类键名
   *   - value: 要设置的配置值
   * 返回：true 表示成功
   */
  ipcMain.handle('settings:set', (_, key: keyof Settings, value: any) => {
    appStore.set(key, value)
    return true
  })

  /**
   * 批量设置多个配置
   * 触发：window.api.settings.setMultiple({ general: {...}, editor: {...} })
   * 参数：settings - 要更新的部分配置对象
   * 返回：true 表示成功
   */
  ipcMain.handle('settings:setMultiple', (_, settings: Partial<Settings>) => {
    appStore.setMultiple(settings)
    return true
  })

  /**
   * 重置所有配置为默认值
   * 触发：window.api.settings.reset()
   * 返回：true 表示成功
   */
  ipcMain.handle('settings:reset', () => {
    appStore.reset()
    return true
  })

  /**
   * 获取配置文件在磁盘上的存储路径
   * 触发：window.api.settings.getPath()
   * 返回：配置文件的完整路径
   */
  ipcMain.handle('settings:getPath', () => {
    return appStore.getPath()
  })
}
