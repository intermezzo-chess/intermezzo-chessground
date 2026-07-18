import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // The root vite.config.ts's dts plugin is for the library build only — it's not needed (and
  // just adds noise/time) when Storybook merges in that config for its own preview build.
  async viteFinal(config) {
    config.plugins = config.plugins?.filter((plugin) => {
      const name = plugin && !Array.isArray(plugin) && 'name' in plugin ? plugin.name : '';
      return name !== 'unplugin-dts';
    });
    return config;
  },
};

export default config;
