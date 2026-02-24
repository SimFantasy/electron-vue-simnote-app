/**
 * 应用设置类型定义
 */

// 常规设置
export interface GeneralSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  workspacePath: string
}

// 窗口行为设置
export interface WindowSettings {
  minimizeToTray: boolean
  closeToTray: boolean
  startupWithSystem: boolean
  startMinimized: boolean
}

// 编辑器设置
export interface EditorSettings {
  fontFamily: string
  fontSize: number
  documentMode: 'page' | 'boundless'
  showLineNumbers: boolean
  showFloatingMenu: boolean
  showDragHandle: boolean
  enableBidirectionalLink: boolean
}

// AI 配置
export interface AISettings {
  provider: 'openai' | 'anthropic' | 'custom'
  apiKey: string
  apiEndpoint: string
  model: string
}

// 快捷键设置
export interface ShortcutsSettings {
  [key: string]: string
}

// 完整设置
export interface Settings {
  general: GeneralSettings
  window: WindowSettings
  editor: EditorSettings
  ai: AISettings
  shortcuts: ShortcutsSettings
}
