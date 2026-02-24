import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0, behavior: 'smooth' })
})

export function setupRouter(app: App) {
  app.use(router)
}
