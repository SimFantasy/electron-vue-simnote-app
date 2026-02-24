<script lang="ts" setup name="LayoutSidebarSearchbar">
import type { DropdownMenuItem } from '@nuxt/ui'

const items = computed<DropdownMenuItem[]>(() => [
  {
    label: '新建笔记分类',
    icon: 'tabler:folder-plus'
  },
  {
    label: '新建笔记',
    icon: 'tabler:file-plus'
  },
  {
    label: '导入笔记',
    icon: 'tabler:file-import'
  }
])
</script>

<template>
  <div class="flex-x-2 px-2 w-full h-12 rounded-t-md border-b border-border-border">
    <!-- 搜索框 -->
    <SearchDialog>
      <div class="group flex-1 flex-x-2 h-full">
        <UIcon name="tabler:search" class="size-5 text-stone-400 group-hover:text-stone-600" />
        <span
          class="flex-1 flex-start h-full text-sm text-stone-300 cursor-pointer group-hover:text-stone-500"
        >
          搜索...
        </span>
      </div>
    </SearchDialog>

    <!-- 下拉按钮 -->
    <UDropdownMenu :items="items" :content="{ align: 'end' }">
      <UButton icon="tabler:plus" variant="soft" color="neutral" size="sm" />
    </UDropdownMenu>
  </div>
</template>

<style scoped>
@reference '@/assets/styles/main.css';
</style>
