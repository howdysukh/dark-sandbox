# DarkTalk Language Specification v0.1

## Purpose

DarkTalk is a universal, declarative application-development language targeting JavaScript/Node.js. Its syntax describes reusable application behaviour, never a specific business domain.

## Source model

- One `*.app.talk` file is passed to the compiler as the application entry point; it begins with `app Name`.
- `.dark` files are ordinary DarkTalk modules and may import other `.dark` files recursively.
- `#add "path.dark" as namespace` imports a module under an explicit namespace.
- `#add "path.js" as namespace` imports a CommonJS JavaScript module as an escape hatch.
- Circular `.dark` imports are rejected.

## Declarations

`data Name { field: type }` and `user Name { field: type }` declare in-memory structured records. Type names (`text`, `number`, `boolean`, `email`, `url`, `file`, `date`, `datetime`) are descriptive in v0.1 and become validation hooks later.

`function` and `action` compile to asynchronous JavaScript functions. `api Name { GET "/route" { … } }` registers an API route. `event name(payload)` declares an event; `when name(payload) { … }` registers its handler. `task name every 5 minutes { … }` declares scheduled work. `config name = value` provides configuration and `secret NAME` marks an environment value required by a capability.

## Statements and expressions

Statements: assignment, `print(value)`, `return value`, `fail value`, `if/else`, `while`, `for item in values`, and `emit event.name(value)`.

Expressions: literals, arrays, objects, member/index access, calls, unary `!`/`-`, binary arithmetic/comparison/logical operators, `await`, `create Model { field: value }`, and `list Model`.

## Dark Core and diagnostics

`web`, `ai`, `http`, `file`, `time`, `crypto`, `json`, and `env` are protected runtime namespaces. The compiler rejects attempts to redeclare or import over them. Web and AI have local-safe fallbacks for offline examples.

Compiler errors are red `ERROR` followed by green, actionable `FIX` text and source location when available. Dark uses a first-person companion voice but never claims work it did not perform.
