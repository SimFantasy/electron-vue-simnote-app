<script lang="ts" setup name="SidebarNoteItem">
import type { TreeNode } from '@shared/types'

/**
 * Types
 */

/**
 * Defines
 */
const { item } = defineProps<{
  item: TreeNode
}>()

/**
 * Getters
 */
const isFolder = computed(() => item.type === 'folder')
const noteIcon = computed(() => (isFolder.value ? 'tabler:folder' : 'tabler:file-text'))
</script>

<template>
  <SidebarNoteContextMenu :type="item.type" :note="item">
    <div class="gorup flex-x-2 px-4 py-2 w-full rounded-ms">
      <UIco :name="noteIcon" class="size-4 text-stone-400" />
      <span class="flex-1 flex-start text-sm text-stone-500">{{ item.name }}</span>

      <UButton icon="tabler:dots" size="xs" class="hidden trans-all group-hover:block" />
    </div>
  </SidebarNoteContextMenu>
</template>

<style scoped>
@reference '@/assets/styles/main.css';
</style>
