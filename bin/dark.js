#!/usr/bin/env node
'use strict';

const { startup, loading } = require('../src/cli/ui');

const fs = require('node:fs');
const path = require('node:path');
const ui = require('../src/cli/ui');
const { spawnSync } = require('node:child_process');
const { build } = require('../src/compiler');
const { DarkError } = require('../src/errors');
const PACKAGE = require('../package.json');
const [, , command, ...args] = process.argv;
const isTty = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const paint = (code, value) => isTty ? `\x1b[${code}m${value}\x1b[0m` : value;
const success = (value) => console.log(`${paint('32', '✓')} ${value}`);
const info = (value) => console.log(`${paint('36', '•')} ${value}`);

function welcome() {
  console.log(`\n${paint('35;1', 'DARK-TALK')}\n\nTALK TO THE APPLICATION LIKE YOU COULD NEVER\nTHINK IT AND CREATE IT.\n\nLEAVE THE REST ON ME.\n\nI'm Dark. Let’s build something.\n\nUsage:\n  dark init [folder]\n  dark build <app.app.talk>\n  dark run [app.app.talk]\n  dark check <app.app.talk>\n  dark doctor\n  dark install | update | uninstall\n  dark --version\n`);
}
function findEntry(directory = process.cwd()) {
  const entries = fs.readdirSync(directory).filter((file) => file.endsWith('.app.talk'));
  if (entries.length === 1) return path.join(directory, entries[0]);
  if (entries.length === 0) throw new DarkError("I couldn't find an .app.talk entry file here.", { file: directory, fix: 'Run dark init my-app, or pass a file: dark run my-app.app.talk.' });
  throw new DarkError("I found more than one .app.talk entry file here.", { file: directory, fix: 'Pass the one you want: dark run your-app.app.talk.' });
}
async function compile(file) {

  await loading(
    "Reading your application"
  );


  const result = build(
    path.resolve(file)
  );


  await loading(
    `Understanding ${result.moduleCount} ${
      result.moduleCount === 1 ? "file" : "files"
    }`
  );


  await loading(
    "Building JavaScript underneath"
  );


  return result;
}
function init(folder = 'my-dark-app') {
  const target = path.resolve(folder);

  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    throw new DarkError(
      "I won't write over an existing application.",
      {
        file: target,
        fix: 'Choose an empty folder, or create a new one with dark init another-app.'
      }
    );
  }

  const name =
    path.basename(target)
      .replace(/[^A-Za-z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '') || 'my-app';

  const title =
    name
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('') || 'MyDarkApp';

  // Project directories
  fs.mkdirSync(path.join(target, 'src'), { recursive: true });
  fs.mkdirSync(path.join(target, '.vscode'), { recursive: true });

  // Application entrypoint
  fs.writeFileSync(
    path.join(target, `${name}.app.talk`),
    `app ${title}

#add "src/greetings.dark" as greetings

print(await greetings.hello("Developer"))
`
  );

  // DarkTalk source
  fs.writeFileSync(
    path.join(target, 'src', 'greetings.dark'),
    `function hello(name) {
    return "Hello, " + name + " — Dark is awake."
}
`
  );

  // DarkTalk configuration
  fs.writeFileSync(
    path.join(target, 'dark.toml'),
    `[app]
name = "${name}"
version = "0.1.0-alpha"

[dark]
target = "node"
`
  );

  // Git ignore
  fs.writeFileSync(
    path.join(target, '.gitignore'),
    `dist/
node_modules/
.env
`
  );

  // VS Code workspace configuration
  fs.writeFileSync(
    path.join(target, '.vscode', 'settings.json'),
    `{
  "workbench.iconTheme": "darktalk-seti"
}
`
  );

  console.log("\nI'm creating your application...\n");

  success(`${name}/`);
  success(`${name}.app.talk`);
  success('src/greetings.dark');
  success('dark.toml');
  success('.vscode/settings.json');

  console.log(
    `\nYour application is waiting for you.\n\n` +
    `  cd ${name}\n` +
    `  code .\n\n` +
    `Dark will take care of the rest. 🖤\n`
  );
}
function doctor() {
  console.log('\nDARK DOCTOR\n\nI’m checking myself...\n');
  success(`DarkTalk ${PACKAGE.version}`); success(`Node.js ${process.version}`); success(`Platform: ${process.platform}/${process.arch}`); success(`CLI: ${process.argv[1]}`);
  process.env.DARKTALK_INSTALL_ROOT ? success(`Installed home: ${process.env.DARKTALK_INSTALL_ROOT}`) : info('Running from a local checkout. That is perfect for development.');
  console.log('\nEverything I can see looks healthy. I’m ready.\n');
}
function dependencyMessage() { console.log("\nI'm checking your DarkTalk dependencies...\n"); info('DarkTalk v0.1-alpha has no package registry yet.'); success('Your compiler and Dark Core are ready.'); console.log('\nFor JavaScript packages, use npm in your application for now.\n'); }
function updateMessage() { console.log("\nI'm careful with updates. I won't replace myself without a verified installer.\n"); info('Use the official installer when it is published, or update this local checkout with Git.'); console.log('The future installer URL is not live yet, so I will not invent one.\n'); }
function uninstall() {
  if (!args.includes('--yes')) throw new DarkError("I'm not leaving without confirmation.", { fix: 'Run dark uninstall --yes. Your applications will never be removed.' });
  const root = process.env.DARKTALK_INSTALL_ROOT;
  if (!root || !fs.existsSync(path.join(root, 'package.json'))) throw new DarkError("I can't find a managed DarkTalk installation to remove.", { fix: 'This looks like a local checkout. Delete it yourself only if you no longer need the source.' });
  fs.rmSync(root, { recursive: true, force: true }); console.log("\nI've removed the managed DarkTalk installation. Your applications are untouched.\n");
}
(async () => {

  try {

    await startup();

    if (!command || command === 'help' || command === '--help') {
      welcome();
      return;
    }


    if (command === '--version' || command === 'version') {
      console.log(`DarkTalk ${PACKAGE.version}`);
      return;
    }


    switch (command) {

      case 'init':
        init(args[0]);
        break;


      case 'doctor':
        doctor();
        break;


      case 'install':
        dependencyMessage();
        break;


      case 'update':
        updateMessage();
        break;


      case 'uninstall':
        uninstall();
        break;


      case 'build':
      case 'run':
      case 'check': {

        const input = args[0] || findEntry();


        if (!input) {
          throw new DarkError(
            `I need an .app.talk file for dark ${command}.`,
            {
              fix: `Try dark ${command} my-app.app.talk.`
            }
          );
        }


        const result = await compile(input);


        if (command === 'check') {

          console.log(
            "\nI'm satisfied. Your application is valid."
          );

          break;
        }


        console.log(
          `\nI'm ready. Your application is at:\n${result.outputFile}`
        );


        if (command === 'run') {

          console.log(
            "\nI'm waking your application up...\n"
          );


          const child = spawnSync(
            process.execPath,
            [result.outputFile],
            {
              stdio: 'inherit'
            }
          );


          process.exitCode =
            child.status ?? 1;
        }

        break;
      }


      default:

        welcome();
        process.exitCode = 1;

    }


  } catch (error) {


    if (error instanceof DarkError) {

      console.error(
        error.format()
      );


    } else {

      console.error(
        `\n${paint('31', 'ERROR:')} I couldn't finish this.\n\n` +
        `${paint('32', 'FIX:')} ${error.message}`
      );

    }


    process.exitCode = 1;

  }


})();