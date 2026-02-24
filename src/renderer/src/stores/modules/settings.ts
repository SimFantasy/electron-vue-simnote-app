import type { Settings } from '@shared/types'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<Settings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isReady = computed(() => settings.value !== null)

  const generalSettings = computed(() => settings.value?.general)
  const windowSettings = computed(() => settings.value?.window)
  const editorSettings = computed(() => settings.value?.editor)
  const aiSettings = computed(() => settings.value?.ai)
  const shortcutsSettings = computed(() => settings.value?.shortcuts)

  // Actions

  /**
   * 加载所有设置
   */
  async function loadSettings(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const data = await window.api.settings.getAll()
      settings.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载设置失败'
      console.error('加载设置失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取指定设置项
   */
  async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K] | null> {
    try {
      return await window.api.settings.get(key)
    } catch (err) {
      console.error(`获取设置 ${key} 失败:`, err)
      return null
    }
  }

  /**
   * 更新设置项
   */
  async function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<boolean> {
    try {
      await window.api.settings.set(key, value)
      // 更新本地状态
      if (settings.value) {
        settings.value[key] = value
      }
      return true
    } catch (err) {
      console.error(`更新设置 ${key} 失败:`, err)
      return false
    }
  }

  /**
   * 批量更新设置
   */
  async function updateSettings(settingsUpdate: Partial<Settings>): Promise<boolean> {
    try {
      await window.api.settings.setMultiple(settingsUpdate)
      // 更新本地状态
      if (settings.value) {
        Object.assign(settings.value, settingsUpdate)
      }
      return true
    } catch (err) {
      console.error('批量更新设置失败:', err)
      return false
    }
  }

  /**
   * 重置所有设置为默认值
   */
  async function resetSettings(): Promise<boolean> {
    try {
      await window.api.settings.reset()
      // 重新加载设置
      await loadSettings()
      return true
    } catch (err) {
      console.error('重置设置失败:', err)
      return false
    }
  }

  /**
   * 获取配置存储路径
   */
  async function getSettingsPath(): Promise<string | null> {
    try {
      return await window.api.settings.getPath()
    } catch (err) {
      console.error('获取配置路径失败:', err)
      return null
    }
  }

  return {
    // State
    settings,
    isLoading,
    error,

    // Getters
    isReady,
    generalSettings,
    windowSettings,
    editorSettings,
    aiSettings,
    shortcutsSettings,

    // Actions
    loadSettings,
    getSetting,
    updateSetting,
    updateSettings,
    resetSettings,
    getSettingsPath
  }
})
