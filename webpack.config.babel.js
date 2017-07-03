let webpack = require('webpack')

let env = process.env.NODE_ENV
let config = {
  module: {
    loaders: [
      { test: /\.js$/, loaders: [ 'babel-loader' ], exclude: /node_modules/ },
      { test: /\.json$/, loaders: [ 'json-loader' ] }
    ]
  },
  output: {
    library: 'Fetchum',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ],
  node: {
    fs: 'empty'
  }
}

if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

module.exports = config
