import * as sucrase from 'sucrase'
import { Module } from 'module'
import * as vm from 'vm'

export function executeModule(code: string, filename: string) {
  const module = { exports: {} }
  const env = {
    require: Module.createRequire(filename),
    exports: module.exports,
    module,
  }

  if (/^(import|export) /.test(code)) {
    code = sucrase.transform(code, {
      filePath: filename,
      transforms: ['imports'],
    }).code
  }

  const script = `(function (${Object.keys(env).join(', ')}) { ${code}\n})`

  const init = vm.runInThisContext(script, {
    filename,
    // filename: 'example.jsx',
  })

  init(...Object.values(env))
  return module.exports
}
