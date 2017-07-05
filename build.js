// @see http://bit.ly/2sNtWBY
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const replace = require('rollup-plugin-replace')
const resolve = require('rollup-plugin-node-resolve')
const uglify = require('rollup-plugin-uglify')

const env = process.env.NODE_ENV

const rollupConfig = {
  entry: 'src/index.js',
  external: ['rxjs/Rx', 'debug']
}

const uglifyConfig = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    warnings: false
  }
}

const plugins = [
  resolve({ jsnext: true, main: true, module: true }),
  commonjs(),
  babel({ exclude: 'node_modules/**' }),
  replace({
    'process.env.NODE_ENV': JSON.stringify(env)
  })
]

// UMD
rollup
  .rollup(Object.assign({}, rollupConfig, { plugins: plugins }))
  .then(function (bundle) {
    bundle.write({
      dest: 'dist/umd/index.js',
      format: 'umd',
      moduleName: 'ObservableSocket',
      sourceMap: true,
      globals: {
        'debug': 'debug',
        'rxjs/Rx': 'Rx'
      }
    })
  })

// UMD.min
rollup
  .rollup(Object.assign({}, rollupConfig, { plugins: [...plugins, uglify(uglifyConfig)] }))
  .then(bundle => {
    bundle.write({
      dest: 'dist/umd/index.min.js',
      format: 'umd',
      moduleName: 'ObservableSocket',
      sourceMap: true,
      globals: {
        'debug': 'debug',
        'rxjs/Rx': 'Rx'
      }
    })
  })

// cjs
rollup
  .rollup(Object.assign({}, rollupConfig, { plugins: plugins }))
  .then(bundle => {
    bundle.write({
      format: 'cjs',
      dest: 'dist/cjs/index.js',
      sourceMap: true
    })
  })

// esm
rollup
  .rollup(Object.assign({}, rollupConfig, { plugins: plugins }))
  .then(bundle => {
    bundle.write({
      format: 'es',
      dest: 'dist/es/index.js',
      sourceMap: true
    })
  })
