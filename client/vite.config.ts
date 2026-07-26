import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3333',
                changeOrigin: false,
            },
            "/auth": {
                target: 'http://localhost:3333',
                changeOrigin: false,
            },
            '/socket.io': {
                target: 'ws://localhost:3333',
                ws: true,
                changeOrigin: false,
            }
        }
    }
})
