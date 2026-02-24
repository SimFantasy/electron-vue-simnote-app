/**
 * 设置服务
 */

import type { Settings } from '@shared/types'

/**
 * 获取所有设置
 * @returns 完整设置对象
 */
export async function getAllSettings(): Promise<Settings> {
  return await window.api.settings.getAll()
}

/**
 * 获取指定分类的设置
 * @param key 设置分类键名
 * @returns 对应分类的设置
 */
export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
  return await window.api.settings.get(key)
}

/**
 * 设置指定分类的配置
 * @param key 设置分类键名
 * @param value 要设置的值
 * @returns 是否设置成功
 */
export async function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<boolean> {
  return await window.api.settings.set(key, value)
}

/**
 * 批量设置多个配置
 * @param settings 要更新的部分设置对象
 * @returns 是否设置成功
 */
export async function setMultipleSettings(settings: Partial<Settings>): Promise<boolean> {
  return await window.api.settings.setMultiple(settings)
}

/**
 * 重置所有设置为默认值
 * @returns 是否重置成功
 */
export async function resetSettings(): Promise<boolean> {
  return await window.api.settings.reset()
}

/**
 * 获取配置文件路径
 * @returns 配置文件的完整路径
 */
export async function getSettingsPath(): Promise<string> {
  return await window.api.settings.getPath()
}
