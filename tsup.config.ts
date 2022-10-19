import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/babel/plugin.ts', 'src/index.ts', 'src/jsx.ts'],
  format: ['esm', 'cjs'],
  bundle: true,
  splitting: true,
})
