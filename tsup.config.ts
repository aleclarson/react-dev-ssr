import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/babel/plugin.ts', 'src/jsx.ts', 'src/render.ts'],
  format: ['esm', 'cjs'],
})
