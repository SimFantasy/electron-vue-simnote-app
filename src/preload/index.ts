import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Settings } from '@shared/types'
import type {
  Folder,
  Note,
  NoteLink,
  CreateFolderParams,
  UpdateFolderParams,
  CreateNoteParams,
  UpdateNoteParams,
  SearchNotesParams,
  ImageSaveOptions,
  ImageInfo
} from '@shared/types'

// ==================== 设置 API ====================
const settingsAPI = {
  /** 获取完整配置 */
  getAll: (): Promise<Settings> => ipcRenderer.invoke('settings:getAll'),

  /** 获取指定配置项 */
  get: <K extends keyof Settings>(key: K): Promise<Settings[K]> =>
    ipcRenderer.invoke('settings:get', key),

  /** 设置配置项 */
  set: <K extends keyof Settings>(key: K, value: Settings[K]): Promise<boolean> =>
    ipcRenderer.invoke('settings:set', key, value),

  /** 批量设置配置 */
  setMultiple: (settings: Partial<Settings>): Promise<boolean> =>
    ipcRenderer.invoke('settings:setMultiple', settings),

  /** 重置配置 */
  reset: (): Promise<boolean> => ipcRenderer.invoke('settings:reset'),

  /** 获取配置存储路径 */
  getPath: (): Promise<string> => ipcRenderer.invoke('settings:getPath')
}

// ==================== 窗口 API ====================
const windowAPI = {
  /** 最小化窗口 */
  minimize: (): Promise<boolean> => ipcRenderer.invoke('window:minimize'),

  /** 最大化/恢复窗口 */
  maximize: (): Promise<boolean> => ipcRenderer.invoke('window:maximize'),

  /** 关闭窗口 */
  close: (): Promise<boolean> => ipcRenderer.invoke('window:close'),

  /** 显示窗口 */
  show: (): Promise<boolean> => ipcRenderer.invoke('window:show'),

  /** 隐藏窗口 */
  hide: (): Promise<boolean> => ipcRenderer.invoke('window:hide'),

  /** 检查是否最大化 */
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),

  /** 设置窗口标题 */
  setTitle: (title: string): Promise<boolean> => ipcRenderer.invoke('window:setTitle', title)
}

// ==================== 文件夹 API ====================
const folderAPI = {
  /** 创建文件夹 */
  create: (
    params: CreateFolderParams
  ): Promise<{ success: boolean; data?: Folder; error?: string }> =>
    ipcRenderer.invoke('folder:create', params),

  /** 根据 ID 获取文件夹 */
  getById: (id: string): Promise<{ success: boolean; data?: Folder | null; error?: string }> =>
    ipcRenderer.invoke('folder:getById', id),

  /** 获取所有文件夹 */
  getAll: (): Promise<{ success: boolean; data?: Folder[]; error?: string }> =>
    ipcRenderer.invoke('folder:getAll'),

  /** 获取根级文件夹 */
  getRoots: (): Promise<{ success: boolean; data?: Folder[]; error?: string }> =>
    ipcRenderer.invoke('folder:getRoots'),

  /** 获取子文件夹 */
  getChildren: (parentId: string): Promise<{ success: boolean; data?: Folder[]; error?: string }> =>
    ipcRenderer.invoke('folder:getChildren', parentId),

  /** 更新文件夹 */
  update: (
    id: string,
    params: UpdateFolderParams
  ): Promise<{ success: boolean; data?: Folder | null; error?: string }> =>
    ipcRenderer.invoke('folder:update', id, params),

  /** 删除文件夹 */
  delete: (id: string): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('folder:delete', id),

  /** 移动文件夹 */
  move: (
    id: string,
    targetParentId: string | null
  ): Promise<{ success: boolean; data?: Folder | null; error?: string }> =>
    ipcRenderer.invoke('folder:move', id, targetParentId),

  /** 重命名文件夹 */
  rename: (
    id: string,
    newName: string
  ): Promise<{ success: boolean; data?: Folder | null; error?: string }> =>
    ipcRenderer.invoke('folder:rename', id, newName)
}

// ==================== 笔记 API ====================
interface NoteWithContent extends Note {
  content?: string
}

const noteAPI = {
  /** 创建笔记 */
  create: (
    params: CreateNoteParams,
    content?: string
  ): Promise<{ success: boolean; data?: Note; error?: string }> =>
    ipcRenderer.invoke('note:create', params, content),

  /** 根据 ID 获取笔记（包含内容） */
  getById: (id: string): Promise<{ success: boolean; data?: NoteWithContent; error?: string }> =>
    ipcRenderer.invoke('note:getById', id),

  /** 获取文件夹下的笔记 */
  getByFolder: (
    folderId: string,
    includeDeleted?: boolean
  ): Promise<{ success: boolean; data?: Note[]; error?: string }> =>
    ipcRenderer.invoke('note:getByFolder', folderId, includeDeleted),

  /** 获取所有笔记（简略信息） */
  getAllList: (): Promise<{
    success: boolean
    data?: Array<Pick<Note, 'id' | 'title' | 'folder_id' | 'is_favorite' | 'tags' | 'updated_at'>>
    error?: string
  }> => ipcRenderer.invoke('note:getAllList'),

  /** 获取收藏的笔记 */
  getFavorites: (): Promise<{ success: boolean; data?: Note[]; error?: string }> =>
    ipcRenderer.invoke('note:getFavorites'),

  /** 获取最近访问的笔记 */
  getRecent: (limit?: number): Promise<{ success: boolean; data?: Note[]; error?: string }> =>
    ipcRenderer.invoke('note:getRecent', limit),

  /** 搜索笔记 */
  search: (
    params: SearchNotesParams
  ): Promise<{ success: boolean; data?: Note[]; error?: string }> =>
    ipcRenderer.invoke('note:search', params),

  /** 更新笔记 */
  update: (
    id: string,
    params: UpdateNoteParams,
    content?: string
  ): Promise<{ success: boolean; data?: Note | null; error?: string }> =>
    ipcRenderer.invoke('note:update', id, params, content),

  /** 删除笔记（软删除） */
  delete: (id: string): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('note:delete', id),

  /** 永久删除笔记 */
  deletePermanent: (id: string): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('note:deletePermanent', id),

  /** 恢复已删除的笔记 */
  restore: (id: string): Promise<{ success: boolean; data?: Note | null; error?: string }> =>
    ipcRenderer.invoke('note:restore', id),

  /** 移动笔记 */
  move: (
    id: string,
    targetFolderId: string
  ): Promise<{ success: boolean; data?: Note | null; error?: string }> =>
    ipcRenderer.invoke('note:move', id, targetFolderId),

  /** 重命名笔记 */
  rename: (
    id: string,
    newTitle: string
  ): Promise<{ success: boolean; data?: Note | null; error?: string }> =>
    ipcRenderer.invoke('note:rename', id, newTitle),

  /** 切换收藏状态 */
  toggleFavorite: (id: string): Promise<{ success: boolean; data?: Note | null; error?: string }> =>
    ipcRenderer.invoke('note:toggleFavorite', id),

  /** 获取回收站笔记 */
  getDeleted: (): Promise<{ success: boolean; data?: Note[]; error?: string }> =>
    ipcRenderer.invoke('note:getDeleted'),

  /** 清空回收站 */
  emptyTrash: (): Promise<{ success: boolean; data?: number; error?: string }> =>
    ipcRenderer.invoke('note:emptyTrash')
}

// ==================== 双向链接 API ====================
const noteLinkAPI = {
  /** 创建链接 */
  create: (
    sourceNoteId: string,
    targetNoteId: string
  ): Promise<{ success: boolean; data?: NoteLink; error?: string }> =>
    ipcRenderer.invoke('noteLink:create', sourceNoteId, targetNoteId),

  /** 删除链接 */
  delete: (
    sourceNoteId: string,
    targetNoteId: string
  ): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('noteLink:delete', sourceNoteId, targetNoteId),

  /** 获取出链 */
  getOutgoing: (noteId: string): Promise<{ success: boolean; data?: Note[]; error?: string }> =>
    ipcRenderer.invoke('noteLink:getOutgoing', noteId),

  /** 获取入链 */
  getIncoming: (noteId: string): Promise<{ success: boolean; data?: Note[]; error?: string }> =>
    ipcRenderer.invoke('noteLink:getIncoming', noteId),

  /** 获取出链数量 */
  getOutgoingCount: (
    noteId: string
  ): Promise<{ success: boolean; data?: number; error?: string }> =>
    ipcRenderer.invoke('noteLink:getOutgoingCount', noteId),

  /** 获取入链数量 */
  getIncomingCount: (
    noteId: string
  ): Promise<{ success: boolean; data?: number; error?: string }> =>
    ipcRenderer.invoke('noteLink:getIncomingCount', noteId),

  /** 获取链接统计 */
  getStats: (
    noteId: string
  ): Promise<{ success: boolean; data?: { incoming: number; outgoing: number }; error?: string }> =>
    ipcRenderer.invoke('noteLink:getStats', noteId),

  /** 同步链接 */
  sync: (
    noteId: string,
    linkedNoteIds: string[]
  ): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('noteLink:sync', noteId, linkedNoteIds),

  /** 检查链接是否存在 */
  hasLink: (
    sourceNoteId: string,
    targetNoteId: string
  ): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('noteLink:hasLink', sourceNoteId, targetNoteId)
}

// ==================== 文件系统 API ====================
const fileSystemAPI = {
  /** 初始化工作区 */
  initialize: (
    workspacePath: string
  ): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('fs:initialize', workspacePath),

  /** 获取工作区路径 */
  getWorkspacePath: (): Promise<{ success: boolean; data?: string; error?: string }> =>
    ipcRenderer.invoke('fs:getWorkspacePath'),

  /** 读取 Markdown 文件 */
  readMarkdown: (
    relativePath: string
  ): Promise<{ success: boolean; data?: string; error?: string }> =>
    ipcRenderer.invoke('fs:readMarkdown', relativePath),

  /** 写入 Markdown 文件 */
  writeMarkdown: (
    relativePath: string,
    content: string
  ): Promise<{ success: boolean; path?: string; error?: string }> =>
    ipcRenderer.invoke('fs:writeMarkdown', relativePath, content),

  /** 删除 Markdown 文件 */
  deleteMarkdown: (
    relativePath: string
  ): Promise<{ success: boolean; path?: string; error?: string }> =>
    ipcRenderer.invoke('fs:deleteMarkdown', relativePath),

  /** 移动 Markdown 文件 */
  moveMarkdown: (
    oldPath: string,
    newPath: string
  ): Promise<{ success: boolean; path?: string; error?: string }> =>
    ipcRenderer.invoke('fs:moveMarkdown', oldPath, newPath),

  /** 检查文件是否存在 */
  exists: (relativePath: string): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('fs:exists', relativePath),

  /** 保存图片 */
  saveImage: (
    options: ImageSaveOptions
  ): Promise<{ success: boolean; data?: ImageInfo; error?: string }> =>
    ipcRenderer.invoke('fs:saveImage', options),

  /** 删除笔记的所有图片 */
  deleteNoteImages: (
    noteFolderPath: string
  ): Promise<{ success: boolean; data?: number; error?: string }> =>
    ipcRenderer.invoke('fs:deleteNoteImages', noteFolderPath),

  /** 创建目录 */
  createDirectory: (
    relativePath: string
  ): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('fs:createDirectory', relativePath),

  /** 删除目录 */
  deleteDirectory: (
    relativePath: string,
    recursive?: boolean
  ): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('fs:deleteDirectory', relativePath, recursive),

  /** 移动目录 */
  moveDirectory: (
    oldPath: string,
    newPath: string
  ): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('fs:moveDirectory', oldPath, newPath),

  /** 选择工作区目录 */
  selectWorkspace: (): Promise<{ success: boolean; data?: string | null; error?: string }> =>
    ipcRenderer.invoke('dialog:selectWorkspace'),

  /** 显示打开文件对话框 */
  showOpenDialog: (
    options?: Electron.OpenDialogOptions
  ): Promise<{ success: boolean; data?: Electron.OpenDialogReturnValue; error?: string }> =>
    ipcRenderer.invoke('dialog:showOpenDialog', options),

  /** 显示保存文件对话框 */
  showSaveDialog: (
    options?: Electron.SaveDialogOptions
  ): Promise<{ success: boolean; data?: Electron.SaveDialogReturnValue; error?: string }> =>
    ipcRenderer.invoke('dialog:showSaveDialog', options)
}

// ==================== 合并所有 API ====================
const api = {
  settings: settingsAPI,
  window: windowAPI,
  folder: folderAPI,
  note: noteAPI,
  noteLink: noteLinkAPI,
  fileSystem: fileSystemAPI
}

// 使用 `contextBridge` API 将 Electron API 暴露给渲染进程
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

// 导出类型
type API = typeof api
export type { API }
