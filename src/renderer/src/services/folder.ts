/**
 * 文件夹服务
 */

import type { CreateFolderParams, Folder, ResponseData, UpdateFolderParams } from '@shared/types'

/**
 * 创建文件夹
 * @param params 文件夹参数
 * @param params.name {string} 文件夹名称
 * @param params.parent_id {string | null} 父文件夹ID
 * @returns 创建结果
 */
export async function createFolder(params: CreateFolderParams): Promise<ResponseData<Folder>> {
  return await window.api.folder.create(params)
}

/**
 * 根据ID获取文件夹
 * @param id {string} 文件夹ID
 * @returns 文件夹
 */
export async function getFolderById(id: string): Promise<ResponseData<Folder | null>> {
  return await window.api.folder.getById(id)
}

/**
 * 获取所有文件夹
 * @returns 文件夹列表
 */
export async function getAllFolders(): Promise<ResponseData<Folder[]>> {
  return await window.api.folder.getAll()
}

/**
 * 获取根级文件夹
 * @returns 根文件夹列表
 */
export async function getRootFolders(): Promise<ResponseData<Folder[]>> {
  return await window.api.folder.getRoots()
}

/**
 * 获取子文件夹
 * @param parentId {string} 父文件夹ID
 * @returns 子文件夹列表
 */
export async function getChildFolders(parentId: string): Promise<ResponseData<Folder[]>> {
  return await window.api.folder.getChildren(parentId)
}

/**
 * 更新文件夹
 * @param id {string} 文件夹ID
 * @param params 更新参数
 * @returns 更新后的文件夹
 */
export async function updateFolder(
  id: string,
  params: UpdateFolderParams
): Promise<ResponseData<Folder | null>> {
  return await window.api.folder.update(id, params)
}

/**
 * 删除文件夹
 * @param id {string} 文件夹ID
 * @returns 是否删除成功
 */
export async function deleteFolder(id: string): Promise<ResponseData<boolean>> {
  return await window.api.folder.delete(id)
}

/**
 * 移动文件夹
 * @param id {string} 文件夹ID
 * @param targetParentId {string | null} 目标父文件夹ID
 * @returns 移动后的文件夹
 */
export async function moveFolder(
  id: string,
  targetParentId: string | null
): Promise<ResponseData<Folder | null>> {
  return await window.api.folder.move(id, targetParentId)
}

/**
 * 重命名文件夹
 * @param id {string} 文件夹ID
 * @param newName {string} 新名称
 * @returns 重命名后的文件夹
 */
export async function renameFolder(
  id: string,
  newName: string
): Promise<ResponseData<Folder | null>> {
  return await window.api.folder.rename(id, newName)
}
