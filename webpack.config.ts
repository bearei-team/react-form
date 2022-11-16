import TerserPlugin from 'terser-webpack-plugin';

import * as path from 'path';
import * as webpack from 'webpack';
// in case you run into any typescript error when configuring `devServer`
// import 'webpack-dev-server';

const config: webpack.Configuration = {
  mode: 'production',
  entry: {
    index: path.resolve(__dirname, './src/index.ts'),
    //   components: path.resolve(__dirname, './src/components'),
    // hooks: path.resolve(__dirname, './src/hooks'),
    // utils: path.resolve(__dirname, './src/utils'),
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
    publicPath: './build/',
    libraryTarget: 'commonjs2',
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
          {loader: 'ts-loader'},
        ],
        include: path.resolve(__dirname, './src/'),
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  externals: {
    react: 'react',
  },
};

export default config;
