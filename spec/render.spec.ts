import { test } from 'vitest'
import { transform } from './transform'
import fs from 'fs'
import path from 'path'

const fixtureDir = path.resolve(__dirname, '__fixtures__')
console.log({ fixtureDir })

test('render', async () => {
  const filePath = path.join(fixtureDir, 'example.jsx')
  const input = fs.readFileSync(filePath, 'utf8')
  const output = transform(input, filePath)
  output.run()
})
