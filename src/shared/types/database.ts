/**
 * 数据库实体类型定义
 *
 * 定义所有数据库表对应的 TypeScript 类型
 */

/**
 * 文件夹（目录）实体
 * 对应数据库表：folders
 */
export interface Folder {
  /** 唯一标识符（UUID） */
  id: string
  /** 文件夹名称 */
  name: string
  /** 父文件夹ID，null 表示根目录 */
  parent_id: string | null
  /** 相对于 content 目录的路径 */
  path: string
  /** 排序序号，用于自定义排序 */
  sort_order: number
  /** 创建时间戳（毫秒） */
  created_at: number
  /** 更新时间戳（毫秒） */
  updated_at: number
}

/**
 * 笔记实体
 * 对应数据库表：notes
 */
export interface Note {
  /** 唯一标识符（UUID） */
  id: string
  /** 笔记标题 */
  title: string
  /** 所属文件夹ID */
  folder_id: string
  /** Markdown 文件相对路径（相对于工作区） */
  content_path: string
  /** 纯文本内容（用于搜索） */
  content_plain: string
  /** 标签数组（JSON 字符串存储） */
  tags: string
  /** 是否收藏 */
  is_favorite: boolean
  /** 是否已删除（软删除） */
  is_deleted: boolean
  /** 排序序号 */
  sort_order: number
  /** 创建时间戳（毫秒） */
  created_at: number
  /** 更新时间戳（毫秒） */
  updated_at: number
  /** 最后访问时间戳（毫秒） */
  accessed_at: number
}

/**
 * 双向链接关系实体
 * 对应数据库表：note_links
 */
export interface NoteLink {
  /** 唯一标识符（UUID） */
  id: string
  /** 源笔记ID（引用者） */
  source_note_id: string
  /** 目标笔记ID（被引用者） */
  target_note_id: string
  /** 创建时间戳（毫秒） */
  created_at: number
}

/**
 * 树形节点类型
 * 用于前端目录树展示
 */
export interface TreeNode {
  /** 节点ID */
  id: string
  /** 节点类型：folder（文件夹）或 note（笔记） */
  type: 'folder' | 'note'
  /** 显示名称 */
  name: string
  /** 子节点（仅文件夹有） */
  children?: TreeNode[]
  /** 是否展开（仅文件夹有） */
  isExpanded?: boolean
  /** 是否选中 */
  isSelected: boolean
  /** 是否收藏（仅笔记有） */
  isFavorite?: boolean
  /** 标签列表（仅笔记有） */
  tags?: string[]
  /** 父节点ID */
  parentId: string | null
}

/**
 * 创建文件夹参数
 */
export interface CreateFolderParams {
  name: string
  parent_id: string | null
}

/**
 * 更新文件夹参数
 */
export interface UpdateFolderParams {
  name?: string
  parent_id?: string | null
  sort_order?: number
}

/**
 * 创建笔记参数
 */
export interface CreateNoteParams {
  title: string
  folder_id: string
  content?: string
}

/**
 * 更新笔记参数
 */
export interface UpdateNoteParams {
  title?: string
  folder_id?: string
  content_plain?: string
  tags?: string[]
  is_favorite?: boolean
  is_deleted?: boolean
  sort_order?: number
}

/**
 * 搜索笔记参数
 */
export interface SearchNotesParams {
  /** 搜索关键词（匹配标题和内容） */
  keyword?: string
  /** 文件夹ID（限定搜索范围） */
  folder_id?: string
  /** 标签筛选 */
  tags?: string[]
  /** 是否只搜索收藏 */
  is_favorite?: boolean
  /** 是否包含已删除 */
  include_deleted?: boolean
}

/**
 * 笔记列表项（简略信息）
 */
export interface NoteListItem {
  id: string
  title: string
  folder_id: string
  is_favorite: boolean
  tags: string[]
  updated_at: number
}
