import * as babel from '@babel/core'

export default function ({ types: t }: typeof babel): babel.PluginObj {
  return {
    name: '',
    visitor: {
      JSXElement(path) {
        debugger
      },
      JSXFragment(path) {
        debugger
      },
    },
  }
}
