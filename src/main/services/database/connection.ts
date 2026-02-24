import knex from 'knex'
import type { Knex } from 'knex'

/**
 * Knex 数据库连接管理器
 *
 * 使用 Knex 的查询构建器管理 SQLite 数据库连接
 * 特性：
 * - 链式查询构建器
 * - 内置迁移系统
 * - TypeScript 类型支持
 * - 连接池管理
 */
class DatabaseManager {
  /** Knex 实例 */
  private knex: Knex | null = null

  /** 当前数据库路径 */
  private dbPath: string = ''

  /**
   * 初始化数据库连接
   * @param dbPath - 数据库文件路径
   * @returns Knex 实例
   */
  async initialize(dbPath: string): Promise<Knex> {
    if (this.knex) {
      return this.knex
    }

    this.dbPath = dbPath
    console.log('[Database] 初始化 Knex 连接:', dbPath)

    this.knex = knex({
      client: 'better-sqlite3',
      connection: {
        filename: dbPath
      },
      useNullAsDefault: true,
      migrations: {
        directory: './migrations',
        tableName: 'knex_migrations'
      },
      pool: {
        min: 1,
        max: 1
      },
      // 启用查询日志（仅开发环境）
      debug: process.env.NODE_ENV === 'development'
    })

    // 启用外键约束
    await this.knex.raw('PRAGMA foreign_keys = ON')

    // 启用 WAL 模式
    await this.knex.raw('PRAGMA journal_mode = WAL')

    console.log('[Database] Knex 连接初始化完成')
    return this.knex
  }

  /**
   * 获取 Knex 实例
   * @returns Knex 实例
   */
  getKnex(): Knex {
    if (!this.knex) {
      throw new Error('[Database] 数据库未初始化，请先调用 initialize()')
    }
    return this.knex
  }

  /**
   * 检查数据库是否已初始化
   * @returns true 表示已初始化
   */
  isInitialized(): boolean {
    return this.knex !== null
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.knex) {
      console.log('[Database] 关闭 Knex 连接')
      await this.knex.destroy()
      this.knex = null
    }
  }

  /**
   * 执行数据库迁移
   * 自动运行所有待处理的迁移文件
   */
  async migrate(): Promise<void> {
    const knex = this.getKnex()
    console.log('[Database] 开始执行数据库迁移...')

    await knex.migrate.latest()

    console.log('[Database] 数据库迁移完成')
  }

  /**
   * 回滚迁移
   * @param steps - 回滚步数，默认 1
   */
  async rollback(steps: number = 1): Promise<void> {
    const knex = this.getKnex()
    console.log(`[Database] 回滚 ${steps} 步迁移...`)

    await knex.migrate.rollback(undefined, true)

    console.log('[Database] 迁移回滚完成')
  }

  /**
   * 获取数据库路径
   * @returns 数据库文件的完整路径
   */
  getPath(): string {
    return this.dbPath
  }

  /**
   * 执行事务
   * @param callback - 在事务中执行的回调函数
   * @returns 回调函数的返回值
   */
  async transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    const knex = this.getKnex()
    return await knex.transaction(callback)
  }

  /**
   * 检查表是否存在
   * @param tableName - 表名
   * @returns true 表示表存在
   */
  async hasTable(tableName: string): Promise<boolean> {
    const knex = this.getKnex()
    return await knex.schema.hasTable(tableName)
  }
}

// 导出单例
export const dbManager = new DatabaseManager()

// 便捷导出
export const getKnex = () => dbManager.getKnex()
export const initializeDatabase = (path: string) => dbManager.initialize(path)
export const closeDatabase = () => dbManager.close()
export const runMigrations = () => dbManager.migrate()
