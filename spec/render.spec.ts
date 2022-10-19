import * as fs from 'fs'
import * as path from 'path'
import { test } from 'vitest'
import { transform } from './transform'

const fixtureDir = path.resolve(__dirname, '__fixtures__')

test('render', async () => {
  const filePath = path.join(fixtureDir, 'example.jsx')
  const input = fs.readFileSync(filePath, 'utf8')

  const output = transform(input, filePath, { format: 'cjs' })
  const outFile = path.join(fixtureDir, 'example.out.mjs')
  fs.writeFileSync(outFile, '// @ts-nocheck\n' + output.code!)

  const rendered: any = await import(outFile)
  console.log({
    html: rendered,
  })
})
