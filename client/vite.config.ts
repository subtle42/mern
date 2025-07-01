import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { server } from 'typescript'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: '',
                changeOrigin: false,
            }
        }
    }
})