/**
 * 窗口服务
 */

/**
 * 最小化窗口
 * @returns 是否成功
 */
export async function minimizeWindow(): Promise<boolean> {
  return await window.api.window.minimize()
}

/**
 * 最大化/恢复窗口
 * @returns 是否成功
 */
export async function maximizeWindow(): Promise<boolean> {
  return await window.api.window.maximize()
}

/**
 * 关闭窗口
 * @returns 是否成功
 */
export async function closeWindow(): Promise<boolean> {
  return await window.api.window.close()
}

/**
 * 显示窗口
 * @returns 是否成功
 */
export async function showWindow(): Promise<boolean> {
  return await window.api.window.show()
}

/**
 * 隐藏窗口
 * @returns 是否成功
 */
export async function hideWindow(): Promise<boolean> {
  return await window.api.window.hide()
}

/**
 * 检查窗口是否最大化
 * @returns 是否最大化
 */
export async function isWindowMaximized(): Promise<boolean> {
  return await window.api.window.isMaximized()
}

/**
 * 检查窗口是否最小化
 * @returns 是否最小化
 */
export async function isWindowMinimized(): Promise<boolean> {
  return await window.api.window.isMinimized()
}

/**
 * 检查窗口是否可见
 * @returns 是否可见
 */
export async function isWindowVisible(): Promise<boolean> {
  return await window.api.window.isVisible()
}

/**
 * 设置窗口标题
 * @param title 标题
 * @returns 是否成功
 */
export async function setWindowTitle(title: string): Promise<boolean> {
  return await window.api.window.setTitle(title)
}

/**
 * 获取窗口标题
 * @returns 窗口标题
 */
export async function getWindowTitle(): Promise<string> {
  return await window.api.window.getTitle()
}
