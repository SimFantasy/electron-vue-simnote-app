import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

/**
 * 窗口状态管理器
 *
 * 负责：
 * - 创建和管理主窗口
 * - 窗口状态（最小化、最大化、全屏等）
 * - 窗口位置和大小记忆
 * - 多显示器支持
 */
class WindowManager {
  /** 主窗口实例 */
  private mainWindow: BrowserWindow | null = null

  /** 窗口关闭前的状态（用于恢复） */
  private windowState = {
    width: 1536,
    height: 900,
    x: undefined as number | undefined,
    y: undefined as number | undefined,
    isMaximized: false,
    isFullScreen: false
  }

  /**
   * 获取主窗口实例
   * @returns 当前主窗口实例，如果未创建则返回 null
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  /**
   * 检查主窗口是否存在且未关闭
   * @returns true 表示窗口存在
   */
  hasMainWindow(): boolean {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed()
  }

  /**
   * 创建主窗口
   * 如果窗口已存在，则直接返回现有窗口
   * @returns 创建或现有的主窗口实例
   */
  createMainWindow(): BrowserWindow {
    // 如果窗口已存在，直接返回
    if (this.hasMainWindow()) {
      return this.mainWindow!
    }

    // 计算窗口位置（屏幕中心）
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

    const x = Math.round((screenWidth - this.windowState.width) / 2)
    const y = Math.round((screenHeight - this.windowState.height) / 2)

    // 创建浏览器窗口
    this.mainWindow = new BrowserWindow({
      // 窗口尺寸
      width: this.windowState.width,
      height: this.windowState.height,
      minWidth: 900,
      minHeight: 600,
      x: this.windowState.x ?? x,
      y: this.windowState.y ?? y,

      // 窗口样式
      show: false, // 先不显示，等加载完成后再显示
      autoHideMenuBar: true, // 自动隐藏菜单栏
      transparent: true, // 窗口透明
      frame: false, // 无边框，使用自定义标题栏
      titleBarStyle: 'hidden', // 隐藏标题栏

      // 图标（Linux 需要）
      ...(process.platform === 'linux' ? { icon } : {}),

      // 网页首选项
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true, // 启用上下文隔离（安全）
        nodeIntegration: false // 禁用 Node 集成（安全）
      }
    })

    // 监听窗口准备显示事件
    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()

      // 如果是最大化状态，恢复最大化
      if (this.windowState.isMaximized) {
        this.mainWindow?.maximize()
      }

      // 如果是全屏状态，恢复全屏
      if (this.windowState.isFullScreen) {
        this.mainWindow?.setFullScreen(true)
      }
    })

    // 监听窗口关闭事件，保存状态
    this.mainWindow.on('close', () => {
      this.saveWindowState()
    })

    // 监听窗口关闭完成事件
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    // 处理外部链接打开
    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      // 使用系统默认浏览器打开外部链接
      import('electron').then(({ shell }) => {
        shell.openExternal(details.url)
      })
      return { action: 'deny' } // 禁止在应用内打开
    })

    // 加载页面
    this.loadURL()

    return this.mainWindow
  }

  /**
   * 加载窗口内容
   * 开发环境加载开发服务器 URL，生产环境加载本地文件
   */
  private loadURL(): void {
    if (!this.mainWindow) return

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      // 开发环境：加载 Vite 开发服务器
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      // 生产环境：加载打包后的 HTML 文件
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  /**
   * 保存窗口状态
   * 在窗口关闭前调用，记录当前窗口的位置和大小
   */
  private saveWindowState(): void {
    if (!this.mainWindow) return

    const bounds = this.mainWindow.getBounds()
    this.windowState.width = bounds.width
    this.windowState.height = bounds.height
    this.windowState.x = bounds.x
    this.windowState.y = bounds.y
    this.windowState.isMaximized = this.mainWindow.isMaximized()
    this.windowState.isFullScreen = this.mainWindow.isFullScreen()

    // TODO: 将状态保存到配置文件
  }

  /**
   * 显示主窗口
   * 如果窗口最小化则恢复，如果隐藏则显示，并聚焦窗口
   */
  showMainWindow(): void {
    if (!this.mainWindow) {
      this.createMainWindow()
      return
    }

    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore()
    }

    if (!this.mainWindow.isVisible()) {
      this.mainWindow.show()
    }

    this.mainWindow.focus()
  }

  /**
   * 隐藏主窗口
   * 窗口隐藏后不会显示在任务栏，但仍可以通过托盘图标访问
   */
  hideMainWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.hide()
    }
  }

  /**
   * 最小化主窗口到任务栏
   */
  minimizeMainWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.minimize()
    }
  }

  /**
   * 最大化/恢复主窗口
   * 如果当前是最大化状态则恢复，否则最大化
   */
  toggleMaximizeMainWindow(): void {
    if (!this.mainWindow) return

    if (this.mainWindow.isMaximized()) {
      this.mainWindow.unmaximize()
    } else {
      this.mainWindow.maximize()
    }
  }

  /**
   * 关闭主窗口
   * 实际不会销毁窗口，只是隐藏（配合托盘使用）
   * @param force - 是否强制关闭（真正退出应用时设为 true）
   */
  closeMainWindow(force = false): void {
    if (!this.mainWindow) return

    if (force) {
      // 强制关闭：销毁窗口
      this.mainWindow.destroy()
    } else {
      // 普通关闭：隐藏窗口（配合托盘使用）
      this.mainWindow.hide()
    }
  }

  /**
   * 发送 IPC 消息到主窗口
   * @param channel - IPC 通道名
   * @param args - 要发送的数据
   */
  sendToMainWindow(channel: string, ...args: any[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args)
    }
  }

  /**
   * 设置窗口标题
   * @param title - 新标题
   */
  setTitle(title: string): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.setTitle(title)
    }
  }

  /**
   * 获取窗口标题
   * @returns 当前窗口标题
   */
  getTitle(): string {
    return this.mainWindow?.getTitle() ?? ''
  }
}

// 导出单例实例
export const windowManager = new WindowManager()

// 便捷导出
export const getMainWindow = () => windowManager.getMainWindow()
export const createMainWindow = () => windowManager.createMainWindow()
export const showMainWindow = () => windowManager.showMainWindow()
export const hideMainWindow = () => windowManager.hideMainWindow()
export const minimizeMainWindow = () => windowManager.minimizeMainWindow()
export const toggleMaximizeMainWindow = () => windowManager.toggleMaximizeMainWindow()
export const closeMainWindow = (force?: boolean) => windowManager.closeMainWindow(force)
export const sendToMainWindow = (channel: string, ...args: any[]) =>
  windowManager.sendToMainWindow(channel, ...args)
