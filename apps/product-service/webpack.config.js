const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path');

module.exports = {
  resolve: {
    alias: {
      "@packages": resolve(__dirname, "../../packages")
    },
    extensions: ['.ts', '.js', '.json'],
  },
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      buildLibsFromSource: true,
      assets: ["./src/assets"],
      externalDependencies: [
        'express',
        'cors',
        'cookie-parser',
        'dotenv',
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    })
  ],
  ignoreWarnings: [/Failed to parse source map/],
};
