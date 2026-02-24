import { ElectronAPI } from '@electron-toolkit/preload'
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
  ImageInfo,
  Settings,
  ResponseData
} from '@shared/types'

// ==================== 设置 API 类型 ====================
interface SettingsAPI {
  getAll(): Promise<Settings>
  get<K extends keyof Settings>(key: K): Promise<Settings[K]>
  set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<boolean>
  setMultiple(settings: Partial<Settings>): Promise<boolean>
  reset(): Promise<boolean>
  getPath(): Promise<string>
}

// ==================== 窗口 API 类型 ====================
interface WindowAPI {
  minimize(): Promise<boolean>
  maximize(): Promise<boolean>
  close(): Promise<boolean>
  show(): Promise<boolean>
  hide(): Promise<boolean>
  isMaximized(): Promise<boolean>
  isMinimized(): Promise<boolean>
  isVisible(): Promise<boolean>
  setTitle(title: string): Promise<boolean>
  getTitle(): Promise<string>
}

// ==================== 文件夹 API 类型 ====================
interface FolderAPI {
  create(params: CreateFolderParams): Promise<ResponseData<Folder>>
  getById(id: string): Promise<ResponseData<Folder | null>>
  getAll(): Promise<ResponseData<Folder[]>>
  getRoots(): Promise<ResponseData<Folder[]>>
  getChildren(parentId: string): Promise<ResponseData<Folder[]>>
  update(id: string, params: UpdateFolderParams): Promise<ResponseData<Folder | null>>
  delete(id: string): Promise<ResponseData<boolean>>
  move(id: string, targetParentId: string | null): Promise<ResponseData<Folder | null>>
  rename(id: string, newName: string): Promise<ResponseData<Folder | null>>
}

// ==================== 笔记 API 类型 ====================
interface NoteWithContent extends Note {
  content?: string
}

interface NoteAPI {
  create(params: CreateNoteParams, content?: string): Promise<ResponseData<Note>>
  getById(id: string): Promise<ResponseData<NoteWithContent | null>>
  getByFolder(folderId: string, includeDeleted?: boolean): Promise<ResponseData<Note[]>>
  getAllList(): Promise<
    ResponseData<
      Array<Pick<Note, 'id' | 'title' | 'folder_id' | 'is_favorite' | 'tags' | 'updated_at'>>
    >
  >
  getFavorites(): Promise<ResponseData<Note[]>>
  getRecent(limit?: number): Promise<ResponseData<Note[]>>
  search(params: SearchNotesParams): Promise<ResponseData<Note[]>>
  update(id: string, params: UpdateNoteParams, content?: string): Promise<ResponseData<Note | null>>
  delete(id: string): Promise<ResponseData<boolean>>
  deletePermanent(id: string): Promise<ResponseData<boolean>>
  restore(id: string): Promise<ResponseData<Note | null>>
  move(id: string, targetFolderId: string): Promise<ResponseData<Note | null>>
  rename(id: string, newTitle: string): Promise<ResponseData<Note | null>>
  toggleFavorite(id: string): Promise<ResponseData<Note | null>>
  getDeleted(): Promise<ResponseData<Note[]>>
  emptyTrash(): Promise<ResponseData<number>>
}

// ==================== 双向链接 API 类型 ====================
interface NoteLinkAPI {
  create(sourceNoteId: string, targetNoteId: string): Promise<ResponseData<NoteLink>>
  delete(sourceNoteId: string, targetNoteId: string): Promise<ResponseData<boolean>>
  getOutgoing(noteId: string): Promise<ResponseData<Note[]>>
  getIncoming(noteId: string): Promise<ResponseData<Note[]>>
  getOutgoingCount(noteId: string): Promise<ResponseData<number>>
  getIncomingCount(noteId: string): Promise<ResponseData<number>>
  getStats(noteId: string): Promise<ResponseData<{ incoming: number; outgoing: number }>>
  sync(noteId: string, linkedNoteIds: string[]): Promise<ResponseData<boolean>>
  hasLink(sourceNoteId: string, targetNoteId: string): Promise<ResponseData<boolean>>
}

// ==================== 文件系统 API 类型 ====================
interface FileSystemAPI {
  initialize(workspacePath: string): Promise<ResponseData<boolean>>
  getWorkspacePath(): Promise<ResponseData<string>>
  readMarkdown(relativePath: string): Promise<ResponseData<string>>
  writeMarkdown(relativePath: string, content: string): Promise<ResponseData<string>>
  deleteMarkdown(relativePath: string): Promise<ResponseData<string>>
  moveMarkdown(oldPath: string, newPath: string): Promise<ResponseData<string>>
  exists(relativePath: string): Promise<ResponseData<boolean>>
  saveImage(options: ImageSaveOptions): Promise<ResponseData<ImageInfo>>
  deleteNoteImages(noteFolderPath: string): Promise<ResponseData<number>>
  createDirectory(relativePath: string): Promise<ResponseData<boolean>>
  deleteDirectory(relativePath: string, recursive?: boolean): Promise<ResponseData<boolean>>
  moveDirectory(oldPath: string, newPath: string): Promise<ResponseData<boolean>>
  selectWorkspace(): Promise<ResponseData<string | null>>
  showOpenDialog(
    options?: Electron.OpenDialogOptions
  ): Promise<ResponseData<Electron.OpenDialogReturnValue>>
  showSaveDialog(
    options?: Electron.SaveDialogOptions
  ): Promise<ResponseData<Electron.SaveDialogReturnValue>>
}

// ==================== 完整 API 类型 ====================
interface API {
  settings: SettingsAPI
  window: WindowAPI
  folder: FolderAPI
  note: NoteAPI
  noteLink: NoteLinkAPI
  fileSystem: FileSystemAPI
}

// 全局声明
declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}

export {}
