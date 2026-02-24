<script lang="ts" setup name="LayoutHeader">
import { APP_CONFIG } from '@/constants'
import logoImage from '@/assets/logo.svg'

import LayoutHeaderActions from './header-actions.vue'
</script>

<template>
  <header class="layout-header drag">
    <!-- Header Start -->
    <section class="header-start">
      <img :src="logoImage" :alt="APP_CONFIG.NAME" class="size-6" />
      <span class="header-title">{{ APP_CONFIG.NAME }}</span>
    </section>

    <!-- Header Main -->
    <section class="header-main"></section>

    <!-- Header End -->
    <section class="header-end nodrag">
      <LayoutHeaderActions />
    </section>
  </header>
</template>

<style scoped>
@reference '@/assets/styles/main.css';

.layout-header {
  @apply flex-x-4 justify-between px-4 w-full h-(--layout-header-height);

  .header-start {
    @apply flex-x-2 h-full;

    .header-title {
      @apply text-base text-stone-800;
    }
  }

  .header-main {
    @apply flex-1 h-full;
  }

  .header-end {
    @apply flex-end h-full;
  }
}
</style>
