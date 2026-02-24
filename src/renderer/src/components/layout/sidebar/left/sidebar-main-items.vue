<script lang="ts" setup name="LayoutSidebarMainItem"></script>

<template>
  <div class="flex-y-1 px-1 py-2 border-b border-border">
    <!-- 全部笔记 -->
    <UButton icon="tabler:notebook" label="全部笔记" variant="ghost" color="neutral" />

    <!-- 收藏夹 -->
    <UButton icon="tabler:star" label="收藏夹" variant="ghost" color="neutral" />

    <!-- 回收站 -->
    <UButton icon="tabler:trash" label="回收站" variant="ghost" color="neutral" />
  </div>
</template>

<style scoped>
@reference '@/assets/styles/main.css';
</style>
