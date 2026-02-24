import type { RouteRecordRaw } from 'vue-router'

export const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '',
        name: 'Note',
        component: () => import('@/views/index.vue')
      }
    ]
  }
] as RouteRecordRaw[]
