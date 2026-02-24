import { useColorMode } from '@vueuse/core'
import { useSettingsStore } from './settings'
import { ColorModeType } from '@/types'

export const useAppStore = defineStore('app', () => {
  /**
   * Hooks
   */
  const { store } = useColorMode({ emitAuto: true })
  const settingsStore = useSettingsStore()

  /**
   * States
   */
  // 左侧面板折叠状态
  const sidebarLeftCollapsed = ref(false)
  // 右侧面板折叠状态
  const sidebarRightCollapsed = ref(false)
  // 是否关闭窗口到系统托盘
  const isCloseToTray = ref(settingsStore.windowSettings?.closeToTray || false)

  /**
   * Getters
   */
  const colorMode = computed(() => store.value)

  /**
   * Actions
   */
  // 切换左侧面板折叠状态
  const toggleSidebarLeftCollapsed = () => {
    sidebarLeftCollapsed.value = !sidebarLeftCollapsed.value
  }

  // 切换右侧面板折叠状态
  const toggleSidebarRightCollapsed = () => {
    sidebarRightCollapsed.value = !sidebarRightCollapsed.value
  }

  // 设置是否关闭窗口到系统托盘
  const setCloseToTray = async (value: boolean) => {
    isCloseToTray.value = value
    await settingsStore.updateSetting('window', {
      ...settingsStore.windowSettings!,
      closeToTray: value
    })
  }

  // 设置主题色模式
  const setColorMode = async (mode: ColorModeType) => {
    store.value = mode
    await settingsStore.updateSetting('general', {
      ...settingsStore.generalSettings!,
      theme: mode === 'auto' ? 'system' : mode
    })
  }

  return {
    // States
    sidebarLeftCollapsed,
    sidebarRightCollapsed,
    isCloseToTray,

    // Getters
    colorMode,

    // Actions
    toggleSidebarLeftCollapsed,
    toggleSidebarRightCollapsed,
    setCloseToTray,
    setColorMode
  }
})
