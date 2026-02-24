// 大纲类型
export interface Heading {
  id: string // 锚点 slug，如 "introduction"
  text: string // 标题文本
  depth: number // 层级 1-6
  children?: Heading[]
}
