#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const root = process.cwd()
const patternsPath = join(root, 'private/eslint-restricted-patterns.json')
const patterns = JSON.parse(readFileSync(patternsPath, 'utf8'))

const forbidden = patterns.map((entry) => new RegExp(entry.pattern, 'g'))

const argv = process.argv.slice(2)
const fileArg = argv[0]

const allowedExtensions = new Set(['.ts', '.tsx', '.mdx'])

const scanFiles = () => {
  const results = []

  const walk = (directory) => {
    const entries = readdirSync(directory, { withFileTypes: true })
    entries.forEach((entry) => {
      if (entry.name.startsWith('.')) return
      const absolute = join(directory, entry.name)
      if (entry.isDirectory()) {
        if (absolute.includes('/node_modules') || absolute.includes('/.next')) {
          return
        }
        walk(absolute)
      } else if (allowedExtensions.has(extname(entry.name))) {
        const relative = absolute.replace(`${root}/`, '')
        results.push(relative)
      }
    })
  }

  walk(root)

  return results
}

const files = fileArg ? [fileArg] : scanFiles()

const targetPrefixes = [
  'app/dashboard/billing',
  'app/(landing)/features-one.tsx',
  'app/(landing)/animated-list-custom.tsx',
  'components/ui',
  'components/ui.tsx',
  'components/mentorfit-gate.tsx',
  'lib/clerk-config.ts',
  'docs/design-guidelines.md',
  'docs/ui-color-audit.md',
]

const shouldInspect = (file) => targetPrefixes.some((prefix) => file.startsWith(prefix))

let violations = 0

files.forEach((file) => {
  if (!shouldInspect(file)) {
    return
  }
  const contents = readFileSync(join(root, file), 'utf8')
  forbidden.forEach((regex, index) => {
    let match
    while ((match = regex.exec(contents)) !== null) {
      violations += 1
      const { message } = patterns[index]
      console.error(`Semantic color violation: ${file}:${match.index + 1} => ${match[0]} (${message})`)
    }
  })
})

if (violations > 0) {
  console.error(`\nFound ${violations} semantic color violation(s). Replace fixed hues with semantic tokens.`)
  process.exit(1)
}

console.log('Semantic color audit clean ✅')

