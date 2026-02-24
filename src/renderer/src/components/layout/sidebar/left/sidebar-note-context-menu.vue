<script lang="ts" setup name="SidebarNoteContextMenu">
import type { ContextMenuItem } from '@nuxt/ui'
import type { TreeNode } from '@shared/types'

/**
 * Defines
 */
const { note } = defineProps<{
  note: TreeNode
}>()

const UContextMenu = resolveComponent('UContextMenu')

/**
 * States
 */
const folderItems = ref<ContextMenuItem[][]>([
  [
    {
      label: '新建笔记',
      icon: 'tabler:file-plus'
    },
    {
      label: '新建子文件夹',
      icon: 'tabler:folder-plus'
    }
  ],
  [
    {
      label: '重命名',
      icon: 'tabler:edit'
    },
    {
      label: '复制',
      icon: 'i-tabler-copy'
    },
    {
      label: '粘贴',
      icon: 'tabler:clipboard'
    }
  ],
  [
    {
      label: '删除',
      icon: 'i-tabler-trash',
      color: 'error'
    }
  ]
])

const noteItems = ref<ContextMenuItem[][]>([
  [
    {
      label: note.isFavorite ? '取消收藏' : '收藏',
      icon: note.isFavorite ? 'tabler:star-filled' : 'tabler:star'
    }
  ],
  [
    {
      label: '重命名',
      icon: 'i-tabler-pencil'
    },
    {
      label: '复制',
      icon: 'i-tabler-copy'
    },
    {
      label: '克隆',
      icon: 'i-tabler-files'
    },
    {
      label: '粘贴',
      icon: 'i-tabler-clipboard'
    }
  ],
  [
    {
      label: '删除',
      icon: 'i-tabler-trash',
      color: 'error'
    }
  ]
])
</script>

<template>
  <UContextMenu :items="note.type === 'folder' ? folderItems : noteItems">
    <solt />
  </UContextMenu>
</template>

<style scoped>
@reference '@/assets/styles/main.css';
</style>
