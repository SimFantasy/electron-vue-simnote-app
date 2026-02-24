<script lang="ts" setup name="LayoutHeaderActions">
import { useWindowControl } from '@/composables'
import { useAppStore } from '@/stores'

const USeparator = resolveComponent('USeparator')
const UButton = resolveComponent('UButton')

/**
 * Hooks
 */
const appStore = useAppStore()

const { isMaximized, handleMinimize, handleToggleMaximize, haneleToggleCloseToTray } =
  useWindowControl()
</script>

<template>
  <div class="flex-end gap-2 h-full">
    <!-- 左侧面板折叠 -->
    <UButton
      :icon="
        appStore.sidebarLeftCollapsed ? 'tabler:layout-sidebar' : 'tabler:layout-sidebar-filled'
      "
      variant="ghost"
      color="neutral"
      class="group hover:bg-stone-200 cursor-pointer"
      :ui="{ leadingIcon: 'size-5 text-stone-400 group-hover:text-stone-600' }"
      @click="appStore.toggleSidebarLeftCollapsed"
    />

    <!-- 右侧面板折叠 -->
    <UButton
      :icon="
        appStore.sidebarRightCollapsed
          ? 'tabler:layout-sidebar-right'
          : 'tabler:layout-sidebar-right-filled'
      "
      variant="ghost"
      color="neutral"
      class="group hover:bg-stone-200 cursor-pointer"
      :ui="{ leadingIcon: 'size-5 text-stone-400 group-hover:text-stone-600' }"
      @click="appStore.toggleSidebarRightCollapsed"
    />

    <!-- 设置 -->
    <UButton
      icon="tabler:settings-2"
      variant="ghost"
      color="neutral"
      class="group hover:bg-stone-200 cursor-pointer"
      :ui="{ leadingIcon: 'size-5 text-stone-400 group-hover:text-stone-600' }"
    />

    <!-- 分割线  -->
    <div class="py-3 h-full">
      <USeparator
        orientation="vertical"
        variant="neutral"
        class="[&>div]:data-[slot=border]:border-stone-300"
      />
    </div>

    <!-- 最小化窗口 -->
    <UButton
      icon="tabler:minus"
      variant="ghost"
      color="neutral"
      class="group hover:bg-stone-200 cursor-pointer"
      :ui="{ leadingIcon: 'size-5 text-stone-400 group-hover:text-stone-600' }"
      @click="handleMinimize"
    />

    <!-- 最大化窗口 -->
    <UButton
      :icon="isMaximized ? 'tabler:box-multiple' : 'tabler:crop-5-4'"
      variant="ghost"
      color="neutral"
      class="group hover:bg-stone-200 cursor-pointer"
      :ui="{ leadingIcon: 'size-5 text-stone-400 group-hover:text-stone-600' }"
      @click="handleToggleMaximize"
    />

    <!-- Hide Window -->
    <UButton
      icon="tabler:x"
      variant="ghost"
      color="neutral"
      class="group hover:bg-stone-200 cursor-pointer"
      :ui="{ leadingIcon: 'size-5 text-stone-400 group-hover:text-stone-600' }"
      @click="haneleToggleCloseToTray"
    />
  </div>
</template>

<style scoped>
@reference '@/assets/styles/main.css';
</style>
