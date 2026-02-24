import type { Knex } from 'knex'

/**
 * 初始迁移：创建所有表结构
 *
 * 创建以下表：
 * - folders: 文件夹表
 * - notes: 笔记表
 * - note_links: 双向链接表
 * - note_fts: 全文搜索虚拟表（FTS5）
 */

export async function up(knex: Knex): Promise<void> {
  console.log('[Migration] 执行 V1 迁移：创建表结构')

  // 1. 创建文件夹表
  await knex.schema.createTable('folders', (table) => {
    table.string('id').primary().comment('唯一标识符（UUID）')
    table.string('name').notNullable().comment('文件夹名称')
    table.string('parent_id').nullable().comment('父文件夹ID，null 表示根目录')
    table.string('path').notNullable().comment('相对于 content 目录的路径')
    table.integer('sort_order').defaultTo(0).comment('排序序号')
    table.bigInteger('created_at').notNullable().comment('创建时间戳（毫秒）')
    table.bigInteger('updated_at').notNullable().comment('更新时间戳（毫秒）')

    // 外键约束
    table.foreign('parent_id').references('id').inTable('folders').onDelete('CASCADE')

    // 索引
    table.index('parent_id', 'idx_folders_parent_id')
  })
  console.log('[Migration] 创建 folders 表完成')

  // 2. 创建笔记表
  await knex.schema.createTable('notes', (table) => {
    table.string('id').primary().comment('唯一标识符（UUID）')
    table.string('title').notNullable().comment('笔记标题')
    table.string('folder_id').notNullable().comment('所属文件夹ID')
    table.string('content_path').notNullable().comment('Markdown 文件相对路径')
    table.text('content_plain').nullable().comment('纯文本内容（用于搜索）')
    table.json('tags').defaultTo('[]').comment('标签数组（JSON 格式）')
    table.boolean('is_favorite').defaultTo(false).comment('是否收藏')
    table.boolean('is_deleted').defaultTo(false).comment('是否已删除（软删除）')
    table.integer('sort_order').defaultTo(0).comment('排序序号')
    table.bigInteger('created_at').notNullable().comment('创建时间戳（毫秒）')
    table.bigInteger('updated_at').notNullable().comment('更新时间戳（毫秒）')
    table.bigInteger('accessed_at').nullable().comment('最后访问时间戳（毫秒）')

    // 外键约束
    table.foreign('folder_id').references('id').inTable('folders').onDelete('CASCADE')

    // 索引
    table.index('folder_id', 'idx_notes_folder_id')
    table.index('is_deleted', 'idx_notes_is_deleted')
    table.index('is_favorite', 'idx_notes_is_favorite')
    table.index('updated_at', 'idx_notes_updated_at')
    table.index('accessed_at', 'idx_notes_accessed_at')
  })
  console.log('[Migration] 创建 notes 表完成')

  // 3. 创建双向链接表
  await knex.schema.createTable('note_links', (table) => {
    table.string('id').primary().comment('唯一标识符（UUID）')
    table.string('source_note_id').notNullable().comment('源笔记ID（引用者）')
    table.string('target_note_id').notNullable().comment('目标笔记ID（被引用者）')
    table.bigInteger('created_at').notNullable().comment('创建时间戳（毫秒）')

    // 外键约束
    table.foreign('source_note_id').references('id').inTable('notes').onDelete('CASCADE')
    table.foreign('target_note_id').references('id').inTable('notes').onDelete('CASCADE')

    // 唯一约束：防止重复链接（使用复合主键替代）
    table.primary(['source_note_id', 'target_note_id'])

    // 索引
    table.index('source_note_id', 'idx_note_links_source')
    table.index('target_note_id', 'idx_note_links_target')
  })
  console.log('[Migration] 创建 note_links 表完成')

  // 4. 创建全文搜索虚拟表（FTS5）
  // Knex 不直接支持虚拟表，使用原始 SQL
  await knex.raw(`
    CREATE VIRTUAL TABLE IF NOT EXISTS note_fts USING fts5(
      content_plain,
      tags,
      content='notes',
      content_rowid='id'
    )
  `)
  console.log('[Migration] 创建 note_fts 虚拟表完成')

  // 5. 创建 FTS 触发器
  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS note_fts_insert 
    AFTER INSERT ON notes
    BEGIN
      INSERT INTO note_fts(rowid, content_plain, tags)
      VALUES (new.id, new.content_plain, new.tags);
    END
  `)

  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS note_fts_update
    AFTER UPDATE ON notes
    BEGIN
      UPDATE note_fts SET 
        content_plain = new.content_plain,
        tags = new.tags
      WHERE rowid = new.id;
    END
  `)

  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS note_fts_delete
    AFTER DELETE ON notes
    BEGIN
      DELETE FROM note_fts WHERE rowid = old.id;
    END
  `)
  console.log('[Migration] 创建 FTS 触发器完成')

  console.log('[Migration] V1 迁移完成')
}

export async function down(knex: Knex): Promise<void> {
  console.log('[Migration] 回滚 V1 迁移')

  // 删除 FTS 触发器
  await knex.raw('DROP TRIGGER IF EXISTS note_fts_insert')
  await knex.raw('DROP TRIGGER IF EXISTS note_fts_update')
  await knex.raw('DROP TRIGGER IF EXISTS note_fts_delete')

  // 删除 FTS 虚拟表
  await knex.raw('DROP TABLE IF EXISTS note_fts')

  // 删除表（顺序很重要：先删除有外键引用的表）
  await knex.schema.dropTableIfExists('note_links')
  await knex.schema.dropTableIfExists('notes')
  await knex.schema.dropTableIfExists('folders')

  console.log('[Migration] V1 回滚完成')
}
