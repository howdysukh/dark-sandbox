'use strict';
const { DarkError } = require('./errors');
const RESERVED = new Set(['web', 'ai', 'http', 'file', 'time', 'crypto', 'json', 'env', 'dark']);
function validate(program, file, { isEntry = false } = {}) {
  if (isEntry && !program.app) throw new DarkError("I couldn't find your application name.", { file, fix: 'Start the entry file with app YourApplication.' });
  if (!isEntry && program.app) throw new DarkError("'app' belongs only in your .app.talk entry file.", { file, fix: 'Move the app declaration into the single .app.talk file.' });
  const names = new Set(); const dataNames = new Set();
  for (const item of program.body) {
    if (item.type === 'ImportDeclaration') { if (RESERVED.has(item.alias)) throw new DarkError(`'${item.alias}' belongs to Dark Core.`, { file, fix: 'Choose another module alias; Dark Core names cannot be replaced.' }); if (names.has(item.alias)) throw new DarkError(`I found '${item.alias}' twice in this file.`, { file, fix: 'Give the import a unique alias.' }); names.add(item.alias); continue; }
    if (item.name && RESERVED.has(item.name)) throw new DarkError(`'${item.name}' belongs to Dark Core.`, { file, fix: 'Rename this declaration; Dark Core names cannot be recreated.' });
    if (item.name && ['FunctionDeclaration', 'ActionDeclaration', 'DataDeclaration', 'UserDeclaration', 'ApiDeclaration', 'TaskDeclaration'].includes(item.type)) { if (names.has(item.name)) throw new DarkError(`I found '${item.name}' twice in this file.`, { file, fix: 'Give one declaration a different name.' }); names.add(item.name); if (item.type === 'DataDeclaration' || item.type === 'UserDeclaration') dataNames.add(item.name); }
    if ((item.type === 'DataDeclaration' || item.type === 'UserDeclaration') && new Set(item.fields.map((field) => field.name)).size !== item.fields.length) throw new DarkError(`'${item.name}' has a field more than once.`, { file, fix: 'Give each data field a unique name.' });
  }
  return { dataNames };
}
module.exports = { validate, RESERVED };
