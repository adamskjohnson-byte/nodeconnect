import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const localeDirectory = path.join(root, 'src', 'lib', 'locales')
const expectedLocales = ['en', 'fr', 'es', 'pt', 'de', 'it', 'nl', 'ru', 'uk', 'pl', 'tr', 'ar', 'zh-CN', 'zh-TW', 'ja', 'ko', 'hi', 'id', 'vi', 'th', 'bn', 'ro', 'el', 'sk', 'zu']

function parseLocale(code) {
  const file = path.join(localeDirectory, `${code}.ts`)
  if (!fs.existsSync(file)) throw new Error(`Missing locale module: ${code}`)
  const source = fs.readFileSync(file, 'utf8')
  const entries = new Map()
  const properties = [...source.matchAll(/["']([a-z][a-zA-Z0-9.-]+)["']\s*:\s*(["'])/g)]
  for (let index = 0; index < properties.length; index += 1) {
    const property = properties[index]
    const nextProperty = properties[index + 1]
    const quote = property[2]
    const valueStart = property.index + property[0].length
    const valueEnd = nextProperty ? source.lastIndexOf(quote, nextProperty.index) : source.lastIndexOf(quote)
    entries.set(property[1], source.slice(valueStart, valueEnd < valueStart ? valueStart : valueEnd))
  }
  return entries
}

const english = parseLocale('en')
const expectedKeys = new Set(english.keys())
const failures = []
const localeStats = []

function placeholders(text) {
  return [...text.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map((match) => match[1]).sort().join('|')
}

for (const code of expectedLocales) {
  const entries = parseLocale(code)
  const missing = [...expectedKeys].filter((key) => !entries.has(key))
  const extra = [...entries.keys()].filter((key) => !expectedKeys.has(key))
  if (missing.length || extra.length) failures.push(`${code}: missing ${missing.length} keys; extra ${extra.length} keys${missing.length ? ` (${missing.slice(0, 8).join(', ')})` : ''}`)
  for (const key of expectedKeys) {
    if (entries.has(key) && placeholders(entries.get(key)) !== placeholders(english.get(key))) {
      failures.push(`${code}: placeholder mismatch for ${key}`)
    }
  }
  localeStats.push({ code, keys: entries.size })
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const target = path.join(directory, item.name)
    return item.isDirectory() ? walk(target) : /\.tsx?$/.test(target) && !target.includes(`${path.sep}lib${path.sep}locales${path.sep}`) ? [target] : []
  })
}

const usedKeys = new Set()
const dynamicKeys = []
for (const file of walk(path.join(root, 'src'))) {
  const source = fs.readFileSync(file, 'utf8')
  const calls = /\bt\(\s*(['"`])([^'"`]+)\1/g
  for (const match of source.matchAll(calls)) {
    if (match[2].includes('${')) dynamicKeys.push(`${path.relative(root, file)}: ${match[2]}`)
    else usedKeys.add(match[2])
  }
}
const missingCalls = [...usedKeys].filter((key) => !expectedKeys.has(key))
if (missingCalls.length) failures.push(`Frontend references unknown translation keys: ${missingCalls.join(', ')}`)

console.log(JSON.stringify({ localeCount: localeStats.length, englishKeyCount: english.size, frontendStaticKeyCount: usedKeys.size, dynamicKeyExpressions: dynamicKeys, locales: localeStats, failures }, null, 2))
if (failures.length) process.exitCode = 1