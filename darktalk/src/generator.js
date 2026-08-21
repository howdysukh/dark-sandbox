'use strict';
function generate(program, moduleId, imports, { isEntry = false } = {}) {
  const expression = (value) => {
    switch (value.type) {
      case 'Literal': return JSON.stringify(value.value); case 'Identifier': return value.name;
      case 'ArrayExpression': return `[${value.values.map(expression).join(', ')}]`;
      case 'ObjectExpression': return `{ ${value.fields.map((field) => `${JSON.stringify(field.key)}: ${expression(field.value)}`).join(', ')} }`;
      case 'MemberExpression': return `${expression(value.object)}.${value.property}`;
      case 'IndexExpression': return `${expression(value.object)}[${expression(value.index)}]`;
      case 'CallExpression': return `${expression(value.callee)}(${value.args.map(expression).join(', ')})`;
      case 'AwaitExpression': return `await ${expression(value.value)}`;
      case 'UnaryExpression': return `(${value.operator}${expression(value.value)})`;
      case 'BinaryExpression': return `(${expression(value.left)} ${value.operator} ${expression(value.right)})`;
      case 'CreateExpression': return `dark.data.create(${JSON.stringify(value.model)}, { ${value.fields.map((field) => `${JSON.stringify(field.key)}: ${expression(field.value)}`).join(', ')} })`;
      case 'ListExpression': return `dark.data.list(${JSON.stringify(value.model)})`;
      default: throw new Error(`Unsupported expression ${value.type}`);
    }
  };
  const statement = (item) => {
    if (item.type === 'ReturnStatement') return `return ${expression(item.value)};`;
    if (item.type === 'PrintStatement') return `dark.print(${expression(item.value)});`;
    if (item.type === 'FailStatement') return `throw new Error(${expression(item.value)});`;
    if (item.type === 'EmitStatement') return `await dark.events.emit(${JSON.stringify(item.event)}, [${item.args.map(expression).join(', ')}]);`;
    if (item.type === 'AssignmentStatement') { const target = expression(item.target); return `${item.operator === '=' ? (item.target.type === 'Identifier' ? `let ${target}` : target) : target} ${item.operator} ${expression(item.value)};`; }
    if (item.type === 'ExpressionStatement') return `await ${expression(item.value)};`;
    if (item.type === 'IfStatement') return `if (${expression(item.test)}) {\n${item.consequent.map(statement).map((line) => `  ${line}`).join('\n')}\n}${item.alternate ? ` else {\n${item.alternate.map(statement).map((line) => `  ${line}`).join('\n')}\n}` : ''}`;
    if (item.type === 'WhileStatement') return `while (${expression(item.test)}) {\n${item.body.map(statement).map((line) => `  ${line}`).join('\n')}\n}`;
    if (item.type === 'ForStatement') return `for (const ${item.item} of ${expression(item.iterable)}) {\n${item.body.map(statement).map((line) => `  ${line}`).join('\n')}\n}`;
    throw new Error(`Unsupported statement ${item.type}`);
  };
  const importsCode = program.body.filter((item) => item.type === 'ImportDeclaration').map((item) => { const resolved = imports.get(item.source); return resolved.endsWith('.js') ? `const ${item.alias} = require(${JSON.stringify(resolved)});` : `const ${item.alias} = load(${JSON.stringify(resolved)});`; });
  const data = program.body.filter((item) => ['DataDeclaration', 'UserDeclaration'].includes(item.type)).map((item) => `dark.data.define(${JSON.stringify(item.name)}, ${JSON.stringify(item.fields)});`);
  const configs = program.body.filter((item) => item.type === 'ConfigDeclaration').map((item) => `dark.config[${JSON.stringify(item.key)}] = ${expression(item.value)};`);
  const secrets = program.body.filter((item) => item.type === 'SecretDeclaration').map((item) => `dark.secrets.require(${JSON.stringify(item.name)});`);
  const functions = program.body.filter((item) => ['FunctionDeclaration', 'ActionDeclaration'].includes(item.type)).map((item) => `async function ${item.name}(${item.params.join(', ')}) {\n${item.body.map(statement).map((line) => `  ${line}`).join('\n')}\n}\nexports.${item.name} = ${item.name};`);
  const handlers = program.body.filter((item) => item.type === 'EventHandler').map((item) => `dark.events.on(${JSON.stringify(item.event)}, async (${item.params.join(', ')}) => {\n${item.body.map(statement).map((line) => `  ${line}`).join('\n')}\n});`);
  const tasks = program.body.filter((item) => item.type === 'TaskDeclaration').map((item) => `dark.tasks.add(${JSON.stringify(item.name)}, ${item.interval ? Math.round(item.interval * (item.unit.startsWith('hour') ? 3600000 : 60000)) : 'null'}, async () => {\n${item.body.map(statement).map((line) => `  ${line}`).join('\n')}\n});`);
  const routes = program.body.filter((item) => item.type === 'ApiDeclaration').flatMap((api) => api.routes.map((route) => `dark.api.route(${JSON.stringify(route.method)}, ${JSON.stringify(route.path)}, async (request) => {\n${route.body.map(statement).map((line) => `  ${line}`).join('\n')}\n});`));
  const executable = program.body.filter((item) => !['ImportDeclaration', 'DataDeclaration', 'UserDeclaration', 'ConfigDeclaration', 'SecretDeclaration', 'FunctionDeclaration', 'ActionDeclaration', 'EventDeclaration', 'EventHandler', 'TaskDeclaration', 'ApiDeclaration'].includes(item.type)).map(statement);
  return `modules[${JSON.stringify(moduleId)}] = (exports, load, dark) => {\nconst { web, ai, http, file, time, crypto, json, env } = dark;\n${importsCode.join('\n')}\n${data.join('\n')}\n${configs.join('\n')}\n${secrets.join('\n')}\n${functions.join('\n\n')}\n${handlers.join('\n')}\n${tasks.join('\n')}\n${routes.join('\n')}\n${isEntry && executable.length ? `exports.__run = async () => {\n${executable.map((line) => `  ${line}`).join('\n')}\n};` : ''}\n};`;
}
function runtime() { return `
function createDark() {
  const models = new Map(), listeners = new Map(), routes = [];
  const dark = {
    config: Object.create(null), print: (...values) => console.log(...values),
    secrets: { require(name) { if (!process.env[name]) console.warn('[Dark] INFO: ' + name + ' is not set; a configured provider may be unavailable.'); return process.env[name]; } },
    data: { define(name, fields) { if (!models.has(name)) models.set(name, { fields, values: [] }); }, create(name, value) { const model = models.get(name); if (!model) throw new Error('Dark data model not found: ' + name); const record = { id: dark.crypto.uuid(), ...value }; model.values.push(record); return record; }, list(name) { const model = models.get(name); if (!model) throw new Error('Dark data model not found: ' + name); return [...model.values]; }, find(name, predicate) { return dark.data.list(name).find(predicate); } },
    events: { on(name, handler) { const all = listeners.get(name) || []; all.push(handler); listeners.set(name, all); }, async emit(name, args) { for (const handler of listeners.get(name) || []) await handler(...args); } },
    tasks: { add(name, interval, run) { if (interval) return { name, interval, run }; return { name, run }; } },
    api: { route(method, path, handler) { routes.push({ method, path, handler }); }, routes, start(port = 3000) { const server = require('node:http').createServer(async (request, response) => { const route = routes.find((candidate) => candidate.method === request.method && candidate.path === request.url); if (!route) { response.writeHead(404, { 'content-type': 'application/json' }); response.end(JSON.stringify({ error: 'Route not found' })); return; } try { const value = await route.handler(request); response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify(value)); } catch (error) { response.writeHead(500, { 'content-type': 'application/json' }); response.end(JSON.stringify({ error: error.message })); } }); return new Promise((resolve) => server.listen(port, () => resolve(server))); } },
    http: { async get(url) { return dark.web.fetch(url); }, async post(url, body) { return { status: 200, body, url }; } },
    web: { async fetch(url) { if (String(url).startsWith('mock://')) return { url, status: 200, text: 'Dark mock page: ' + url, title: 'Mock page', links: [] }; const response = await fetch(url); return { url, status: response.status, text: await response.text(), headers: Object.fromEntries(response.headers) }; }, async search(query) { return [{ title: 'Dark local search result', url: 'mock://search/' + encodeURIComponent(query), snippet: 'Offline-safe result for: ' + query }]; }, async open(url) { return dark.web.fetch(url); }, extract(page, selector) { return { selector, text: page.text || '' }; } },
    ai: { async summarize(input) { const text = typeof input === 'string' ? input : input.text || JSON.stringify(input); return text.slice(0, 160) + (text.length > 160 ? '…' : ''); }, async ask(prompt, input = '') { return { provider: process.env.DARK_AI_PROVIDER || 'local-safe', prompt, answer: await dark.ai.summarize(input || prompt) }; }, async classify(input, labels) { return Array.isArray(labels) ? labels[0] : 'unclassified'; }, async extract(input, shape) { const result = {}; for (const key of Object.keys(shape || {})) result[key] = null; result.source = typeof input === 'string' ? input.slice(0, 80) : input.url || 'local'; return result; } },
    file: require('node:fs/promises'), time: { now: () => new Date().toISOString(), sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }, json: JSON, env: { get: (name) => process.env[name] }, crypto: { uuid: () => require('node:crypto').randomUUID(), hash: (value) => require('node:crypto').createHash('sha256').update(String(value)).digest('hex') }
  }; return dark;
}
`;} 
function bundle(entryId, compiledModules) { return `'use strict';\n// Generated by DarkTalk. Dark understood the application; this is the JavaScript underneath.\nconst modules = Object.create(null);\n${compiledModules.join('\n\n')}\n${runtime()}\nconst cache = Object.create(null); const dark = createDark();\nfunction load(id) { if (cache[id]) return cache[id]; const factory = modules[id]; if (!factory) throw new Error(\`DarkTalk module not found: \${id}\`); const exports = {}; cache[id] = exports; factory(exports, load, dark); return exports; }\nconst application = load(${JSON.stringify(entryId)});\napplication.dark = dark;\napplication.ready = application.__run ? application.__run() : Promise.resolve();\napplication.ready.catch((error) => { console.error(error); process.exitCode = 1; });\nmodule.exports = application;\n`; }
module.exports = { generate, bundle };
