/**
 * i18n 国际化主模块
 *
 * 同时支持主进程和渲染进程
 * - 主进程：使用 t() 函数获取文本（系统托盘等）
 * - 渲染进程：使用 vue-i18n 插件
 */

import { loadLocaleMessagesSync } from './utils'
import type { LocaleMessages, SupportedLocales } from './types'

// 当前语言（全局状态）
let currentLocale: SupportedLocales = 'zh-CN'

/**
 * 获取当前语言
 * @returns 当前语言代码
 */
export function getCurrentLocale(): SupportedLocales {
  return currentLocale
}

/**
 * 设置当前语言
 * @param locale - 语言代码
 */
export function setCurrentLocale(locale: SupportedLocales): void {
  currentLocale = locale
}

/**
 * 获取所有支持的语言
 * @returns 语言代码数组
 */
export function getSupportedLocales(): SupportedLocales[] {
  return ['zh-CN']
}

/**
 * 获取语言文件
 * @param locale - 语言代码
 * @returns 语言文件对象
 */
export function getMessages(locale: SupportedLocales = currentLocale): LocaleMessages {
  return loadLocaleMessagesSync(locale.toLowerCase().replace('-', '-'))
}

/**
 * 翻译函数（支持嵌套路径）
 *
 * 使用示例：
 * t('common.save') => '保存'
 * t('tray.showWindow') => '显示笔记'
 *
 * @param key - 翻译键（使用点号分隔的嵌套路径）
 * @param defaultValue - 找不到时的默认值
 * @returns 翻译后的文本
 */
export function t(key: string, defaultValue?: string): string {
  const keys = key.split('.')
  let value: unknown = getMessages()

  for (const k of keys) {
    if (value === null || value === undefined) {
      return defaultValue || key
    }
    value = (value as Record<string, unknown>)[k]
  }

  return typeof value === 'string' ? value : defaultValue || key
}

/**
 * 批量翻译（返回多个键的翻译）
 *
 * 使用示例：
 * tBatch(['common.save', 'common.cancel']) => ['保存', '取消']
 *
 * @param keys - 翻译键数组
 * @returns 翻译后的文本数组
 */
export function tBatch(keys: string[]): string[] {
  return keys.map((key) => t(key))
}

/**
 * 带插值的翻译（简单的占位符替换）
 *
 * 使用示例：
 * tWithParams('hello', { name: 'World' }) => 'Hello, World!'
 *
 * @param key - 翻译键
 * @param params - 替换参数
 * @returns 翻译后的文本
 */
export function tWithParams(key: string, params: Record<string, string | number>): string {
  let text = t(key)

  // 替换 {key} 格式的占位符
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(new RegExp(`{${k}}`, 'g'), String(v))
  })

  return text
}

// 导出类型
export type { LocaleMessages, SupportedLocales }
export * from './utils'
