/**
 * useNoteData - 笔记数据业务逻辑
 */
import type {
  Note,
  Folder,
  CreateNoteParams,
  UpdateNoteParams,
  SearchNotesParams
} from '@shared/types'

import { useNoteStore } from '@/stores'
import * as noteService from '@/services/note'
import * as folderService from '@/services/folder'

export function useNoteData() {
  /**
   * Hooks
   */
  const noteStore = useNoteStore()
  const { notes, folders, favoriteNotes, deletedNotes, recentNotes, activeNoteId } =
    storeToRefs(noteStore)

  /**
   * Actions
   */

  // 查询笔记 ========

  // 根据ID获取笔记
  const getNotedById = async (id: string): Promise<Note | null> => {
    // 先从Store中获取笔记
    const cached = notes.value.find((n) => n.id === id)
    if (cached && !cached.is_deleted) return cached

    // 从服务端获取完整笔记数据
    const res = await noteService.getNoteById(id)
    if (res.success && res.data) return res.data

    // 如果服务端获取失败，则返回null
    return null
  }

  // 获取文件夹下的所有笔记
  const getNotesByFolder = async (folderId: string): Promise<Note[]> => {
    return notes.value.filter((n) => n.folder_id === folderId && !n.is_deleted)
  }

  // 获取所有未删除的笔记
  const getAllNotes = (): Note[] => {
    return notes.value.filter((n) => !n.is_deleted)
  }

  // 笔记查询
  const searchNotes = async (
    keyword: string,
    options?: Omit<SearchNotesParams, 'keyword'>
  ): Promise<Note[]> => {
    const res = await noteService.searchNotes({ keyword, ...options })
    if (res.success && res.data) return res.data
    return []
  }

  // 统计 ========

  // 获取收藏笔记数量
  const getFavoriteNoteCount = (): number => {
    return favoriteNotes.value.length
  }
  // 获取回收站笔记数量
  const getDeletedNoteCount = (): number => {
    return deletedNotes.value.length
  }

  // 获取文件夹下笔记数量
  const getNoteCountByFolder = (folderId: string): number => {
    return notes.value.filter((n) => n.folder_id === folderId && !n.is_deleted).length
  }

  // 获取最近笔记 ========

  // 获取最近更新的笔记
  const getRecentNotes = (limit: number = 10): Note[] => {
    return recentNotes.value.slice(0, limit)
  }

  // 最近访问的笔记
  const getRecentAccessedNotes = async (limit: number = 10): Promise<Note[]> => {
    const res = await noteService.getRecentNotes(limit)
    return res.success && res.data ? res.data : []
  }

  // 笔记 CRUD 操作 ========

  // 创建笔记
  const createNote = async (params: CreateNoteParams, content?: string): Promise<Note | null> => {
    const res = await noteService.createNote(params, content)
    if (res.success && res.data) {
      noteStore.addNote(res.data)
      return res.data
    }

    return null
  }

  // 更新笔记
  const updateNote = async (
    id: string,
    params: UpdateNoteParams,
    content?: string
  ): Promise<boolean> => {
    const res = await noteService.updateNote(id, params, content)
    if (res.success && res.data) {
      noteStore.updateNote(id, res.data)
      return true
    }
    return false
  }

  // 删除笔记到回收站
  const deleteNote = async (id: string): Promise<boolean> => {
    const res = await noteService.deleteNote(id)
    if (res.success) {
      noteStore.softDeleteNote(id)
      // 如果删除的是当前笔记，则清空当前笔记
      if (activeNoteId.value === id) {
        noteStore.clearActiveNote()
      }
      return true
    }
    return false
  }

  // 永久删除笔记
  const permanentDeleteNote = async (id: string): Promise<boolean> => {
    const res = await noteService.deleteNotePermanent(id)
    if (res.success) {
      noteStore.hardDeleteNote(id)
      if (activeNoteId.value === id) {
        noteStore.clearActiveNote()
      }
      return true
    }
    return false
  }

  // 文件夹 CRUD 操作 ========

  // 创建文件夹
  const createFolder = async (
    name: string,
    parentId: string | null = null
  ): Promise<Folder | null> => {
    const res = await folderService.createFolder({ name, parent_id: parentId })

    if (res.success && res.data) {
      noteStore.addFolder(res.data)
      return res.data
    }
    return null
  }

  // 重命名文件夹
  const renameFolder = async (id: string, newName: string): Promise<boolean> => {
    const res = await folderService.renameFolder(id, newName)
    if (res.success && res.data) {
      noteStore.updateFolder(id, { name: newName })
      return true
    }
    return false
  }

  // 删除文件夹
  const deleteFolder = async (id: string): Promise<boolean> => {
    // 获取文件夹下所有未删除笔记
    const notesInFolder = notes.value.filter((n) => n.folder_id === id && !n.is_deleted)

    // 获取所有子文件夹
    const childFolders = folders.value.filter((f) => f.parent_id === id)

    // 检查是否有内容
    const hasContent = notesInFolder.length > 0 || childFolders.length > 0

    // 如果有内容， 则判断
    if (hasContent) {
      // 删除偏好: 删除到回收站 或 阻止删除
      const isTrashMode = true

      if (!isTrashMode) {
        throw new Error('文件夹下存在内容，请先清空内容后再尝试删除')
      }

      // trash模式
      try {
        // 递归删除子文件夹及其内容
        for (const childFolder of childFolders) {
          await deleteFolder(childFolder.id)
        }

        // 将文件夹下所有笔记移动到回收站
        for (const note of notesInFolder) {
          await noteService.deleteNote(note.id)
        }

        // 删除文件夹
        const res = await folderService.deleteFolder(id)
        if (res.success) {
          noteStore.removeFolder(id)
          return true
        }

        return false
      } catch (error) {
        console.log('删除文件夹失败', error)
        throw new Error('删除文件夹失败')
      }
    }

    // 空文件夹直接删除
    const res = await folderService.deleteFolder(id)
    if (res.success) {
      noteStore.removeFolder(id)
      return true
    }

    return false
  }

  // 移动文件夹到指定父级文件夹
  const moveFolder = async (folderId: string, targetParentId: string | null): Promise<boolean> => {
    const res = await folderService.moveFolder(folderId, targetParentId)
    if (res.success && res.data) {
      noteStore.updateFolder(folderId, { parent_id: targetParentId })
      return true
    }
    return false
  }

  // 其他操作 ========

  // 移动笔记到指定文件夹
  const moveNoteToFolder = async (noteId: string, targetFolderId: string): Promise<boolean> => {
    const res = await noteService.moveNote(noteId, targetFolderId)
    if (res.success && res.data) {
      noteStore.updateNote(noteId, { folder_id: targetFolderId })
      return true
    }

    return false
  }

  // 重命名笔记
  const renameNote = async (id: string, newTitle: string): Promise<boolean> => {
    const res = await noteService.renameNote(id, newTitle)
    if (res.success && res.data) {
      noteStore.updateNote(id, { title: newTitle })
      return true
    }
    return false
  }

  // 切换笔记收藏状态
  const toggleFavorite = async (id: string): Promise<boolean | null> => {
    const res = await noteService.toggleNoteFavorite(id)
    if (res.success && res.data) {
      noteStore.updateNote(id, { is_favorite: res.data.is_favorite })
      return res.data.is_favorite
    }
    return null
  }

  // 获取回收站中所有笔记
  const getTrashNotes = async (): Promise<Note[]> => {
    const res = await noteService.getDeletedNotes()
    return res.success && res.data ? res.data : []
  }

  // 清空回收站笔记
  const emptyTrash = async (): Promise<number> => {
    const res = await noteService.emptyTrash()
    if (res.success && res.data && res.data > 0) {
      // 从Store中删除笔记
      noteStore.deletedNotes.forEach((note) => {
        noteStore.hardDeleteNote(note.id)
      })

      return res.data
    }

    return 0
  }

  // 数据加载/刷新 ========

  // 加载所有文件夹和笔记数据
  const loadAllData = async () => {
    const [foldersRes, notesRes] = await Promise.all([
      folderService.getAllFolders(),
      noteService.getAllNotesList()
    ])

    if (foldersRes.success && foldersRes.data) {
      noteStore.setFolders(foldersRes.data)
    }

    if (notesRes.success && notesRes.data) {
      noteStore.setNotes(notesRes.data as Note[])
    }
  }

  /**
   * Returns
   */
  return {
    // 查询
    getNotedById,
    getNotesByFolder,
    getAllNotes,
    searchNotes,
    // 统计
    getFavoriteNoteCount,
    getDeletedNoteCount,
    getNoteCountByFolder,
    // 最近
    getRecentNotes,
    getRecentAccessedNotes,
    // 笔记CRUD
    createNote,
    updateNote,
    deleteNote,
    permanentDeleteNote,
    // 文件夹CRUD
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
    // 其他
    moveNoteToFolder,
    renameNote,
    toggleFavorite,
    getTrashNotes,
    emptyTrash,
    // 数据加载/刷新
    loadAllData
  }
}
