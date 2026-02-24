<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/modules/settings'

const settingsStore = useSettingsStore()

onMounted(async () => {
  // 加载设置
  await settingsStore.loadSettings()
  console.log('设置加载完成:', settingsStore.settings)

  // 获取配置路径
  const path = await settingsStore.getSettingsPath()
  console.log('配置路径:', path)
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">配置系统测试</h1>

    <div v-if="settingsStore.isLoading" class="text-gray-500">加载中...</div>

    <div v-else-if="settingsStore.error" class="text-red-500">错误: {{ settingsStore.error }}</div>

    <div v-else-if="settingsStore.isReady" class="space-y-4">
      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-semibold mb-2">常规设置</h2>
        <p>主题: {{ settingsStore.generalSettings?.theme }}</p>
        <p>语言: {{ settingsStore.generalSettings?.language }}</p>
        <p>工作区: {{ settingsStore.generalSettings?.workspacePath || '未设置' }}</p>
      </div>

      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-semibold mb-2">窗口设置</h2>
        <p>最小化到托盘: {{ settingsStore.windowSettings?.minimizeToTray }}</p>
        <p>关闭到托盘: {{ settingsStore.windowSettings?.closeToTray }}</p>
      </div>

      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-semibold mb-2">编辑器设置</h2>
        <p>字体: {{ settingsStore.editorSettings?.fontFamily }}</p>
        <p>字号: {{ settingsStore.editorSettings?.fontSize }}</p>
        <p>文档模式: {{ settingsStore.editorSettings?.documentMode }}</p>
      </div>

      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-semibold mb-2">AI 配置</h2>
        <p>Provider: {{ settingsStore.aiSettings?.provider }}</p>
        <p>模型: {{ settingsStore.aiSettings?.model }}</p>
        <p>API Key: {{ settingsStore.aiSettings?.apiKey ? '已设置' : '未设置' }}</p>
      </div>
    </div>

    <div class="mt-4 space-x-2">
      <button
        @click="settingsStore.loadSettings()"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        重新加载
      </button>
      <button
        @click="
          settingsStore.updateSetting('general', {
            ...settingsStore.generalSettings!,
            theme: 'dark'
          })
        "
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        切换深色主题
      </button>
    </div>
  </div>
</template>
