<script lang="ts" setup name="LayoutSidebarRight">
import { useAppStore } from '@/stores'
import { cn } from '@/utils'

/**
 * Hooks
 */
const appStore = useAppStore()
</script>

<template>
  <aside
    :class="
      cn('layout-sidebar', {
        'hidden! w-0': appStore.sidebarRightCollapsed,
        'w-(--laytout-sidebar-right-width)': !appStore.sidebarRightCollapsed
      })
    "
  >
    layout sidebar right
  </aside>
</template>

<style scoped>
@reference '@/assets/styles/main.css';
</style>
