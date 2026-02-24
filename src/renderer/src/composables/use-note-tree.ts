/**
 * useNoteTree - 笔记树形结构交互
 */

import type { TreeItem, ContextMenuItem } from '@nuxt/ui'
import type { Folder, Note, TreeNode } from '@shared/types'
import { useSortable } from '@vueuse/integrations/useSortable'
import { useDebounceFn } from '@vueuse/core'

import { useNoteStore } from '@/stores'
import { useNoteData } from './use-note-data'

/**
 * Types
 */
export interface UseNoteTreeOptions {
  // 选中项回调
  onSelect?: (item: { id: string; type: 'folder' | 'note' }) => void
  // 打开笔记回调
  onOpenNote?: (noteId: string) => void
  // 默认展开文件夹ID
  defaultExpoandedIds?: string[]
}

export interface ContextMenuState {
  visiable: boolean
  x: number
  y: number
  targetNode: TreeNode | null
}

export function useNoteTree(options: UseNoteTreeOptions = {}) {
  /**
   * Hooks
   */
  const noteStore = useNoteStore()
  const noteData = useNoteData()

  /**
   * States
   */
  // 树形嵌套结构
  const treeData = ref<TreeNode[]>([])
}
