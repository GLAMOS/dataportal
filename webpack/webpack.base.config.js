const webpack = require('webpack');

module.exports = {
  entry: {
    entry: [
      'lazysizes',
      'lightgallery',
      'respimage',
      'jquery.mmenu',
      './theme_src/js/ieDetector.js',
      './theme_src/js/index.js'
    ]
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
