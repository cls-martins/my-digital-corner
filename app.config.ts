import { defineConfig } from 'vinxi'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  routers: {
    client: {
      type: 'client',
      handler: './src/routes/app.tsx', // Caminho que você mencionou
      target: 'browser',
      plugins: () => [
        TanStackRouterVite(),
        tsconfigPaths(),
      ],
    },
  },
})
