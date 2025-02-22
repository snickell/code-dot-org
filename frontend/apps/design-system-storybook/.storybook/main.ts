import {join, dirname, resolve} from 'node:path';
import {StorybookConfig} from '@storybook/react-webpack5';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: [
    '../../../packages/component-library/src/**/stories/*.story.@(ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-webpack5-compiler-swc'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-storysource'),
    getAbsolutePath('storybook-addon-rtl'),
    {
      name: getAbsolutePath('@storybook/addon-styling-webpack'),
      options: {
        rules: [
          {
            test: /\.s[ac]ss$/i,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  url: false,
                  // https://webpack.js.org/loaders/css-loader/#importloaders
                  // // 2 => style-loader, sass-loader
                  importLoaders: 2,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  implementation: require.resolve('sass'),
                  api: 'legacy',
                  sassOptions: {
                    outputStyle: 'compressed',
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  swc: () => ({
    // Removes the need to import React by specifying we are targeting React 17+ using the React jsx transform
    // See: https://storybook.js.org/docs/8.5/configure/integration/compilers#the-swc-compiler-doesnt-work-with-react
    jsc: {
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  }),
  webpackFinal: async config => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': resolve(__dirname, '../../../packages/component-library/src'),
      };
    }

    return config;
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};
export default config;
