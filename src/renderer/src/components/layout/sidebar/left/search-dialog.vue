<script lang="ts" setup name="SearchDialog">
import type { CommandPaletteGroup } from '@nuxt/ui'

const UModal = resolveComponent('UModal')
const UCommandPalette = resolveComponent('UCommandPalette')

/**
 * States
 */
const keyword = ref('')

const groups = ref<CommandPaletteGroup[]>([
  {
    id: 'notes',
    label: '笔记',
    items: [
      {
        id: '1',
        label: '第一条笔记',
        icon: 'tabler:file-description'
      },
      {
        id: '2',
        label: '第二条笔记',
        icon: 'tabler:file-description'
      },
      {
        id: '3',
        label: '第三条笔记',
        icon: 'tabler:file-description'
      },
      {
        id: '4',
        label: '第四条笔记',
        icon: 'tabler:file-description'
      }
    ]
  }
])
</script>

<template>
  <UModal>
    <slot />

    <template #content>
      <UCommandPalette :groups="groups" v-model="keyword" class="w-full h-80" />
    </template>
  </UModal>
</template>

<style scoped>
@reference '@/assets/styles/main.css';
</style>
