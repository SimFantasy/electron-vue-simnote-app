import Store from 'electron-store'
import { defaultSettings } from './defaults'
import type { Settings } from '../../../shared/types/settings'

/**
 * 应用配置存储类
 *
 * 基于 electron-store 实现，提供以下功能：
 * - 配置持久化存储
 * - 配置验证（通过 schema）
 * - 配置变更监听
 * - 默认值管理
 *
 * 存储位置：
 * - Windows: %APPDATA%/electron-vue-note-app/settings.json
 * - macOS: ~/Library/Application Support/electron-vue-note-app/settings.json
 * - Linux: ~/.config/electron-vue-note-app/settings.json
 */
class AppStore {
  /** electron-store 实例 */
  private store: Store<Settings>

  /**
   * 构造函数
   * 初始化 electron-store，设置默认值和验证 schema
   */
  constructor() {
    this.store = new Store<Settings>({
      // 存储文件名
      name: 'settings',
      // 默认配置
      defaults: defaultSettings,
      // 配置验证 schema
      schema: {
        // 常规设置
        general: {
          type: 'object',
          properties: {
            // 主题：light（浅色）、dark（深色）、system（跟随系统）
            theme: { type: 'string', default: 'system' },
            // 语言：zh-CN（简体中文）
            language: { type: 'string', default: 'zh-CN' },
            // 工作区路径：笔记存储的根目录
            workspacePath: { type: 'string', default: '' }
          }
        },
        // 窗口行为设置
        window: {
          type: 'object',
          properties: {
            // 最小化到托盘：true 时最小化会隐藏到系统托盘
            minimizeToTray: { type: 'boolean', default: true },
            // 关闭到托盘：true 时关闭窗口会隐藏到系统托盘而非退出
            closeToTray: { type: 'boolean', default: false },
            // 跟随系统启动：开机时自动启动
            startupWithSystem: { type: 'boolean', default: false },
            // 启动时最小化：启动后直接最小化到托盘
            startMinimized: { type: 'boolean', default: false }
          }
        },
        // 编辑器设置
        editor: {
          type: 'object',
          properties: {
            // 字体：系统字体或自定义字体
            fontFamily: { type: 'string', default: 'system-ui' },
            // 字号：12-24px
            fontSize: { type: 'number', default: 16 },
            // 文档模式：page（页面模式，类似 Word）、boundless（无界模式）
            documentMode: { type: 'string', default: 'page' },
            // 显示代码块行号
            showLineNumbers: { type: 'boolean', default: true },
            // 显示悬浮菜单（选中文字时显示的快捷菜单）
            showFloatingMenu: { type: 'boolean', default: true },
            // 显示拖拽手柄（用于拖拽调整段落顺序）
            showDragHandle: { type: 'boolean', default: true },
            // 启用双向链接（[[ ]] 语法）
            enableBidirectionalLink: { type: 'boolean', default: true }
          }
        },
        // AI 配置
        ai: {
          type: 'object',
          properties: {
            // AI 提供商：openai、anthropic、custom
            provider: { type: 'string', default: 'openai' },
            // API Key：用户自行配置的 API 密钥（加密存储）
            apiKey: { type: 'string', default: '' },
            // 自定义 API 端点地址
            apiEndpoint: { type: 'string', default: '' },
            // 使用的 AI 模型
            model: { type: 'string', default: 'gpt-4o-mini' }
          }
        },
        // 快捷键设置
        shortcuts: {
          type: 'object',
          default: {}
        }
      }
    })
  }

  /**
   * 获取完整配置对象
   * @returns 当前所有设置的完整对象
   */
  getAll(): Settings {
    return this.store.store
  }

  /**
   * 获取指定分类的配置
   * @param key - 配置分类键名（如 'general', 'editor' 等）
   * @returns 对应分类的配置对象
   */
  get<K extends keyof Settings>(key: K): Settings[K] {
    return this.store.get(key)
  }

  /**
   * 设置指定分类的配置
   * @param key - 配置分类键名
   * @param value - 要设置的配置值
   */
  set<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.store.set(key, value)
  }

  /**
   * 批量设置多个配置
   * 用于同时更新多个配置项
   * @param settings - 要更新的部分配置对象
   */
  setMultiple(settings: Partial<Settings>): void {
    Object.entries(settings).forEach(([key, value]) => {
      this.store.set(key as keyof Settings, value)
    })
  }

  /**
   * 重置所有配置为默认值
   * 清除用户自定义配置，恢复出厂设置
   */
  reset(): void {
    this.store.clear()
    this.store.set(defaultSettings)
  }

  /**
   * 获取配置文件在磁盘上的存储路径
   * 用于调试或手动备份
   * @returns 配置文件的完整路径
   */
  getPath(): string {
    return this.store.path
  }

  /**
   * 监听指定配置项的变化
   * @param key - 要监听的配置键名
   * @param callback - 配置变化时的回调函数
   * @returns 取消监听的函数
   */
  onDidChange<K extends keyof Settings>(
    key: K,
    callback: (newValue: Settings[K] | undefined, oldValue: Settings[K] | undefined) => void
  ): () => void {
    return this.store.onDidChange(key, callback)
  }
}

/** 全局单例：应用配置存储实例 */
export const appStore = new AppStore()

/**
 * 便捷函数：获取完整配置
 * 等同于 appStore.getAll()
 */
export const getSettings = () => appStore.getAll()

/**
 * 便捷函数：获取指定分类配置
 * 等同于 appStore.get(key)
 */
export const getSetting = <K extends keyof Settings>(key: K) => appStore.get(key)

/**
 * 便捷函数：设置指定分类配置
 * 等同于 appStore.set(key, value)
 */
export const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) =>
  appStore.set(key, value)
