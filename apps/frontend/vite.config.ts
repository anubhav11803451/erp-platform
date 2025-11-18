import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fileRoutes from './vite-plugin-file-routes';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        fileRoutes({
            pagesDir: 'src/pages',
            outputFile: 'src/router.generated.ts',
            extensions: ['.tsx', '.jsx'],
            log: true,
        }),
    ],
    envDir: path.resolve(__dirname, '../../'),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
