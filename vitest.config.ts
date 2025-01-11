import path from 'path';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue() as any],
  // research dart-sass deprecation warning
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `
  //       @import "src/css/mixins.scss";
  //       @import "src/css/quasar.variables.scss";
  //       @import "src/css/colors.scss";
  //       @import "src/css/app.scss";`,
  //     },
  //   },
  // },
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    environment: 'happy-dom',
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components'),
      images: path.resolve(__dirname, './images'),
      icons: path.resolve(__dirname, './public/icons'),
    },
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
});
