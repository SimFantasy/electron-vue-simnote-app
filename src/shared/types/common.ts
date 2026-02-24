export interface ResponseData<T> {
  success: boolean
  data?: T
  error?: string
}
