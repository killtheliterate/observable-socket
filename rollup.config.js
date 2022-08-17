import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const name = 'ObservableSocket'

const extensions = [ '.js', '.jsx', '.ts', '.tsx' ]

const baseConfig = {
  input: './src/index.ts',

  external: [
    'debug',
    'rxjs',
    'rxjs/operators'
  ],

  plugins: [
    resolve({ extensions }),
    commonjs(),
    babel({
      extensions,
      exclude: ['node_modules/**'],
      include: ['src/**/*']
    })
  ]
}

export default [
  {
    ...baseConfig,
    output: {
      file: pkg.main,
      format: 'cjs'
    }
  },

  {
    ...baseConfig,
    output: {
      file: pkg.module,
      format: 'es'
    }
  },

  {
    ...baseConfig,
    output: {
      file: 'dist/browser.js',
      format: 'iife',
      name,

      globals: {
        'debug': 'debug',
        'rxjs': 'rxjs',
        'rxjs/operators': 'rxjs.operators'
      }
    }
  },

  {
    ...baseConfig,
    plugins: [
      ...baseConfig.plugins,
      terser(),
    ],
    output: {
      file: pkg.browser,
      format: 'iife',
      name,

      globals: {
        'debug': 'debug',
        'rxjs': 'rxjs',
        'rxjs/operators': 'rxjs.operators'
      }
    }
  }
]
