const vscode = require("vscode");
const fs = require("node:fs");
const path = require("node:path");

const corePath = path.join(
  __dirname,
  "dark-core.json"
);

const darkCore = JSON.parse(
  fs.readFileSync(corePath, "utf8")
);

function runDark(command, file) {
  const terminal = vscode.window.createTerminal("DarkTalk");
  terminal.show();

  const dark = process.platform === "win32" ? "dark.cmd" : "dark";
  const args = [command];

  if (file) {
    args.push(file);
  }

  terminal.sendText(
    `${dark} ${args.map((arg) => JSON.stringify(arg)).join(" ")}`
  );
}

function activate(context) {
  // ─────────────────────────────────────────────
  // DarkTalk ♥ status-bar icon
  // ─────────────────────────────────────────────

const provider =
  vscode.languages.registerCompletionItemProvider(
    [
      "darktalk",
      "darktalk-app"
    ],
    {
      provideCompletionItems(document, position) {

        console.log(
  "DarkTalk completion triggered:",
  document.languageId,
  document.lineAt(position.line).text
);

  // Dark Core autocomplete
  const line = document
  .lineAt(position.line)
  .text
  .slice(0, position.character);

  console.log("CURRENT LINE:", line);

// Dark.Module.method autocomplete
const match = line.match(/dark\.(\w+)\.$/i);

if (match) {

  const moduleName = match[1];
  const module = darkCore[moduleName];

  if (!module) {
    return;
  }

  return Object.entries(module.methods)
    .map(([method, info]) => {

      const item =
        new vscode.CompletionItem(
          method,
          vscode.CompletionItemKind.Method
        );

      item.detail = info.signature;

      item.documentation =
        new vscode.MarkdownString(
          info.description
        );

      item.insertText =
        new vscode.SnippetString(
          `${method}($1)`
        );

      return item;
    });
}


// Dark namespace autocomplete
if (line.endsWith("dark.")) {

  return Object.entries(darkCore)
    .map(([name, module]) => {

      const item =
        new vscode.CompletionItem(
          name,
          vscode.CompletionItemKind.Module
        );

      item.detail = module.description;

      return item;
    });
}


  // Normal DarkTalk keywords
  const keywords = [
    "app",
    "function",
    "data",
    "action",
    "event",
    "task",
    "#add",
    "import",
    "Dark"
  ];

  return keywords.map(word => {
    const item = new vscode.CompletionItem(
      word,
      vscode.CompletionItemKind.Keyword
    );

    item.detail = "DarkTalk keyword";

    return item;
  });
}
    }, "."
  );

context.subscriptions.push(provider);


// ================================
// DarkTalk Hover Provider
// ================================

const hoverProvider =
  vscode.languages.registerHoverProvider(
    [
      "darktalk",
      "darktalk-app"
    ],
    {
      provideHover(document, position) {

        const range =
          document.getWordRangeAtPosition(position);

        if (!range) {
          return;
        }

        const word =
          document.getText(range);

        for (const [name, module] of Object.entries(darkCore)) {

          for (const [method, info] of Object.entries(module.methods)) {

            if (
              word === method ||
              word === `${name}.${method}`
            ) {

              const markdown =
                new vscode.MarkdownString();

              markdown.appendMarkdown(
                `## Dark.${name}.${method}\n\n`
              );

              markdown.appendMarkdown(
                `**Signature:**\n`
              );

              markdown.appendCodeblock(
                info.signature,
                "dark"
              );

              markdown.appendMarkdown(
                `\n${info.description}`
              );

              return new vscode.Hover(markdown);
            }
          }
        }
      }
    }
  );

context.subscriptions.push(hoverProvider);

  const darkTalkStatus = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    0
  );

  darkTalkStatus.text = "$(heart)";
  darkTalkStatus.tooltip = "DarkTalk";
  darkTalkStatus.command = "darktalk.doctor";

  function updateDarkTalkIcon() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      darkTalkStatus.hide();
      return;
    }

    const language = editor.document.languageId;

    if (language === "darktalk" || language === "darktalk-app") {
      darkTalkStatus.show();
    } else {
      darkTalkStatus.hide();
    }
  }

  context.subscriptions.push(
    darkTalkStatus,
    vscode.window.onDidChangeActiveTextEditor(updateDarkTalkIcon)
  );

  updateDarkTalkIcon();

  // ─────────────────────────────────────────────
  // DarkTalk: Run
  // ─────────────────────────────────────────────

  const run = vscode.commands.registerCommand("darktalk.run", () => {
    const file = vscode.window.activeTextEditor?.document.fileName;

    if (!file) {
      vscode.window.showErrorMessage(
        "DarkTalk: Open an .app.talk file first."
      );
      return;
    }

    runDark("run", file);
  });

  // ─────────────────────────────────────────────
  // DarkTalk: Build
  // ─────────────────────────────────────────────

  const build = vscode.commands.registerCommand("darktalk.build", () => {
    const file = vscode.window.activeTextEditor?.document.fileName;

    if (!file) {
      vscode.window.showErrorMessage(
        "DarkTalk: Open an .app.talk file first."
      );
      return;
    }

    runDark("build", file);
  });

  // ─────────────────────────────────────────────
  // DarkTalk: Check
  // ─────────────────────────────────────────────

  const check = vscode.commands.registerCommand("darktalk.check", () => {
    const file = vscode.window.activeTextEditor?.document.fileName;

    if (!file) {
      vscode.window.showErrorMessage(
        "DarkTalk: Open an .app.talk file first."
      );
      return;
    }

    runDark("check", file);
  });

  // ─────────────────────────────────────────────
  // DarkTalk: Doctor
  // ─────────────────────────────────────────────

  const doctor = vscode.commands.registerCommand(
    "darktalk.doctor",
    () => {
      runDark("doctor");
    }
  );

  context.subscriptions.push(
    run,
    build,
    check,
    doctor
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};