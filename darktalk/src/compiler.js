'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { lex } = require('./lexer');
const { parse } = require('./parser');
const { validate } = require('./semantic');
const { generate, bundle } = require('./generator');
const { DarkError } = require('./errors');

function build(entryFile) {
  if (!entryFile.endsWith('.app.talk')) throw new DarkError('Your entry file needs the .app.talk extension.', { file: entryFile, fix: 'Use a single entry file such as hello.app.talk.' });
  const modules = new Map();
  const visiting = new Set();
  function visit(file, isEntry = false) {
    const absolute = path.resolve(file);
    if (modules.has(absolute)) return;
    if (visiting.has(absolute)) throw new DarkError('I found a circular #add dependency.', { file: absolute, fix: 'Remove the cycle so each module can be understood in order.' });
    if (!fs.existsSync(absolute)) throw new DarkError(`I couldn't find '${file}'.`, { file: absolute, fix: 'Check the #add path and make sure the file exists.' });
    visiting.add(absolute);
    const program = parse(lex(fs.readFileSync(absolute, 'utf8'), absolute), absolute);
    validate(program, absolute, { isEntry });
    const imports = new Map();
    for (const declaration of program.body.filter((item) => item.type === 'ImportDeclaration')) {
      const imported = path.resolve(path.dirname(absolute), declaration.source);
      if (!imported.endsWith('.dark') && !imported.endsWith('.js')) throw new DarkError('DarkTalk modules must end with .dark or .js.', { file: absolute, fix: 'Use #add "module.dark" as moduleName.' });
      if (imported.endsWith('.js')) { if (!fs.existsSync(imported)) throw new DarkError(`I couldn't find '${declaration.source}'.`, { file: absolute, fix: 'Check the #add path and make sure the JavaScript file exists.' }); imports.set(declaration.source, imported); }
      else { visit(imported, false); imports.set(declaration.source, imported); }
    }
    visiting.delete(absolute);
    modules.set(absolute, { program, imports, isEntry });
  }
  visit(entryFile, true);
  const source = bundle(path.resolve(entryFile), [...modules.entries()].map(([id, module]) => generate(module.program, id, module.imports, { isEntry: module.isEntry })));
  const outputDirectory = path.join(path.dirname(path.resolve(entryFile)), 'dist');
  fs.mkdirSync(outputDirectory, { recursive: true });
  const outputFile = path.join(outputDirectory, `${path.basename(entryFile, '.app.talk')}.js`);
  fs.writeFileSync(outputFile, source);
  return { outputFile, moduleCount: modules.size };
}

module.exports = { build };
