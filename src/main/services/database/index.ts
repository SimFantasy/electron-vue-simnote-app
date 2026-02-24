/**
 * 数据库服务统一导出
 *
 * 使用 Knex 查询构建器管理 SQLite 数据库
 *
 * 主要模块：
 * - connection: 数据库连接管理
 * - schema: 表名常量
 * - migrations: 迁移文件目录
 */

// 数据库连接和 Knex 实例
export { dbManager, getKnex, initializeDatabase, closeDatabase, runMigrations } from './connection'

// 表名常量
export * from './schema'

// 导出 Knex 类型
export type { Knex } from 'knex'
