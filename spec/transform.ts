import { transformSync } from '@babel/core'
import { Module } from 'module'
import path from 'path'
import vm from 'vm'

export function transform(code: string, filename: string) {
  const result = transformSync(code, {
    babelrc: false,
    filename,
    sourceMaps: 'inline',
    plugins: [
      path.resolve(__dirname, '../dist/babel/plugin.js'),
      [
        '@babel/transform-react-jsx',
        {
          runtime: 'automatic',
          importSource: path.resolve(__dirname, '../src/jsx'),
        },
      ],
      '@babel/transform-modules-commonjs',
    ],
  })

  if (!result) {
    throw Error('transform failed')
  }

  return {
    ...result,
    run() {
      const context = vm.createContext({
        require: Module.createRequire(filename),
        module: { exports: {} },
        exports: {},
      })

      vm.runInContext(result.code!, context)

      return context.module.exports
    },
  }
}
