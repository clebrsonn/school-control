import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
    resolve: {

        alias: {
            '@': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@routes': path.resolve(__dirname, './src/routes'),
            '@config': path.resolve(__dirname, './src/config')
        }
    },
    server: {
        proxy: {
            '/auth': {
                target: 'http://192.168.1.12:5000',
                changeOrigin: true,
            },
            '/users': {
                target: 'http://192.168.1.12:5000',
                changeOrigin: true,
            },
            '/classes': {
                target: 'http://192.168.1.12:5000',
                changeOrigin: true,
            },
            '/discounts': {
                target: 'http://192.168.1.12:5000',
                changeOrigin: true,
            },
            '/enrollments': {
                target: 'http://192.168.1.12:5000',
                changeOrigin: true,
            },
            '/expenses': {
                target: 'http://192.168.1.12:5000',
                changeOrigin: true,
            },
            '/parents': {
                target: 'http://192.168.1.12:5000',
                changeOrigin: true,
            },
            '/payments': {
                target: 'http://192.168.1.12:5000',
                changeOrigin: true,
            },
            '/students': {
                target: 'http://192.168.1.12:5000',
                changeOrigin: true,
            }
        }
    },
    plugins: [react(), tsconfigPaths()]
});
