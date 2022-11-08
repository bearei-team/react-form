const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    index: path.resolve(__dirname, './src/index.tsx'),
    Form: path.resolve(__dirname, 'src/components/Form.tsx'),
    FormItem: path.resolve(__dirname, 'src/components/FormItem.tsx'),
    useForm: path.resolve(__dirname, 'src/hooks/useForm.tsx'),
    useFormContext: path.resolve(__dirname, 'src/hooks/useFormContext.tsx'),
    validate: path.resolve(__dirname, 'src/utils/validate.tsx'),
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
    publicPath: './build/',
    libraryTarget: 'commonjs2',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        include: /\.min\.js$/,
      }),
    ],
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
      //   {
      //     test: /\.css$/,
      //     loader: 'style-loader!css-loader?modules&localIdentName=[hash:8]',
      //     include: path.resolve(__dirname, './src/'),
      //   },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  externals: {
    react: 'react',
  },
};
