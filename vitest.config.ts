import path from 'path';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue() as any], // eslint-disable-line @typescript-eslint/no-explicit-any
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components'),
      images: path.resolve(__dirname, './images'),
    },
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
});
