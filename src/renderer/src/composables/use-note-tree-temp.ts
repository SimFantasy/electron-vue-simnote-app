/**
 * useNoteTree - 笔记树形结构交互逻辑
 *
 * 职责：
 * - 专用于左侧面板的树形展示和交互
 * - 处理展开/收起、拖拽、右键菜单
 * - 协调 useNoteData 进行数据操作
 *
 * 注意：不包含具体的数据修改逻辑，只处理 UI 交互状态
 */

import { ref, computed } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { useDebounceFn } from '@vueuse/core'
import type { TreeItem, ContextMenuItem } from '@nuxt/ui'
import { useNoteStore } from '@/stores'
import { useNoteData } from './use-note-data'
import type { Folder, Note, TreeNode } from '@shared/types'

export interface UseNoteTreeOptions {
  /** 选中项变化回调 */
  onSelect?: (item: { id: string; type: 'folder' | 'note' }) => void
  /** 打开笔记回调 */
  onOpenNote?: (noteId: string) => void
  /** 默认展开的文件夹ID */
  defaultExpandedIds?: string[]
}

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  targetNode: TreeNode | null
}

export function useNoteTree(options: UseNoteTreeOptions = {}) {
  const store = useNoteStore()
  const noteData = useNoteData()

  // ==========================================
  // State - 树形数据
  // ==========================================

  /** 树形结构数据（嵌套） */
  const treeData = ref<TreeNode[]>([])

  /** 展开的文件夹ID集合 */
  const expandedIds = ref<Set<string>>(new Set(options.defaultExpandedIds || []))

  /** 当前选中的节点ID */
  const selectedId = ref<string>('')

  // ==========================================
  // State - 右键菜单
  // ==========================================

  /** 右键菜单状态 */
  const contextMenu = ref<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetNode: null
  })

  // ==========================================
  // State - 剪贴板（用于移动/复制）
  // ==========================================

  /** 剪贴板状态 */
  const clipboard = ref<{
    type: 'folder' | 'note'
    id: string
    action: 'cut' | 'copy'
  } | null>(null)

  // ==========================================
  // Getters - 计算属性
  // ==========================================

  /** 展开状态映射（用于快速查询） */
  const expandedMap = computed(() => {
    const map = new Map<string, boolean>()
    expandedIds.value.forEach((id) => map.set(id, true))
    return map
  })

  /** 当前选中的节点 */
  const selectedNode = computed(() => {
    return findNodeById(treeData.value, selectedId.value)
  })

  // ==========================================
  // 工具函数 - 树形操作
  // ==========================================

  /**
   * 根据ID查找节点（递归）
   */
  function findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 构建树形结构
   * 将扁平的 folders 和 notes 转换为嵌套结构
   */
  function buildTreeData(): TreeNode[] {
    const { folders, notes } = store

    // 创建节点映射
    const nodeMap = new Map<string, TreeNode>()

    // 先创建所有文件夹节点
    folders.forEach((folder) => {
      nodeMap.set(folder.id, {
        id: folder.id,
        label: folder.name,
        type: 'folder',
        parentId: folder.parent_id,
        children: [],
        // TreeItem 需要的属性
        icon: 'i-heroicons-folder',
        defaultExpanded: expandedIds.value.has(folder.id)
      } as TreeNode)
    })

    // 创建所有笔记节点
    notes
      .filter((n) => !n.is_deleted)
      .forEach((note) => {
        nodeMap.set(note.id, {
          id: note.id,
          label: note.title,
          type: 'note',
          parentId: note.folder_id,
          isFavorite: note.is_favorite,
          icon: note.is_favorite ? 'i-heroicons-star' : 'i-heroicons-document-text'
        } as TreeNode)
      })

    // 构建嵌套结构
    const rootNodes: TreeNode[] = []

    nodeMap.forEach((node) => {
      if (node.parentId === null) {
        rootNodes.push(node)
      } else {
        const parent = nodeMap.get(node.parentId)
        if (parent && parent.children) {
          parent.children.push(node)
        } else {
          // 父文件夹不存在，放到根节点
          rootNodes.push(node)
        }
      }
    })

    // 按 sort_order 排序
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        // 文件夹排在笔记前面
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1
        }
        return 0
      })
    }

    sortNodes(rootNodes)
    nodeMap.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children)
      }
    })

    return rootNodes
  }

  /**
   * 刷新树形数据
   */
  function refreshTreeData() {
    treeData.value = buildTreeData()
  }

  // ==========================================
  // Actions - 展开/收起
  // ==========================================

  /**
   * 切换文件夹展开状态
   */
  function toggleExpand(folderId: string) {
    if (expandedIds.value.has(folderId)) {
      expandedIds.value.delete(folderId)
    } else {
      expandedIds.value.add(folderId)
    }
    // 触发更新
    refreshTreeData()
  }

  /**
   * 展开指定文件夹
   */
  function expandFolder(folderId: string) {
    expandedIds.value.add(folderId)
    refreshTreeData()
  }

  /**
   * 收起指定文件夹
   */
  function collapseFolder(folderId: string) {
    expandedIds.value.delete(folderId)
    refreshTreeData()
  }

  /**
   * 展开所有文件夹
   */
  function expandAll() {
    store.folders.forEach((f) => expandedIds.value.add(f.id))
    refreshTreeData()
  }

  /**
   * 收起所有文件夹
   */
  function collapseAll() {
    expandedIds.value.clear()
    refreshTreeData()
  }

  // ==========================================
  // Actions - 选择
  // ==========================================

  /**
   * 选中节点
   */
  function selectNode(id: string, type: 'folder' | 'note') {
    selectedId.value = id
    options.onSelect?.({ id, type })

    // 如果是笔记，触发打开
    if (type === 'note') {
      options.onOpenNote?.(id)
    }
  }

  // ==========================================
  // Actions - 右键菜单
  // ==========================================

  /**
   * 显示右键菜单
   */
  function showContextMenu(node: TreeNode, x: number, y: number) {
    contextMenu.value = {
      visible: true,
      x,
      y,
      targetNode: node
    }
  }

  /**
   * 隐藏右键菜单
   */
  function hideContextMenu() {
    contextMenu.value.visible = false
  }

  /**
   * 获取右键菜单项
   */
  function getContextMenuItems(node: TreeNode): ContextMenuItem[] {
    const items: ContextMenuItem[] = []

    if (node.type === 'folder') {
      items.push(
        {
          label: '新建笔记',
          icon: 'i-heroicons-document-plus',
          click: () => handleCreateNote(node.id)
        },
        {
          label: '新建文件夹',
          icon: 'i-heroicons-folder-plus',
          click: () => handleCreateFolder(node.id)
        },
        { type: 'separator' },
        { label: '重命名', icon: 'i-heroicons-pencil', click: () => handleRenameFolder(node.id) },
        {
          label: '删除',
          icon: 'i-heroicons-trash',
          color: 'error',
          click: () => handleDeleteFolder(node.id)
        }
      )
    } else {
      items.push(
        { label: '打开', icon: 'i-heroicons-eye', click: () => options.onOpenNote?.(node.id) },
        { type: 'separator' },
        { label: '重命名', icon: 'i-heroicons-pencil', click: () => handleRenameNote(node.id) },
        {
          label: node.isFavorite ? '取消收藏' : '收藏',
          icon: 'i-heroicons-star',
          click: () => handleToggleFavorite(node.id)
        },
        {
          label: '移动',
          icon: 'i-heroicons-arrow-right-circle',
          click: () => handleCut(node.id, 'note')
        },
        { type: 'separator' },
        {
          label: '删除',
          icon: 'i-heroicons-trash',
          color: 'error',
          click: () => handleDeleteNote(node.id)
        }
      )
    }

    return items
  }

  // ==========================================
  // Actions - 树形操作
  // ==========================================

  /**
   * 创建新笔记
   */
  async function handleCreateNote(folderId: string, title?: string) {
    const res = await noteData.createNote({
      title: title || '未命名笔记',
      folder_id: folderId
    })

    if (res) {
      // 展开父文件夹
      expandFolder(folderId)
      // 选中新笔记
      selectNode(res.id, 'note')
    }
  }

  /**
   * 创建新文件夹
   */
  async function handleCreateFolder(parentId: string | null, name?: string) {
    // 这里需要调用 folderService，建议通过 useNoteData 暴露
    // 或者直接在 useNoteData 中添加 createFolder 方法
    console.log('Create folder:', parentId, name)
  }

  /**
   * 重命名笔记
   */
  async function handleRenameNote(noteId: string, newTitle?: string) {
    if (!newTitle) {
      // 显示输入框获取新名称（由组件处理）
      return
    }
    await noteData.renameNote(noteId, newTitle)
    refreshTreeData()
  }

  /**
   * 重命名文件夹
   */
  async function handleRenameFolder(folderId: string, newName?: string) {
    console.log('Rename folder:', folderId, newName)
  }

  /**
   * 删除笔记
   */
  async function handleDeleteNote(noteId: string) {
    const confirmed = confirm('确定要删除这个笔记吗？')
    if (confirmed) {
      await noteData.deleteNote(noteId)
      refreshTreeData()
    }
  }

  /**
   * 删除文件夹
   */
  async function handleDeleteFolder(folderId: string) {
    const confirmed = confirm('确定要删除这个文件夹吗？文件夹内的笔记也会被删除。')
    if (confirmed) {
      console.log('Delete folder:', folderId)
    }
  }

  /**
   * 切换收藏状态
   */
  async function handleToggleFavorite(noteId: string) {
    await noteData.toggleFavorite(noteId)
    refreshTreeData()
  }

  // ==========================================
  // Actions - 剪贴板操作
  // ==========================================

  /**
   * 剪切
   */
  function handleCut(id: string, type: 'folder' | 'note') {
    clipboard.value = { id, type, action: 'cut' }
  }

  /**
   * 复制
   */
  function handleCopy(id: string, type: 'folder' | 'note') {
    clipboard.value = { id, type, action: 'copy' }
  }

  /**
   * 粘贴到文件夹
   */
  async function handlePaste(targetFolderId: string) {
    if (!clipboard.value) return

    const { id, type, action } = clipboard.value

    if (type === 'note') {
      if (action === 'cut') {
        await noteData.moveNoteToFolder(id, targetFolderId)
        clipboard.value = null
      } else {
        // 复制笔记 - 需要实现复制逻辑
        console.log('Copy note to:', targetFolderId)
      }
    }

    refreshTreeData()
  }

  // ==========================================
  // Actions - 拖拽处理
  // ==========================================

  /**
   * 处理拖拽更新
   * 被 useSortable 调用
   */
  async function handleDragUpdate(event: { oldIndex: number; newIndex: number; item: TreeNode }) {
    const { item } = event

    if (item.type === 'note') {
      // 笔记被拖拽，可能是排序或移动文件夹
      // 需要根据拖拽后的父级确定目标文件夹
      console.log('Drag note:', item.id)
    } else {
      // 文件夹被拖拽，更新排序
      console.log('Drag folder:', item.id)
    }
  }

  /**
   * 初始化拖拽（在组件中调用）
   */
  function initSortable(element: HTMLElement) {
    return useSortable(element, treeData.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onUpdate: (e) => {
        handleDragUpdate({
          oldIndex: e.oldIndex!,
          newIndex: e.newIndex!,
          item: treeData.value[e.oldIndex!]
        })
      }
    })
  }

  // ==========================================
  // 初始化
  // ==========================================

  // 监听 store 数据变化，自动刷新树
  // 使用 debounce 避免频繁更新
  const debouncedRefresh = useDebounceFn(refreshTreeData, 100)

  watch(() => store.folders, debouncedRefresh, { deep: true })
  watch(() => store.notes, debouncedRefresh, { deep: true })

  // 初始构建
  refreshTreeData()

  // ==========================================
  // Return
  // ==========================================

  return {
    // State
    treeData,
    expandedIds,
    selectedId,
    contextMenu,
    clipboard,

    // Getters
    expandedMap,
    selectedNode,

    // 展开/收起
    toggleExpand,
    expandFolder,
    collapseFolder,
    expandAll,
    collapseAll,

    // 选择
    selectNode,

    // 右键菜单
    showContextMenu,
    hideContextMenu,
    getContextMenuItems,

    // 树形操作
    handleCreateNote,
    handleCreateFolder,
    handleRenameNote,
    handleRenameFolder,
    handleDeleteNote,
    handleDeleteFolder,
    handleToggleFavorite,

    // 剪贴板
    handleCut,
    handleCopy,
    handlePaste,

    // 拖拽
    handleDragUpdate,
    initSortable,

    // 刷新
    refreshTreeData
  }
}

// ===============

// ==========================================
// Actions - 拖拽处理（完善版）
// ==========================================

/**
 * 处理拖拽排序和移动
 * @param dragEvent 拖拽事件
 */
async function handleDragUpdate(dragEvent: {
  item: TreeNode
  newIndex: number
  to: HTMLElement | null
}) {
  const { item, newIndex, to } = dragEvent

  if (item.type === 'note') {
    await handleNoteDrag(item, newIndex, to)
  } else {
    await handleFolderDrag(item, newIndex, to)
  }
}

/**
 * 处理笔记拖拽
 */
async function handleNoteDrag(
  noteNode: TreeNode,
  newIndex: number,
  dropTarget: HTMLElement | null
) {
  // 获取目标文件夹ID
  const targetFolderId = getTargetFolderId(dropTarget)

  if (!targetFolderId) {
    console.warn('无法确定目标文件夹')
    return
  }

  const currentFolderId = noteNode.parentId

  // 情况1：移动到不同文件夹
  if (targetFolderId !== currentFolderId) {
    const success = await noteData.moveNoteToFolder(noteNode.id, targetFolderId)
    if (success) {
      // 展开目标文件夹
      expandFolder(targetFolderId)
      refreshTreeData()
    }
  } else {
    // 情况2：同一文件夹内调整顺序
    await updateNoteSortOrder(noteNode.id, currentFolderId, newIndex)
  }
}

/**
 * 处理文件夹拖拽
 */
async function handleFolderDrag(
  folderNode: TreeNode,
  newIndex: number,
  dropTarget: HTMLElement | null
) {
  const targetParentId = getTargetFolderId(dropTarget)
  const currentParentId = folderNode.parentId

  // 情况1：移动到不同父文件夹
  if (targetParentId !== currentParentId) {
    // 防止循环嵌套（不能移动到自己或自己的子文件夹下）
    if (await wouldCreateCycle(folderNode.id, targetParentId)) {
      console.warn('不能将文件夹移动到自身或其子文件夹下')
      return
    }

    const success = await noteData.moveFolder(folderNode.id, targetParentId)
    if (success) {
      expandFolder(targetParentId || 'root')
      refreshTreeData()
    }
  } else {
    // 情况2：同一层级调整顺序
    await updateFolderSortOrder(folderNode.id, currentParentId, newIndex)
  }
}

/**
 * 从拖拽目标获取文件夹ID
 */
function getTargetFolderId(dropTarget: HTMLElement | null): string | null {
  if (!dropTarget) return null

  // 尝试从 DOM 属性获取文件夹ID
  const folderId = dropTarget.getAttribute('data-folder-id')
  if (folderId) return folderId

  // 如果目标是根容器，返回 null 表示根目录
  if (dropTarget.classList.contains('tree-root')) return null

  // 递归向上查找
  const parent = dropTarget.parentElement
  if (parent) return getTargetFolderId(parent)

  return null
}

/**
 * 检查是否会造成循环嵌套
 */
async function wouldCreateCycle(folderId: string, targetParentId: string | null): Promise<boolean> {
  if (!targetParentId) return false
  if (targetParentId === folderId) return true

  // 递归检查目标父文件夹的上级
  const parent = store.folders.find((f) => f.id === targetParentId)
  if (!parent) return false

  return wouldCreateCycle(folderId, parent.parent_id)
}

/**
 * 更新笔记排序
 */
async function updateNoteSortOrder(noteId: string, folderId: string | null, newIndex: number) {
  // 获取文件夹下所有笔记
  const siblings = folderId
    ? store.notes.filter((n) => n.folder_id === folderId && !n.is_deleted)
    : store.notes.filter((n) => !n.folder_id && !n.is_deleted)

  // 重新计算排序值
  const sortedNotes = [...siblings].sort((a, b) => a.sort_order - b.sort_order)

  // 移除当前笔记
  const currentIndex = sortedNotes.findIndex((n) => n.id === noteId)
  if (currentIndex > -1) {
    sortedNotes.splice(currentIndex, 1)
  }

  // 插入到新位置
  const movedNote = store.notes.find((n) => n.id === noteId)
  if (movedNote) {
    sortedNotes.splice(newIndex, 0, movedNote)
  }

  // 批量更新排序
  for (let i = 0; i < sortedNotes.length; i++) {
    if (sortedNotes[i].sort_order !== i) {
      await noteData.updateNote(sortedNotes[i].id, { sort_order: i })
    }
  }

  refreshTreeData()
}

/**
 * 更新文件夹排序
 */
async function updateFolderSortOrder(folderId: string, parentId: string | null, newIndex: number) {
  const siblings = parentId
    ? store.folders.filter((f) => f.parent_id === parentId)
    : store.folders.filter((f) => !f.parent_id)

  const sortedFolders = [...siblings].sort((a, b) => a.sort_order - b.sort_order)

  const currentIndex = sortedFolders.findIndex((f) => f.id === folderId)
  if (currentIndex > -1) {
    sortedFolders.splice(currentIndex, 1)
  }

  const movedFolder = store.folders.find((f) => f.id === folderId)
  if (movedFolder) {
    sortedFolders.splice(newIndex, 0, movedFolder)
  }

  // 批量更新
  for (let i = 0; i < sortedFolders.length; i++) {
    if (sortedFolders[i].sort_order !== i) {
      await noteData.updateFolder(sortedFolders[i].id, { sort_order: i })
    }
  }

  refreshTreeData()
}

// ==========================

// ==========================================
// Actions - 剪贴板操作（完善版）
// ==========================================

/**
 * 剪贴板状态
 */
interface ClipboardState {
  type: 'folder' | 'note'
  id: string
  action: 'cut' | 'copy'
  sourceFolderId: string | null
  timestamp: number
}

const clipboard = ref<ClipboardState | null>(null)

/**
 * 剪切
 */
function handleCut(id: string, type: 'folder' | 'note') {
  const node = findNodeById(treeData.value, id)
  if (!node) return

  clipboard.value = {
    type,
    id,
    action: 'cut',
    sourceFolderId: node.parentId,
    timestamp: Date.now()
  }

  // 视觉反馈：可以添加一个被剪切的标记
  console.log('Cut:', id, type)
}

/**
 * 复制
 */
function handleCopy(id: string, type: 'folder' | 'note') {
  const node = findNodeById(treeData.value, id)
  if (!node) return

  clipboard.value = {
    type,
    id,
    action: 'copy',
    sourceFolderId: node.parentId,
    timestamp: Date.now()
  }

  console.log('Copy:', id, type)
}

/**
 * 粘贴到文件夹
 */
async function handlePaste(targetFolderId: string | null) {
  if (!clipboard.value) {
    console.warn('剪贴板为空')
    return
  }

  const { type, id, action, sourceFolderId } = clipboard.value

  if (type === 'note') {
    await handleNotePaste(id, targetFolderId, action, sourceFolderId)
  } else {
    await handleFolderPaste(id, targetFolderId, action, sourceFolderId)
  }

  // 只有剪切操作才清空剪贴板
  if (action === 'cut') {
    clipboard.value = null
  }
}

/**
 * 处理笔记粘贴
 */
async function handleNotePaste(
  noteId: string,
  targetFolderId: string | null,
  action: 'cut' | 'copy',
  sourceFolderId: string | null
) {
  const originalNote = store.notes.find((n) => n.id === noteId)
  if (!originalNote) return

  if (action === 'cut') {
    // 剪切：移动笔记到目标文件夹
    if (targetFolderId !== sourceFolderId) {
      const success = await noteData.moveNoteToFolder(noteId, targetFolderId || '')
      if (success) {
        if (targetFolderId) expandFolder(targetFolderId)
        refreshTreeData()
      }
    } else {
      console.log('已在目标文件夹中')
    }
  } else {
    // 复制：创建新笔记，内容相同
    await cloneNote(originalNote, targetFolderId)
  }
}

/**
 * 处理文件夹粘贴
 */
async function handleFolderPaste(
  folderId: string,
  targetFolderId: string | null,
  action: 'cut' | 'copy',
  sourceFolderId: string | null
) {
  if (action === 'cut') {
    // 剪切：移动文件夹
    if (targetFolderId === folderId) {
      console.warn('不能将文件夹移动到自身下')
      return
    }

    if (await wouldCreateCycle(folderId, targetFolderId)) {
      console.warn('不能将文件夹移动到其子文件夹下')
      return
    }

    const success = await noteData.moveFolder(folderId, targetFolderId)
    if (success) {
      if (targetFolderId) expandFolder(targetFolderId)
      refreshTreeData()
    }
  } else {
    // 复制：递归复制文件夹及其内容
    await cloneFolder(folderId, targetFolderId)
  }
}

/**
 * 克隆笔记（复制并粘贴）
 */
async function cloneNote(
  sourceNote: Note,
  targetFolderId: string | null,
  newTitle?: string
): Promise<Note | null> {
  // 构建新标题
  const title = newTitle || `${sourceNote.title} (副本)`

  // 创建新笔记
  const newNote = await noteData.createNote({
    title,
    folder_id: targetFolderId || '',
    content: '' // 需要通过服务获取原笔记内容
  })

  if (newNote) {
    // 复制内容（如果有）
    const fullNote = await noteData.getNoteById(sourceNote.id)
    if (fullNote && 'content' in fullNote && fullNote.content) {
      await noteData.updateNote(newNote.id, {}, fullNote.content)
    }

    // 复制标签
    if (sourceNote.tags) {
      await noteData.updateNote(newNote.id, { tags: JSON.parse(sourceNote.tags) })
    }

    if (targetFolderId) expandFolder(targetFolderId)
    refreshTreeData()
    return newNote
  }

  return null
}

/**
 * 克隆文件夹（递归复制）
 */
async function cloneFolder(
  sourceFolderId: string,
  targetParentId: string | null
): Promise<Folder | null> {
  const sourceFolder = store.folders.find((f) => f.id === sourceFolderId)
  if (!sourceFolder) return null

  // 创建新文件夹
  const newFolder = await noteData.createFolder(`${sourceFolder.name} (副本)`, targetParentId)

  if (!newFolder) return null

  // 获取源文件夹下的所有笔记
  const notesInFolder = store.notes.filter((n) => n.folder_id === sourceFolderId && !n.is_deleted)

  // 复制所有笔记到新文件夹
  for (const note of notesInFolder) {
    await cloneNote(note, newFolder.id)
  }

  // 递归复制子文件夹
  const childFolders = store.folders.filter((f) => f.parent_id === sourceFolderId)
  for (const childFolder of childFolders) {
    await cloneFolder(childFolder.id, newFolder.id)
  }

  if (targetParentId) expandFolder(targetParentId)
  refreshTreeData()
  return newFolder
}

/**
 * 快捷克隆方法（同时执行复制+粘贴）
 */
async function handleClone(id: string, type: 'folder' | 'note') {
  if (type === 'note') {
    const note = store.notes.find((n) => n.id === id)
    if (note) {
      await cloneNote(note, note.folder_id)
    }
  } else {
    const folder = store.folders.find((f) => f.id === id)
    if (folder) {
      await cloneFolder(id, folder.parent_id)
    }
  }
}

// 在 return 中添加
return {
  // ... 其他方法
  handleClone
}
