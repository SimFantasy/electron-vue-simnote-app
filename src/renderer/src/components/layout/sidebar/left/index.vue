<script lang="ts" setup name="LayoutSidebarLeft">
import { useAppStore } from '@/stores'
import { cn } from '@/utils'

import LayoutSidebarSearchbar from '@/components/layout/sidebar/left/sidebar-searchbar.vue'
import LayoutSidebarMainItems from '@/components/layout/sidebar/left/sidebar-main-items.vue'
import LayoutSidebarNoteItems from '@/components/layout/sidebar/left/sidebar-note-items.vue'

/**
 * Hooks
 */
const appStore = useAppStore()
</script>

<template>
  <aside
    :class="
      cn('layout-sidebar h-full', {
        'hidden! w-0': appStore.sidebarLeftCollapsed,
        'w-(--layout-sidebar-left-width)': !appStore.sidebarLeftCollapsed
      })
    "
  >
    <!-- Searchbar -->
    <LayoutSidebarSearchbar />

    <!-- Sidebar Main Items -->
    <LayoutSidebarMainItems />

    <!-- Sidebar Note Tree -->
    <LayoutSidebarNoteItems />
  </aside>
</template>

<style scoped>
@reference '@/assets/styles/main.css';
</style>
