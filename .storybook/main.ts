import type { StorybookConfig } from '@storybook/vue3-vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  async viteFinal(config) {
    if (config.plugins) {
      config.plugins.push(vue());
    } else {
      config.plugins = [vue()];
    }

    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        src: path.resolve(__dirname, '../src'),
      };
    }

    config.css = {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/css/quasar.variables.scss";
          @import "src/css/app.scss";`,
        },
      },
    };

    config.define = {
      ...config.define,
      'process.env': {
        NODE_ENV: 'development',
        CLIENT: 'true',
      },
    };

    return config;
  },
};
export default config;
