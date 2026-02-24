/**
 * i18n 类型定义
 *
 * 定义语言文件的结构类型
 */

// 通用类型
export interface CommonTranslations {
  confirm: string
  cancel: string
  save: string
  delete: string
  edit: string
  create: string
  search: string
  setting: string
  close: string
  open: string
  rename: string
  copy: string
  paste: string
  cut: string
  duplicate: string
  favorite: string
  unfavorite: string
  loading: string
  error: string
  success: string
  warning: string
  info: string
}

// 托盘菜单
export interface TrayTranslations {
  showWindow: string
  openSettings: string
  quit: string
}

// 侧边栏
export interface SidebarTranslations {
  newNote: string
  newFolder: string
  newSubfolder: string
  renameFolder: string
  renameNote: string
  deleteFolder: string
  deleteNote: string
  moveTo: string
  copyTo: string
  allNotes: string
  favorites: string
  recent: string
  trash: string
  tags: string
  searchPlaceholder: string
  noResults: string
  expand: string
  collapse: string
}

// 编辑器
export interface EditorTranslations {
  placeholder: string
  untitled: string
  lastSaved: string
  saving: string
  aiContinue: string
  aiExtend: string
  aiReduce: string
  aiSummarize: string
  aiTranslate: string
  aiFix: string
  aiTitle: string
  wordCount: string
  charCount: string
  readingTime: string
}

// 设置
export interface SettingsTranslations {
  title: string
  general: string
  editor: string
  ai: string
  shortcuts: string
  about: string
  theme: {
    label: string
    system: string
    light: string
    dark: string
  }
  language: {
    label: string
    zhCN: string
  }
  workspace: {
    label: string
    placeholder: string
    browse: string
  }
  window: {
    title: string
    minimizeToTray: string
    closeToTray: string
    startupWithSystem: string
    startMinimized: string
  }
  editorSettings: {
    fontFamily: string
    fontSize: string
    documentMode: string
    pageMode: string
    boundlessMode: string
    showLineNumbers: string
    showFloatingMenu: string
    showDragHandle: string
    enableBidirectionalLink: string
  }
  aiSettings: {
    provider: string
    openai: string
    anthropic: string
    custom: string
    apiKey: string
    apiEndpoint: string
    model: string
    apiKeyPlaceholder: string
  }
}

// 对话框
export interface DialogTranslations {
  deleteConfirm: string
  deleteFolderConfirm: string
  renameTitle: string
  renamePlaceholder: string
  moveTitle: string
  saveChanges: string
  unsavedChanges: string
  save: string
  dontSave: string
  cancel: string
}

// 错误
export interface ErrorTranslations {
  generic: string
  notFound: string
  saveFailed: string
  loadFailed: string
  deleteFailed: string
  renameFailed: string
  moveFailed: string
  folderNotFound: string
  noteNotFound: string
  parentFolderNotFound: string
  folderHasChildren: string
  emptyTrashFailed: string
}

// 大纲
export interface OutlineTranslations {
  title: string
  empty: string
}

// 链接
export interface LinksTranslations {
  title: string
  incoming: string
  outgoing: string
  noIncoming: string
  noOutgoing: string
}

// 完整语言文件类型
export interface LocaleMessages {
  common: CommonTranslations
  tray: TrayTranslations
  sidebar: SidebarTranslations
  editor: EditorTranslations
  settings: SettingsTranslations
  dialog: DialogTranslations
  error: ErrorTranslations
  outline: OutlineTranslations
  links: LinksTranslations
}

// 支持的区域设置
export type SupportedLocales = 'zh-CN'

// 区域设置配置
export interface LocaleConfig {
  code: SupportedLocales
  name: string
  flag: string
}
