/**
 * 设置模块
 * 包含：设置面板各分类的文案
 */

export default {
  title: '设置',
  general: '常规',
  editor: '编辑器',
  ai: 'AI 配置',
  shortcuts: '快捷键',
  about: '关于',
  theme: {
    label: '主题',
    system: '跟随系统',
    light: '浅色',
    dark: '深色'
  },
  language: {
    label: '语言',
    zhCN: '简体中文'
  },
  workspace: {
    label: '工作区位置',
    placeholder: '选择工作区目录',
    browse: '浏览'
  },
  window: {
    title: '窗口行为',
    minimizeToTray: '最小化到托盘',
    closeToTray: '关闭到托盘',
    startupWithSystem: '跟随系统启动',
    startMinimized: '启动时最小化'
  },
  editorSettings: {
    fontFamily: '字体',
    fontSize: '字号',
    documentMode: '文档模式',
    pageMode: '页面模式',
    boundlessMode: '无界模式',
    showLineNumbers: '显示代码块行号',
    showFloatingMenu: '显示悬浮菜单',
    showDragHandle: '显示拖拽手柄',
    enableBidirectionalLink: '启用双向链接'
  },
  aiSettings: {
    provider: 'AI 提供商',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    custom: '自定义',
    apiKey: 'API Key',
    apiEndpoint: 'API 端点',
    model: '模型',
    apiKeyPlaceholder: '请输入您的 API Key'
  }
}
