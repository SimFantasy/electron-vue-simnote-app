import {
  minimizeWindow,
  maximizeWindow,
  hideWindow,
  isWindowMaximized,
  closeWindow
} from '@/services'
import { useAppStore } from '@/stores'

export function useWindowControl() {
  /**
   * Hooks
   */
  const appStore = useAppStore()

  /**
   * States
   */
  const isMaximized = ref(false)
  const isCloseToTray = ref(appStore.isCloseToTray)

  /**
   * Actions
   */
  // 最小化窗口方法
  const handleMinimize = async () => {
    await minimizeWindow()
  }

  // 最大化/还原窗口方法
  const handleToggleMaximize = async () => {
    await maximizeWindow()
    const isMax = await isWindowMaximized()
    if (isMax) {
      isMaximized.value = true
    } else {
      isMaximized.value = false
    }
  }

  // 隐藏/关闭窗口方法
  const haneleToggleCloseToTray = async () => {
    if (isCloseToTray.value) {
      await hideWindow()
    } else {
      await closeWindow()
    }
  }

  return {
    //States
    isMaximized,
    isCloseToTray,
    //Actions
    handleMinimize,
    handleToggleMaximize,
    haneleToggleCloseToTray
  }
}
