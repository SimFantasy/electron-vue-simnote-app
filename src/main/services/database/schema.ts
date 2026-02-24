/**
 * 数据库表名常量
 *
 * 使用 Knex 后，表结构在迁移文件中定义
 * 这里只保留表名常量，方便在代码中引用
 */

/** 文件夹表 */
export const TABLE_FOLDERS = 'folders'

/** 笔记表 */
export const TABLE_NOTES = 'notes'

/** 双向链接表 */
export const TABLE_NOTE_LINKS = 'note_links'

/** 全文搜索虚拟表 */
export const TABLE_NOTE_FTS = 'note_fts'

/** 迁移记录表（Knex 自动管理） */
export const TABLE_MIGRATIONS = 'knex_migrations'

/** 迁移锁表（Knex 自动管理） */
export const TABLE_MIGRATION_LOCK = 'knex_migrations_lock'

/**
 * 所有表名数组
 */
export const ALL_TABLES = [TABLE_FOLDERS, TABLE_NOTES, TABLE_NOTE_LINKS, TABLE_NOTE_FTS]
