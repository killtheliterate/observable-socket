var path = require('path')

module.exports = {
  entry: './src/index.js',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'ObservableSocket',
    libraryTarget: 'umd'
  },

  externals: {
    'debug': 'debug',
    'rxjs/Rx': {
      commonjs: 'rxjs/Rx',
      commonjs2: 'rxjs/Rx',
      amd: 'Rx',
      root: 'Rx'
    }
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        include: __dirname,
        options: {
          presets: [
            ['es2015', {'modules': false}]
          ]
        }
      }
    ]
  }
}
