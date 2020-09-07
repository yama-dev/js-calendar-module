const webpack = require('webpack');

const env = process.env.NODE_ENV;

const config = {
  mode: env || 'development',
  entry: {
    'js-calendar-module': './src/js-calendar-module.js'
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    modules: false
                  }
              ]
              ],
            }
          }
        ],
      }
    ]
  }
};

module.exports = config;
