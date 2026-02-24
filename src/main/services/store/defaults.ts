import type { Settings } from '../../../shared/types/settings'

/**
 * 应用默认配置
 * 当用户首次启动应用或重置设置时，将使用这些默认值
 */
export const defaultSettings: Settings = {
  general: {
    theme: 'system',
    language: 'zh-CN',
    workspacePath: ''
  },
  window: {
    minimizeToTray: true,
    closeToTray: false,
    startupWithSystem: false,
    startMinimized: false
  },
  editor: {
    fontFamily: 'system-ui',
    fontSize: 16,
    documentMode: 'page',
    showLineNumbers: true,
    showFloatingMenu: true,
    showDragHandle: true,
    enableBidirectionalLink: true
  },
  ai: {
    provider: 'openai',
    apiKey: '',
    apiEndpoint: '',
    model: 'gpt-4o-mini'
  },
  shortcuts: {}
}
