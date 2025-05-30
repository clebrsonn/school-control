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
    plugins: [react(), tsconfigPaths()]
});
