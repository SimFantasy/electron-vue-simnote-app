/**
 * 双向链接服务
 */

import type { Note, NoteLink, ResponseData } from '@shared/types'

/**
 * 创建双向链接
 * @param sourceNoteId 源笔记ID
 * @param targetNoteId 目标笔记ID
 * @returns 创建的链接
 */
export async function createNoteLink(
  sourceNoteId: string,
  targetNoteId: string
): Promise<ResponseData<NoteLink>> {
  return await window.api.noteLink.create(sourceNoteId, targetNoteId)
}

/**
 * 删除双向链接
 * @param sourceNoteId 源笔记ID
 * @param targetNoteId 目标笔记ID
 * @returns 是否删除成功
 */
export async function deleteNoteLink(
  sourceNoteId: string,
  targetNoteId: string
): Promise<ResponseData<boolean>> {
  return await window.api.noteLink.delete(sourceNoteId, targetNoteId)
}

/**
 * 获取出链（该笔记引用了哪些笔记）
 * @param noteId 笔记ID
 * @returns 被引用的笔记列表
 */
export async function getOutgoingLinks(noteId: string): Promise<ResponseData<Note[]>> {
  return await window.api.noteLink.getOutgoing(noteId)
}

/**
 * 获取入链（哪些笔记引用了该笔记）
 * @param noteId 笔记ID
 * @returns 引用该笔记的笔记列表
 */
export async function getIncomingLinks(noteId: string): Promise<ResponseData<Note[]>> {
  return await window.api.noteLink.getIncoming(noteId)
}

/**
 * 获取出链数量
 * @param noteId 笔记ID
 * @returns 出链数量
 */
export async function getOutgoingLinkCount(noteId: string): Promise<ResponseData<number>> {
  return await window.api.noteLink.getOutgoingCount(noteId)
}

/**
 * 获取入链数量
 * @param noteId 笔记ID
 * @returns 入链数量
 */
export async function getIncomingLinkCount(noteId: string): Promise<ResponseData<number>> {
  return await window.api.noteLink.getIncomingCount(noteId)
}

/**
 * 获取链接统计
 * @param noteId 笔记ID
 * @returns 入链和出链数量统计
 */
export async function getLinkStats(
  noteId: string
): Promise<ResponseData<{ incoming: number; outgoing: number }>> {
  return await window.api.noteLink.getStats(noteId)
}

/**
 * 同步链接（根据笔记内容更新链接关系）
 * @param noteId 笔记ID
 * @param linkedNoteIds 链接的笔记ID列表
 * @returns 是否同步成功
 */
export async function syncNoteLinks(
  noteId: string,
  linkedNoteIds: string[]
): Promise<ResponseData<boolean>> {
  return await window.api.noteLink.sync(noteId, linkedNoteIds)
}

/**
 * 检查两个笔记之间是否存在链接
 * @param sourceNoteId 源笔记ID
 * @param targetNoteId 目标笔记ID
 * @returns 是否存在链接
 */
export async function hasNoteLink(
  sourceNoteId: string,
  targetNoteId: string
): Promise<ResponseData<boolean>> {
  return await window.api.noteLink.hasLink(sourceNoteId, targetNoteId)
}
