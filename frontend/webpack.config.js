var LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000
  },
  plugins: [
    new LiveReloadPlugin({protocol: "http", port: 3000, hostname: "/89.111.133.147", appendScriptTag: true})
  ]

};