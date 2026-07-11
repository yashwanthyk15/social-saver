import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Only proxy if no external API URL is set (pure local dev without ngrok)
      ...(env.VITE_API_URL ? {} : {
        proxy: {
          '/dashboard': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      }),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
