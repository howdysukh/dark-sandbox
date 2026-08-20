'use strict';

class DarkError extends Error {
  constructor(message, { file, line, column, fix } = {}) {
    super(message);
    this.file = file;
    this.line = line;
    this.column = column;
    this.fix = fix;
  }

  format() {
    const location = this.file ? `\n${this.file}${this.line ? `:${this.line}:${this.column || 1}` : ''}` : '';
    const fix = this.fix || 'Check this declaration and try again.';
    return `\n\x1b[31mERROR:\x1b[0m ${this.message}${location}\n\n\x1b[32mFIX:\x1b[0m ${fix}`;
  }
}

module.exports = { DarkError };
