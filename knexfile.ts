import type { Knex } from 'knex'

/**
 * Knex 配置文件
 *
 * 定义数据库连接配置和迁移设置
 */

interface KnexConfig {
  development: Knex.Config
  production: Knex.Config
}

const config: KnexConfig = {
  development: {
    client: 'better-sqlite3',
    connection: {
      // 数据库路径将在运行时动态设置
      filename: ':memory:'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/main/services/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts'
    },
    pool: {
      min: 1,
      max: 1
    }
  },

  production: {
    client: 'better-sqlite3',
    connection: {
      filename: ':memory:'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/main/services/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts'
    },
    pool: {
      min: 1,
      max: 1
    }
  }
}

export default config
