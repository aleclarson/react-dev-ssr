import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/babel/plugin.ts',
    'src/index.ts',
    'src/jsx.ts',
    'src/vite/plugin.mts',
  ],
  format: ['esm', 'cjs'],
  bundle: true,
  splitting: true,
})
