import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const specCandidates = [
  path.join(projectRoot, 'qip-openapi-merged(2).json'),
  path.join(projectRoot, 'qip-openapi-merged.json'),
]
const specPath = specCandidates.find((item) => fs.existsSync(item))
if (!specPath) {
  throw new Error('Cannot find qip-openapi-merged(2).json or qip-openapi-merged.json')
}
const outDir = path.join(projectRoot, 'src', 'api', 'generated')

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'))
const schemas = spec.components?.schemas || {}

const schemaNames = Object.keys(schemas)
const reservedWords = new Set([
  'delete',
  'default',
  'function',
  'class',
  'const',
  'let',
  'var',
  'new',
  'switch',
  'case',
  'return',
])

function safePropertyName(name) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name)
}

function sanitizeIdentifier(name) {
  const cleaned = name.replace(/[^A-Za-z0-9_$]/g, '_')
  if (!cleaned) return '_'
  const normalized = /^[A-Za-z_$]/.test(cleaned) ? cleaned : `_${cleaned}`
  return reservedWords.has(normalized) ? `${normalized}_api` : normalized
}

function toCamelCase(value) {
  return sanitizeIdentifier(
    value
      .replace(/\/api\//g, '')
      .replace(/\{([^}]+)\}/g, ' $1 ')
      .replace(/[^A-Za-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map((part, index) =>
        index === 0
          ? part.charAt(0).toLowerCase() + part.slice(1)
          : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join(''),
  )
}

function getRefName(ref, refPrefix = '') {
  return `${refPrefix}${ref.split('/').pop()}`
}

function toTsType(schema, options = {}) {
  const refPrefix = options.refPrefix || ''

  if (!schema) return 'unknown'

  if (schema.$ref) {
    return getRefName(schema.$ref, refPrefix)
  }

  if (schema.enum?.length) {
    return schema.enum.map((item) => JSON.stringify(item)).join(' | ')
  }

  if (schema.oneOf?.length) {
    return schema.oneOf.map((item) => toTsType(item, options)).join(' | ')
  }

  if (schema.anyOf?.length) {
    return schema.anyOf.map((item) => toTsType(item, options)).join(' | ')
  }

  if (schema.allOf?.length) {
    return schema.allOf.map((item) => toTsType(item, options)).join(' & ')
  }

  if (schema.type === 'array') {
    return `Array<${toTsType(schema.items, options)}>`
  }

  if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    const required = new Set(schema.required || [])
    const properties = Object.entries(schema.properties || {}).map(([key, value]) => {
      const optional = required.has(key) ? '' : '?'
      return `${safePropertyName(key)}${optional}: ${toTsType(value, options)}`
    })

    if (schema.additionalProperties) {
      const recordType =
        schema.additionalProperties === true
          ? 'unknown'
          : toTsType(schema.additionalProperties, options)
      properties.push(`[key: string]: ${recordType}`)
    }

    if (!properties.length) {
      return 'Record<string, unknown>'
    }

    return `{\n${properties.map((line) => `  ${line}`).join(';\n')};\n}`
  }

  if (schema.type === 'string') {
    if (schema.format === 'binary') return 'Blob | File'
    return 'string'
  }

  if (schema.type === 'integer' || schema.type === 'number') {
    return 'number'
  }

  if (schema.type === 'boolean') {
    return 'boolean'
  }

  const fallback = 'unknown'
  return schema.nullable ? `${fallback} | null` : fallback
}

function uniqueBy(items, getKey) {
  const map = new Map()
  for (const item of items) {
    map.set(getKey(item), item)
  }
  return [...map.values()]
}

function getPreferredContent(content = {}) {
  const keys = Object.keys(content)
  const preferred =
    keys.find((key) =>
      ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded', '*/*'].includes(
        key,
      ),
    ) || keys[0]

  return preferred ? { contentType: preferred, schema: content[preferred]?.schema } : null
}

function getResponseSchema(operation) {
  const responses = operation.responses || {}
  const status = Object.keys(responses)
    .filter((code) => /^2\d\d$/.test(code))
    .sort()[0]

  if (!status) return { type: 'void', responseType: undefined }

  const preferred = getPreferredContent(responses[status]?.content || {})
  if (!preferred?.schema) return { type: 'void', responseType: undefined }

  const responseType =
    preferred.contentType === 'application/octet-stream' ? 'blob' : undefined

  return {
    type: toTsType(preferred.schema, { refPrefix: 'Schemas.' }),
    responseType,
  }
}

function getRequestBody(operation) {
  const preferred = getPreferredContent(operation.requestBody?.content || {})
  if (!preferred?.schema) return null

  return {
    type: toTsType(preferred.schema, { refPrefix: 'Schemas.' }),
    isFormData: preferred.contentType === 'multipart/form-data',
  }
}

function getOperationName(method, requestPath, operationId, usedNames) {
  const fallback = `${method.toLowerCase()}${toCamelCase(requestPath)}`
  const baseName = sanitizeIdentifier(operationId || fallback)
  let name = baseName
  let index = 2

  while (usedNames.has(name)) {
    name = `${baseName}_${index}`
    index += 1
  }

  usedNames.add(name)
  return name
}

function buildParameterBlock(parameters, location) {
  const entries = parameters.filter((item) => item.in === location)
  if (!entries.length) return null

  return `{\n${entries
    .map((item) => {
      const optional = item.required ? '' : '?'
      return `    ${safePropertyName(item.name)}${optional}: ${toTsType(item.schema, {
        refPrefix: 'Schemas.',
      })}`
    })
    .join(';\n')};\n  }`
}

function generateSchemas() {
  const lines = [
    '/* eslint-disable */',
    `// Auto-generated from ${path.basename(specPath)}. Do not edit manually.`,
    '',
  ]

  for (const name of schemaNames) {
    lines.push(`export type ${name} = ${toTsType(schemas[name])}`)
    lines.push('')
  }

  return lines.join('\n')
}

function generateService() {
  const usedNames = new Set()
  const optionTypeLines = []
  const functionLines = [
    '/* eslint-disable */',
    `// Auto-generated from ${path.basename(specPath)}. Do not edit manually.`,
    '',
    "import { apiRequest, type ResultData } from '@/api/runtime'",
    "import type * as Schemas from './schemas'",
    '',
  ]

  const internalOperationNames = []

  for (const [requestPath, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue

      const parameters = uniqueBy(
        [...(pathItem.parameters || []), ...(operation.parameters || [])],
        (item) => `${item.in}:${item.name}`,
      )
      const body = getRequestBody(operation)
      const response = getResponseSchema(operation)
      const fnName = getOperationName(method, requestPath, operation.operationId, usedNames)
      const optionTypeName = `${fnName}Options`
      const pathBlock = buildParameterBlock(parameters, 'path')
      const queryBlock = buildParameterBlock(parameters, 'query')
      const headerBlock = buildParameterBlock(parameters, 'header')
      const isInternal =
        parameters.some((item) => item.name === 'X-Internal-Secret') ||
        String(operation.summary || '').includes('内部')

      const optionFields = []
      if (pathBlock) optionFields.push(`  path: ${pathBlock}`)
      if (queryBlock) optionFields.push(`  query?: ${queryBlock}`)
      if (headerBlock) optionFields.push(`  headers?: ${headerBlock}`)
      if (body) {
        optionFields.push(`  ${body.isFormData ? 'formData' : 'body'}: ${body.type}`)
      }

      optionTypeLines.push(`export interface ${optionTypeName} {`)
      if (optionFields.length) {
        optionTypeLines.push(...optionFields)
      }
      optionTypeLines.push('}')
      optionTypeLines.push('')

      functionLines.push(
        isInternal
          ? '/** Internal API, front-end should not call directly. */'
          : `/** ${operation.summary || fnName} */`,
      )
      functionLines.push(
        optionFields.length
          ? `export function ${fnName}(options: ${optionTypeName}) {`
          : `export function ${fnName}(options: ${optionTypeName} = {}) {`,
      )
      functionLines.push(`  return apiRequest<ResultData<${response.type}>>({`)
      functionLines.push(`    url: ${JSON.stringify(requestPath)},`)
      functionLines.push(`    method: ${JSON.stringify(method)},`)
      if (pathBlock) functionLines.push('    pathParams: options.path,')
      if (queryBlock) functionLines.push('    query: options.query,')
      if (headerBlock) functionLines.push('    headers: options.headers,')
      if (body) functionLines.push(`    ${body.isFormData ? 'formData' : 'body'}: options.${body.isFormData ? 'formData' : 'body'},`)
      if (response.responseType) functionLines.push(`    responseType: ${JSON.stringify(response.responseType)},`)
      functionLines.push('  })')
      functionLines.push('}')
      functionLines.push('')

      if (isInternal) {
        internalOperationNames.push({
          fnName,
          method: method.toUpperCase(),
          path: requestPath,
          summary: operation.summary || fnName,
        })
      }
    }
  }

  return {
    service: [...functionLines, ...optionTypeLines].join('\n'),
    internal: internalOperationNames,
  }
}

function generateInternalFile(internalOperations) {
  const lines = [
    '/* eslint-disable */',
    `// Auto-generated from ${path.basename(specPath)}. Do not edit manually.`,
    '',
    'export const INTERNAL_OPERATIONS = [',
  ]

  for (const item of internalOperations) {
    lines.push('  {')
    lines.push(`    name: ${JSON.stringify(item.fnName)},`)
    lines.push(`    method: ${JSON.stringify(item.method)},`)
    lines.push(`    path: ${JSON.stringify(item.path)},`)
    lines.push(`    summary: ${JSON.stringify(item.summary)},`)
    lines.push('  },')
  }

  lines.push('] as const')
  lines.push('')
  return lines.join('\n')
}

function generateIndexFile() {
  return [
    '/* eslint-disable */',
    `// Auto-generated from ${path.basename(specPath)}. Do not edit manually.`,
    '',
    "export * from './schemas'",
    "export * from './service'",
    "export * from './internal'",
    '',
  ].join('\n')
}

fs.mkdirSync(outDir, { recursive: true })

const schemasContent = generateSchemas()
const { service, internal } = generateService()

fs.writeFileSync(path.join(outDir, 'schemas.ts'), schemasContent)
fs.writeFileSync(path.join(outDir, 'service.ts'), service)
fs.writeFileSync(path.join(outDir, 'internal.ts'), generateInternalFile(internal))
fs.writeFileSync(path.join(outDir, 'index.ts'), generateIndexFile())

console.log(`Generated QIP API files to ${path.relative(projectRoot, outDir)}`)
