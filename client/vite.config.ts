// import { defineConfig } from 'vite'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom',
        globals: true, // Enables describe, test, expect globally without explicit imports
        setupFiles: undefined,
    },
    // This is needed due to react 19 issues with react-testing-library
    resolve: {
        alias: {
            'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
            'react': path.resolve(__dirname, '../node_modules/react'),
            'react/jsx-runtime': path.resolve(__dirname, '../node_modules/react/jsx-runtime.js'),
            'react/jsx-dev-runtime': path.resolve(__dirname, '../node_modules/react/jsx-dev-runtime.js'),
        }
    },
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
