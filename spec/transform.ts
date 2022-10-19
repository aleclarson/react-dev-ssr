import { transformSync } from '@babel/core'

export function transform(
  code: string,
  filename: string,
  options: {
    /** @default "esm" */
    format?: 'esm' | 'cjs'
    /** @default true */
    sourcemap?: boolean
  } = {}
) {
  const plugins = [
    'react-dev-ssr/jsx-transform',
    [
      '@babel/transform-react-jsx',
      {
        runtime: 'automatic',
        importSource: 'react-dev-ssr',
      },
    ],
  ]

  if (options.format == 'cjs') {
    plugins.push('@babel/transform-modules-commonjs')
  }

  const result = transformSync(code, {
    babelrc: false,
    filename,
    sourceMaps: options.sourcemap !== false && 'inline',
    plugins,
  })

  if (!result) {
    throw Error('transform failed')
  }

  return result
}
