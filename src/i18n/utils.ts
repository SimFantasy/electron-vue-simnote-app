/**
 * i18n 工具函数
 *
 * 使用 Vite 的 import.meta.glob 动态导入所有语言模块
 * 参考 AlgerMusicPlayer 的实现方式
 */

import type { LocaleMessages } from './types'

// Vite import.meta.glob 的类型声明（eager: true 模式）
declare global {
  interface ImportMeta {
    glob(pattern: string, options: { eager: true }): Record<string, Record<string, unknown>>
  }
}

/**
 * 加载指定语言的所有模块
 *
 * 使用 import.meta.glob 动态导入 locales/[locale]/*.ts 文件
 * 返回合并后的语言对象
 *
 * @param locale - 语言代码（如 'zh-cn'）
 * @returns 合并后的语言对象
 */
export async function loadLocaleMessages(locale: string): Promise<LocaleMessages> {
  // 动态导入所有模块
  const modules = import.meta.glob('./locales/**/*.ts', { eager: true })

  const messages: Record<string, unknown> = {}

  // 遍历所有模块，筛选出指定语言的模块
  for (const path in modules) {
    // 匹配路径：./locales/zh-cn/common.ts
    const match = path.match(new RegExp(`\\./locales/${locale}/(.+)\\.ts$`))
    if (match) {
      const moduleName = match[1] // 如 'common'
      const mod = modules[path] as { default: unknown }
      messages[moduleName] = mod.default
    }
  }

  return messages as unknown as LocaleMessages
}

/**
 * 同步加载语言（用于主进程）
 *
 * 主进程不能使用 import.meta.glob，需要直接导入
 */
export function loadLocaleMessagesSync(locale: string): LocaleMessages {
  // 同步加载所有模块
  const modules = import.meta.glob('./locales/**/*.ts', { eager: true })

  const messages: Record<string, unknown> = {}

  for (const path in modules) {
    const match = path.match(new RegExp(`\\./locales/${locale}/(.+)\\.ts$`))
    if (match) {
      const moduleName = match[1]
      const mod = modules[path] as { default: unknown }
      messages[moduleName] = mod.default
    }
  }

  return messages as unknown as LocaleMessages
}

/**
 * 获取所有支持的语言
 *
 * @returns 语言代码数组
 */
export function getSupportedLocales(): string[] {
  const modules = import.meta.glob('./locales/*/index.ts', { eager: true })
  const locales: string[] = []

  for (const path in modules) {
    const match = path.match(/\.\/locales\/(.+)\/index\.ts$/)
    if (match && !locales.includes(match[1])) {
      locales.push(match[1])
    }
  }

  return locales
}

/**
 * 深度合并对象
 * 用于合并语言模块
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object') {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      )
    } else {
      result[key] = source[key]
    }
  }

  return result
}
