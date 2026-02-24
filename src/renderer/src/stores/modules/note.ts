/**
 * Note Store - 笔记数据管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Folder, Note, Heading } from '@shared/types'

export const useNoteStore = defineStore('note', () => {
  /**
   * States
   */

  /** 所有文件夹 */
  const folders = ref<Folder[]>([])

  /** 所有笔记 */
  const notes = ref<Note[]>([])

  /** 当前选中的笔记 ID */
  const activeNoteId = ref<string>('')

  /** 当前笔记内容 (Markdown) */
  const activeNoteContent = ref<string>('')

  /** 当前笔记大纲 */
  const activeNoteOutline = ref<Heading[]>([])

  /** 内容是否已修改 */
  const hasContentChanged = ref(false)

  /** 是否正在加载 */
  const isLoading = ref(false)

  /**
   * Getters
   */

  /** 当前选中的笔记对象 */
  const activeNote = computed(() => {
    if (!activeNoteId.value) return null
    return notes.value.find((n) => n.id === activeNoteId.value) || null
  })

  /** 获取文件夹下的笔记 */
  const getNotesByFolderId = computed(() => {
    return (folderId: string) => {
      return notes.value.filter((n) => n.folder_id === folderId && !n.is_deleted)
    }
  })

  /** 收藏的笔记 */
  const favoriteNotes = computed(() => {
    return notes.value.filter((n) => n.is_favorite && !n.is_deleted)
  })

  /** 回收站的笔记 */
  const deletedNotes = computed(() => {
    return notes.value.filter((n) => n.is_deleted)
  })

  /** 最近的笔记（按更新时间） */
  const recentNotes = computed(() => {
    return notes.value
      .filter((n) => !n.is_deleted)
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, 10)
  })

  /**
   * Actions
   */

  /** 设置文件夹列表 */
  function setFolders(newFolders: Folder[]) {
    folders.value = newFolders
  }

  /** 设置笔记列表 */
  function setNotes(newNotes: Note[]) {
    notes.value = newNotes
  }

  /** 添加单个文件夹 */
  function addFolder(folder: Folder) {
    folders.value.push(folder)
  }

  /** 更新文件夹 */
  function updateFolder(id: string, updates: Partial<Folder>) {
    const index = folders.value.findIndex((f) => f.id === id)
    if (index > -1) {
      folders.value[index] = { ...folders.value[index], ...updates }
    }
  }

  /** 删除文件夹 */
  function removeFolder(id: string) {
    folders.value = folders.value.filter((f) => f.id !== id)
  }

  /** 添加单个笔记 */
  function addNote(note: Note) {
    notes.value.push(note)
  }

  /** 更新笔记 */
  function updateNote(id: string, updates: Partial<Note>) {
    const index = notes.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notes.value[index] = { ...notes.value[index], ...updates }
    }
  }

  /** 删除笔记（软删除） */
  function softDeleteNote(id: string) {
    const index = notes.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notes.value[index].is_deleted = true
    }
  }

  /** 永久删除笔记 */
  function hardDeleteNote(id: string) {
    notes.value = notes.value.filter((n) => n.id !== id)
  }

  /** 恢复笔记 */
  function restoreNote(id: string) {
    const index = notes.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notes.value[index].is_deleted = false
    }
  }

  /** 设置当前笔记 ID */
  function setActiveNoteId(id: string) {
    activeNoteId.value = id
  }

  /** 设置当前笔记内容 */
  function setActiveNoteContent(content: string) {
    activeNoteContent.value = content
  }

  /** 设置当前笔记大纲 */
  function setActiveNoteOutline(outline: Heading[]) {
    activeNoteOutline.value = outline
  }

  /** 标记内容已修改 */
  function markContentDirty() {
    hasContentChanged.value = true
  }

  /** 标记内容已保存 */
  function markContentSaved() {
    hasContentChanged.value = false
  }

  /** 设置加载状态 */
  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  /** 清空当前笔记状态 */
  function clearActiveNote() {
    activeNoteId.value = ''
    activeNoteContent.value = ''
    activeNoteOutline.value = []
    hasContentChanged.value = false
  }

  // ==========================================
  // Return
  // ==========================================

  return {
    // State
    folders,
    notes,
    activeNoteId,
    activeNoteContent,
    activeNoteOutline,
    hasContentChanged,
    isLoading,

    // Getters
    activeNote,
    getNotesByFolderId,
    favoriteNotes,
    deletedNotes,
    recentNotes,

    // Actions - 数据更新
    setFolders,
    setNotes,
    addFolder,
    updateFolder,
    removeFolder,
    addNote,
    updateNote,
    softDeleteNote,
    hardDeleteNote,
    restoreNote,

    // Actions - 当前笔记状态
    setActiveNoteId,
    setActiveNoteContent,
    setActiveNoteOutline,
    markContentDirty,
    markContentSaved,
    setLoading,
    clearActiveNote
  }
})
