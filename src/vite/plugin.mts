import type {} from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

export default function reactDevSsr(): Plugin {
  const replacedModuleIds = ['react', 'react-dom/server']

  const resolveId: Plugin['resolveId'] = async function (
    id,
    importer,
    { ssr }
  ) {
    if (!ssr) return
    if (replacedModuleIds.includes(id)) {
      return 'react-dev-ssr'
    }
    const resolved = await this.resolve(id, importer, {
      skipSelf: true,
    })
    if (resolved) {
      resolved.meta = {
        ...resolved.meta,
        jsxImportSource: 'react-dev-ssr/jsx-transform',
      }
      return resolved
    }
  }

  const plugin: Plugin = {
    name: 'react-dev-ssr',
    apply: 'serve',
    api: {
      reactBabel(options) {
        options.plugins.push('react-dev-ssr/jsx-transform')
      },
    },
    configResolved({ mode }) {
      if (mode !== 'production') {
        plugin.resolveId = resolveId
      }
    },
  }

  return plugin
}
