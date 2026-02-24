<script lang="ts" setup name="Layout">
import LayoutHeader from '@/components/layout/header/index.vue'
import LayoutSidebarLeft from '@/components/layout/sidebar/left/index.vue'
import LayoutSidebarRight from '@/components/layout/sidebar/right/index.vue'
</script>

<template>
  <div class="layout-wrapper">
    <!-- Header -->
    <LayoutHeader />

    <!-- Main -->
    <main class="layout-main">
      <!-- Left Siderbar -->
      <LayoutSidebarLeft />

      <!-- Container -->
      <section class="layout-container">
        <RouterView v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </RouterView>
      </section>

      <!-- Right Siderbar -->
      <LayoutSidebarRight />
    </main>
  </div>
</template>

<style scoped>
@reference '@/assets/styles/main.css';

.layout-wrapper {
  @apply flex-y w-full h-screen border border-border bg-stone-100 rounded-md;

  .layout-main {
    @apply flex items-stretch justify-between gap-2 px-2 w-full h-[calc(100vh-var(--layout-header-height)-var(--spacing)*2)];

    .layout-sidebar {
      @apply flex-y h-full border border-border rounded-md bg-card;
    }
    .layout-container {
      @apply flex-1 h-full border border-border rounded-md bg-card overflow-y-auto;
    }
  }
}
</style>
