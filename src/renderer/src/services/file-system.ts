/**
 * 文件系统服务
 */

import type { ImageInfo, ImageSaveOptions, ResponseData } from '@shared/types'

/**
 * 初始化工作区
 * @param workspacePath 工作区路径
 * @returns 是否初始化成功
 */
export async function initializeWorkspace(workspacePath: string): Promise<ResponseData<boolean>> {
  return await window.api.fileSystem.initialize(workspacePath)
}

/**
 * 获取工作区路径
 * @returns 工作区路径
 */
export async function getWorkspacePath(): Promise<ResponseData<string>> {
  return await window.api.fileSystem.getWorkspacePath()
}

/**
 * 读取 Markdown 文件
 * @param relativePath 相对路径
 * @returns 文件内容
 */
export async function readMarkdownFile(relativePath: string): Promise<ResponseData<string>> {
  return await window.api.fileSystem.readMarkdown(relativePath)
}

/**
 * 写入 Markdown 文件
 * @param relativePath 相对路径
 * @param content 文件内容
 * @returns 文件路径
 */
export async function writeMarkdownFile(
  relativePath: string,
  content: string
): Promise<ResponseData<string>> {
  return await window.api.fileSystem.writeMarkdown(relativePath, content)
}

/**
 * 删除 Markdown 文件
 * @param relativePath 相对路径
 * @returns 删除的文件路径
 */
export async function deleteMarkdownFile(relativePath: string): Promise<ResponseData<string>> {
  return await window.api.fileSystem.deleteMarkdown(relativePath)
}

/**
 * 移动 Markdown 文件
 * @param oldPath 原路径
 * @param newPath 新路径
 * @returns 新文件路径
 */
export async function moveMarkdownFile(
  oldPath: string,
  newPath: string
): Promise<ResponseData<string>> {
  return await window.api.fileSystem.moveMarkdown(oldPath, newPath)
}

/**
 * 检查文件是否存在
 * @param relativePath 相对路径
 * @returns 是否存在
 */
export async function checkFileExists(relativePath: string): Promise<ResponseData<boolean>> {
  return await window.api.fileSystem.exists(relativePath)
}

/**
 * 保存图片
 * @param options 保存选项
 * @returns 图片信息
 */
export async function saveImage(options: ImageSaveOptions): Promise<ResponseData<ImageInfo>> {
  return await window.api.fileSystem.saveImage(options)
}

/**
 * 删除笔记的所有图片
 * @param noteFolderPath 笔记文件夹路径
 * @returns 删除的图片数量
 */
export async function deleteNoteImages(noteFolderPath: string): Promise<ResponseData<number>> {
  return await window.api.fileSystem.deleteNoteImages(noteFolderPath)
}

/**
 * 创建目录
 * @param relativePath 相对路径
 * @returns 是否创建成功
 */
export async function createDirectory(relativePath: string): Promise<ResponseData<boolean>> {
  return await window.api.fileSystem.createDirectory(relativePath)
}

/**
 * 删除目录
 * @param relativePath 相对路径
 * @param recursive 是否递归删除
 * @returns 是否删除成功
 */
export async function deleteDirectory(
  relativePath: string,
  recursive?: boolean
): Promise<ResponseData<boolean>> {
  return await window.api.fileSystem.deleteDirectory(relativePath, recursive)
}

/**
 * 移动目录
 * @param oldPath 原路径
 * @param newPath 新路径
 * @returns 是否移动成功
 */
export async function moveDirectory(
  oldPath: string,
  newPath: string
): Promise<ResponseData<boolean>> {
  return await window.api.fileSystem.moveDirectory(oldPath, newPath)
}

/**
 * 选择工作区目录
 * @returns 选择的目录路径
 */
export async function selectWorkspace(): Promise<ResponseData<string | null>> {
  return await window.api.fileSystem.selectWorkspace()
}

/**
 * 显示打开文件对话框
 * @param options 对话框选项
 * @returns 对话框返回结果
 */
export async function showOpenDialog(
  options?: Electron.OpenDialogOptions
): Promise<ResponseData<Electron.OpenDialogReturnValue>> {
  return await window.api.fileSystem.showOpenDialog(options)
}

/**
 * 显示保存文件对话框
 * @param options 对话框选项
 * @returns 对话框返回结果
 */
export async function showSaveDialog(
  options?: Electron.SaveDialogOptions
): Promise<ResponseData<Electron.SaveDialogReturnValue>> {
  return await window.api.fileSystem.showSaveDialog(options)
}
