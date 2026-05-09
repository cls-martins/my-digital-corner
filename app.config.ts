import { defineConfig } from 'vinxi'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  routers: {
    ssr: {
      type: 'http',
      handler: './src/ssr.tsx',
    },
    client: {
      type: 'client',
      handler: './src/client.tsx',
      target: 'browser',
      plugins: () => [TanStackRouterVite(), tsconfigPaths()],
    },
    server: {
      type: 'http',
      handler: './src/server.tsx',
      target: 'server',
    },
  },
})
