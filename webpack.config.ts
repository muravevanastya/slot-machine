const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'development',
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html')
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:8].css",
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|gif|woff(2)?|eot|ttf|otf)$/,
        type: 'asset/resource'
    },
    {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, {
        loader: 'css-loader',
        options: { importLoaders: 1 }
        },
        'postcss-loader']
    }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devServer: {
    hot: true,
    open: true,
    watchFiles: ['src/**/*'],
  },
}