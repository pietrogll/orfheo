'use strict';

const path    = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  devtool: 'eval',
  entry: {
    bundle: path.join(__dirname, 'src', 'main.js'),
    reactForJQuery: path.join(__dirname, 'src', 'reactForJQuery.js'),
    config: path.join(__dirname, 'src', 'config.js')
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: path.join(__dirname, 'node_modules'),
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
     extensions: ['*', '.js', '.jsx']
  },
  plugins: [
    new Dotenv({
      path: './../../.env',
    })
  ]
}
