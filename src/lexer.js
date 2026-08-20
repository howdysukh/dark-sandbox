'use strict';

const { DarkError } = require('./errors');

const KEYWORDS = new Set([
  'app', 'function', 'action', 'return', 'print', 'as', 'data', 'user', 'api', 'event',
  'when', 'task', 'config', 'secret', 'if', 'else', 'while', 'for', 'in', 'true', 'false',
  'null', 'await', 'fail', 'emit', 'create', 'list', 'find', 'GET', 'POST', 'PUT', 'DELETE',
  'every', 'hour', 'hours', 'minute', 'minutes', 'js'
]);

function lex(source, file = '<source>') {
  const tokens = []; let index = 0; let line = 1; let column = 1;
  const push = (type, value, startLine = line, startColumn = column) => tokens.push({ type, value, line: startLine, column: startColumn });
  const advance = () => { const char = source[index++]; if (char === '\n') { line += 1; column = 1; } else column += 1; return char; };
  const match = (value) => source.slice(index, index + value.length) === value;
  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) { advance(); continue; }
    if (match('//')) { while (index < source.length && source[index] !== '\n') advance(); continue; }
    if (match('/*')) { advance(); advance(); while (index < source.length && !match('*/')) advance(); if (!match('*/')) throw new DarkError('I found a comment that never ends.', { file, line, column, fix: 'Add */ to close the comment.' }); advance(); advance(); continue; }
    const startLine = line; const startColumn = column;
    if (char === '#') { advance(); let word = ''; while (/[A-Za-z]/.test(source[index] || '')) word += advance(); if (word !== 'add') throw new DarkError(`I don't know the directive #${word}.`, { file, line: startLine, column: startColumn, fix: 'Use #add "file.dark" as moduleName.' }); push('ADD', '#add', startLine, startColumn); continue; }
    if (/[A-Za-z_]/.test(char)) { let word = ''; while (/[A-Za-z0-9_]/.test(source[index] || '')) word += advance(); push(KEYWORDS.has(word) ? word.toUpperCase() : 'IDENTIFIER', word, startLine, startColumn); continue; }
    if (/[0-9]/.test(char)) { let value = ''; while (/[0-9.]/.test(source[index] || '')) value += advance(); if ((value.match(/\./g) || []).length > 1) throw new DarkError(`'${value}' is not a valid number.`, { file, line: startLine, column: startColumn, fix: 'Use one decimal point at most.' }); push('NUMBER', Number(value), startLine, startColumn); continue; }
    if (char === '"') { advance(); let value = ''; while (index < source.length && source[index] !== '"') { if (source[index] === '\\') { advance(); const escaped = advance(); value += ({ n: '\n', t: '\t', '"': '"', '\\': '\\' }[escaped] ?? escaped); } else value += advance(); } if (source[index] !== '"') throw new DarkError('I found a string that never ends.', { file, line: startLine, column: startColumn, fix: 'Add a closing double quote.' }); advance(); push('STRING', value, startLine, startColumn); continue; }
    const pairs = [['==', 'EQEQ'], ['!=', 'NOTEQ'], ['>=', 'GTE'], ['<=', 'LTE'], ['&&', 'AND'], ['||', 'OR'], ['+=', 'PLUSEQ'], ['-=', 'MINUSEQ'], ['->', 'ARROW']];
    const pair = pairs.find(([value]) => match(value)); if (pair) { for (let i = 0; i < pair[0].length; i += 1) advance(); push(pair[1], pair[0], startLine, startColumn); continue; }
    const symbols = { '{': 'LBRACE', '}': 'RBRACE', '(': 'LPAREN', ')': 'RPAREN', '[': 'LBRACKET', ']': 'RBRACKET', ',': 'COMMA', '.': 'DOT', ':': 'COLON', '=': 'EQUALS', '+': 'PLUS', '-': 'MINUS', '*': 'STAR', '/': 'SLASH', '%': 'PERCENT', '>': 'GT', '<': 'LT', '!': 'BANG' };
    if (symbols[char]) { advance(); push(symbols[char], char, startLine, startColumn); continue; }
    throw new DarkError(`I couldn't understand '${char}'.`, { file, line: startLine, column: startColumn, fix: 'Use valid DarkTalk syntax or remove this character.' });
  }
  push('EOF', null); return tokens;
}
module.exports = { lex };
