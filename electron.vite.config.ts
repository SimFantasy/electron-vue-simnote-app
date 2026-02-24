import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import vuePluginSetupExtend from 'vite-plugin-vue-setup-extend'

export default defineConfig({
  main: {
    build: {
      sourcemap: false
    },
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {
    build: {
      sourcemap: false
    },
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [
      vue(),
      vuePluginSetupExtend(),
      ui({
        autoImport: {
          dts: 'src/types/auto-imports.d.ts',
          imports: ['vue', 'vue-router', 'pinia']
        },
        components: {
          dts: 'src/types/components.d.ts',
          dirs: ['src/components', 'src/views']
        }
      })
    ]
  }
})
