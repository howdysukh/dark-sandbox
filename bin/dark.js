#!/usr/bin/env node
'use strict';
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { build } = require('../src/compiler');
const { DarkError } = require('../src/errors');
const [, , command, input] = process.argv;

function welcome() {
  console.log('\nDARK-TALK\n\nTALK TO THE APPLICATION LIKE YOU COULD NEVER\nTHINK IT AND CREATE IT.\n\nLEAVE THE REST ON ME.\n\nI\'m Dark. Let\'s build something.\n\nUsage:\n  dark build <app.app.talk>\n  dark run <app.app.talk>\n  dark check <app.app.talk>\n');
}
function compile(file) {
  console.log("I'm reading your application...");
  const result = build(path.resolve(file));
  console.log(`I've understood ${result.moduleCount} ${result.moduleCount === 1 ? 'file' : 'files'}.`);
  console.log("I'm building the JavaScript underneath. You don't need to worry about it.");
  return result;
}
try {
  if (!command || command === 'help' || command === '--help') welcome();
  else if (!input || !['build', 'run', 'check'].includes(command)) { welcome(); process.exitCode = 1; }
  else {
    const result = compile(input);
    if (command === 'check') console.log("\nI'm satisfied. Your application is valid.");
    else {
      console.log(`\nI'm ready. Your application is at:\n${result.outputFile}`);
      if (command === 'run') {
        console.log("\nI'm waking your application up...\n");
        const child = spawnSync(process.execPath, [result.outputFile], { stdio: 'inherit' });
        process.exitCode = child.status ?? 1;
      }
    }
  }
} catch (error) {
  if (error instanceof DarkError) console.error(error.format());
  else console.error(`\n\x1b[31mERROR:\x1b[0m I couldn't finish this build.\n\n\x1b[32mFIX:\x1b[0m ${error.message}`);
  process.exitCode = 1;
}
