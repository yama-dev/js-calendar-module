const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

const comment = `/*!
 * JS CALENDAR_MODULE (JavaScript Library)
 *   ${pkg.name}
 * Version ${pkg.version}
 * Repository ${pkg.repository.url}
 * Copyright ${pkg.author}
 * Licensed ${pkg.license}
 */
/*! JS PARSE_MODULE (JavaScript Library)   js-parse-module.js Version 0.0.3 Repository https://github.com/yama-dev/js-parse-module Author yama-dev Licensed under the MIT license. */
/*! calendar.js: inspired by the calendar module from Python Copyright(c) 2011 Luciano Ramalho <luciano@ramalho.org> MIT Licensed */`;

const env = process.env.NODE_ENV;

const webpackPlugEnv = new webpack.EnvironmentPlugin({
  VERSION: pkg.version,
  DEBUG: false
});

const babelPlugin = [
  '@babel/plugin-transform-object-assign'
];

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
        exclude: /node_modules[//\/](?!(@yama\-dev)\/).*/,
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
              plugins: babelPlugin
            }
          }
        ],
      }
    ]
  },
  plugins: [
    webpackPlugEnv
  ]
};

if(env === 'production'){
  config.optimization = {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          output: {
            preamble: comment,
            comments: false,
          },
          compress: {
            drop_console: true
          }
        },
      }),
    ],
  }
}

module.exports = config;
