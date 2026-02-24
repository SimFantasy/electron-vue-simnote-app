/**
 * 笔记服务
 */

import type {
  CreateNoteParams,
  Note,
  ResponseData,
  SearchNotesParams,
  UpdateNoteParams
} from '@shared/types'

interface NoteWithContent extends Note {
  content?: string
}

/**
 * 创建笔记
 * @param params 笔记参数
 * @param content 笔记内容（可选）
 * @returns 创建结果
 */
export async function createNote(
  params: CreateNoteParams,
  content?: string
): Promise<ResponseData<Note>> {
  return await window.api.note.create(params, content)
}

/**
 * 根据ID获取笔记
 * @param id 笔记ID
 * @returns 笔记详情（包含内容）
 */
export async function getNoteById(id: string): Promise<ResponseData<NoteWithContent | null>> {
  return await window.api.note.getById(id)
}

/**
 * 获取文件夹下的笔记列表
 * @param folderId 文件夹ID
 * @param includeDeleted 是否包含已删除的笔记
 * @returns 笔记列表
 */
export async function getNotesByFolder(
  folderId: string,
  includeDeleted?: boolean
): Promise<ResponseData<Note[]>> {
  return await window.api.note.getByFolder(folderId, includeDeleted)
}

/**
 * 获取所有笔记（简略信息）
 * @returns 笔记列表
 */
export async function getAllNotesList(): Promise<
  ResponseData<
    Array<Pick<Note, 'id' | 'title' | 'folder_id' | 'is_favorite' | 'tags' | 'updated_at'>>
  >
> {
  return await window.api.note.getAllList()
}

/**
 * 获取收藏的笔记
 * @returns 收藏的笔记列表
 */
export async function getFavoriteNotes(): Promise<ResponseData<Note[]>> {
  return await window.api.note.getFavorites()
}

/**
 * 获取最近访问的笔记
 * @param limit 限制数量（默认10条）
 * @returns 最近笔记列表
 */
export async function getRecentNotes(limit?: number): Promise<ResponseData<Note[]>> {
  return await window.api.note.getRecent(limit)
}

/**
 * 搜索笔记
 * @param params 搜索参数
 * @returns 搜索结果
 */
export async function searchNotes(params: SearchNotesParams): Promise<ResponseData<Note[]>> {
  return await window.api.note.search(params)
}

/**
 * 更新笔记
 * @param id 笔记ID
 * @param params 更新参数
 * @param content 笔记内容（可选）
 * @returns 更新后的笔记
 */
export async function updateNote(
  id: string,
  params: UpdateNoteParams,
  content?: string
): Promise<ResponseData<Note | null>> {
  return await window.api.note.update(id, params, content)
}

/**
 * 删除笔记（软删除）
 * @param id 笔记ID
 * @returns 是否删除成功
 */
export async function deleteNote(id: string): Promise<ResponseData<boolean>> {
  return await window.api.note.delete(id)
}

/**
 * 永久删除笔记
 * @param id 笔记ID
 * @returns 是否删除成功
 */
export async function deleteNotePermanent(id: string): Promise<ResponseData<boolean>> {
  return await window.api.note.deletePermanent(id)
}

/**
 * 恢复已删除的笔记
 * @param id 笔记ID
 * @returns 恢复后的笔记
 */
export async function restoreNote(id: string): Promise<ResponseData<Note | null>> {
  return await window.api.note.restore(id)
}

/**
 * 移动笔记到指定文件夹
 * @param id 笔记ID
 * @param targetFolderId 目标文件夹ID
 * @returns 移动后的笔记
 */
export async function moveNote(
  id: string,
  targetFolderId: string
): Promise<ResponseData<Note | null>> {
  return await window.api.note.move(id, targetFolderId)
}

/**
 * 重命名笔记
 * @param id 笔记ID
 * @param newTitle 新标题
 * @returns 重命名后的笔记
 */
export async function renameNote(id: string, newTitle: string): Promise<ResponseData<Note | null>> {
  return await window.api.note.rename(id, newTitle)
}

/**
 * 切换笔记收藏状态
 * @param id 笔记ID
 * @returns 切换后的笔记
 */
export async function toggleNoteFavorite(id: string): Promise<ResponseData<Note | null>> {
  return await window.api.note.toggleFavorite(id)
}

/**
 * 获取回收站中的笔记
 * @returns 已删除的笔记列表
 */
export async function getDeletedNotes(): Promise<ResponseData<Note[]>> {
  return await window.api.note.getDeleted()
}

/**
 * 清空回收站
 * @returns 清空的笔记数量
 */
export async function emptyTrash(): Promise<ResponseData<number>> {
  return await window.api.note.emptyTrash()
}
