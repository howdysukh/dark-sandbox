# DarkTalk v0.1

> Talk to the application like you could never think it and create it. Leave the rest on me.

DarkTalk is an open-source, non-profit learning project from wsukh. It is a small, declarative application-development language that compiles to JavaScript/Node.js. It does not replace JavaScript: DarkTalk describes application intent and can import JavaScript when needed.

## Try it

```bash
npm test
node bin/dark.js run examples/hello.app.talk
node bin/dark.js run examples/calculator.app.talk
node bin/dark.js run examples/data-api.app.talk
node bin/dark.js run examples/web-ai.app.talk
```

`dark build <app.app.talk>` writes JavaScript to the source folder's `dist/` directory. `dark check` validates and builds without running it.

## Files and modules

Each project has one entry file, `*.app.talk`. Any number of `.dark` files can be imported recursively:

```dark
#add "greetings.dark" as greetings
print(await greetings.hello("Sukh"))
```

JavaScript interoperability uses the same friendly import form:

```dark
#add "helper.js" as helper
print(await helper.greet("Sukh"))
```

## v0.1 language

```dark
app Notes

data Note {
    title: text
    body: text
}

note = create Note { title: "Hello", body: "Dark is awake" }

action titles() {
    notes = list Note
    for note in notes {
        print(note.title)
    }
}

api notes {
    GET "/notes" {
        return list Note
    }
}
```

Supported: values, arrays, objects, arithmetic/comparison/logical expressions, assignments, functions/actions, `return`, `fail`, `if/else`, `while`, `for … in`, data/user declarations, `create`, `list`, APIs, events, task declarations, config/secrets, recursive modules, and JavaScript imports.

## Dark Core

Protected runtime namespaces: `web`, `ai`, `http`, `file`, `time`, `crypto`, `json`, and `env`. User code cannot redefine or shadow them.

`web.search`, `web.open`, and `web.fetch` are available. `ai.summarize`, `ai.ask`, `ai.classify`, and `ai.extract` work in local-safe fallback mode, so examples do not need network access or API keys.

## Deliberate v0.1 limits

This is an executable compiler prototype, not production infrastructure. Data is in memory; API declarations register into the generated runtime rather than start a full HTTP server; task schedules are declared but not started; real browser automation and real AI-provider adapters are intentionally not bundled. See [the specification](docs/DARKTALK-SPEC-v0.1.md) for the v0.1 contract.
