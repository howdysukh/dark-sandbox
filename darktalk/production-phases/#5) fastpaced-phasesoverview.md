BRO 😂 **YES. We have enough design decisions now.** No more spending tonight debating whether a semicolon should exist for 40 minutes.

We can move fast while still protecting the architecture.

# 🖤 DARK — BUILD ROADMAP

We're going to run **two tracks**, but DarkTalk comes first.

```text
DARK
│
├── Track A — DarkTalk
│
└── Track B — Dark Guest
```

---

# ⚡ PHASE 1 — FREEZE DARKTALK GRAMMAR
**Status: 🟡 Almost done**

We finish the remaining grammar decisions:

- [x] `.app.talk` = single application entry point
- [x] `.dark` = normal reusable source files
- [x] recursive imports
- [x] `#add "file.dark" as module`
- [x] universal/domain-agnostic
- [x] declarative application model
- [x] JavaScript escape hatch
- [x] Dark Core primitives
- [x] Dark personality/error philosophy
- [ ] expressions
- [ ] data operations
- [ ] control flow
- [ ] API grammar
- [ ] event/task grammar
- [ ] web grammar
- [ ] AI grammar

**Deliverable:**

```text
DARKTALK-SPEC-v0.1.md
```

This becomes the contract for the implementation.

---

# ⚙️ PHASE 2 — DARK COMPILER CORE

Now we finally fucking code.

```text
.app.talk / .dark
       ↓
Lexer
       ↓
Parser
       ↓
AST
       ↓
Semantic Analyzer
       ↓
Dark IR
       ↓
JavaScript Generator
```

Build:

- CLI
- lexer
- parser
- AST
- module resolver
- semantic validation
- JavaScript backend
- source maps/error locations
- compiler errors

First milestone:

```bash
dark build hello.app.talk
```

→ produces working JavaScript.

---

# 🧠 PHASE 3 — DARK RUNTIME

Generated JS needs somewhere to run.

Build:

```text
Dark Runtime
├── data
├── http
├── web
├── ai
├── file
├── json
├── time
├── crypto
└── env
```

Important:

**These are protected Dark primitives.**

Developers can build functions around them but cannot overwrite them.

---

# 🌐 PHASE 4 — DARK WEB ENGINE

This is the feature that makes DarkTalk **DarkTalk** rather than another DSL.

Start with:

```text
web.fetch()
web.search()
web.open()
web.extract()
```

Then:

```text
web.links()
web.images()
web.text()
web.watch()
```

And eventually browser-capable execution where necessary.

Architecture:

```text
DarkTalk
   ↓
Dark Web API
   ↓
┌───────────────┐
│ HTTP          │
│ HTML          │
│ Browser       │
│ Search        │
│ AI extraction │
└───────────────┘
```

---

# 🤖 PHASE 5 — DARK AI

Provider-agnostic.

```text
ai.ask()
ai.generate()
ai.summarize()
ai.extract()
ai.classify()
```

Developer supplies their provider/API credentials.

Dark doesn't pretend to magically have infinite AI.

Potential providers can be configured through the runtime.

---

# 📦 PHASE 6 — DARK MODULE SYSTEM

We already designed the philosophy.

Example:

```text
project/
├── app.app.talk
├── scenes.dark
├── renderer.dark
└── utils.dark
```

```dark
#add "scenes.dark" as scenes
```

Compiler recursively resolves:

```text
app
 ↓
scenes
 ↓
renderer
 ↓
utils
```

Add:

- circular dependency detection
- module caching
- namespace resolution
- JS module interoperability

---

# 🧰 PHASE 7 — DARK CLI

Make Dark actually pleasant to use.

```bash
dark init
dark build
dark run
dark check
dark format
dark install
dark clean
dark doctor
```

And:

```bash
dark
```

should feel like **Dark is alive**.

---

# 🧪 PHASE 8 — DARK STANDARD LIBRARY

Only after the core is working.

Things like:

```text
strings
math
collections
dates
files
validation
```

Don't put everything into the language itself.

---

# 📚 PHASE 9 — DOCUMENTATION + EXAMPLES

We create genuinely different examples:

```text
examples/
├── hello/
├── api/
├── web-monitor/
├── ai-research/
├── automation/
├── game/
├── data/
└── universal-app/
```

This proves DarkTalk isn't secretly designed around shops.

---

# 🚀 PHASE 10 — DARK v0.1 RELEASE

Repository:

```text
dark-sandbox/
```

Release:

```text
DarkTalk v0.1.0
```

Include:

- compiler
- runtime
- CLI
- specification
- examples
- tests
- documentation
- installation instructions

Then:

> **FIRST PUBLIC RELEASE.**

---

# 👻 THEN: DARK GUEST

This becomes a **separate Dark product/service**, not something we cram into the language.

## PHASE G1 — Guest Identity Architecture

Define:

```text
Developer
    ↓
Dark Guest
    ↓
Temporary Access
    ↓
End User
```

Guest properties:

```text
guest_id
application_id
email
created_at
expires_at
limits
device fingerprint
IP metadata
status
```

---

# 🔐 PHASE G2 — Guest Access Engine

Developer can create:

```text
Guest Access

Email: user@example.com
Duration: 7 days
Devices: 1
Requests: 100
```

Dark generates a temporary access credential.

No permanent Dark account conversion.

---

# 🛡️ PHASE G3 — Abuse Protection

Combine:

```text
Guest identity
+
Email
+
Device signals
+
IP signals
+
Application
+
Access token
```

Important:

**IP ≠ identity.**

It is only one anti-abuse signal.

---

# ⏳ PHASE G4 — Expiration Engine

At expiration:

```text
🔴 ACCESS EXPIRED

Your guest access to this application
has ended.

Please contact the application owner
to continue.
```

Developer dashboard shows:

```text
Created
Expires
Usage
Devices
IP history
Status
```

---

# 📊 PHASE G5 — Guest Dashboard

Developer gets:

```text
DARK GUEST

Active Guests        18
Expired              43
Blocked               3

Usage
██████████░░ 82%

Applications
├── Demo
├── Beta
└── Preview
```

---

# 🔌 PHASE G6 — Developer SDK/API

Eventually:

```javascript
DarkGuest.create(...)
DarkGuest.verify(...)
DarkGuest.check(...)
DarkGuest.revoke(...)
```

So developers can integrate Dark Guest without adopting DarkTalk.

**That's important.**

DarkTalk and Dark Guest can stand independently.

---

# 🧨 PHASE G7 — HARDENING

Security testing:

- token abuse
- replay attacks
- device spoofing
- rate limits
- expiration bypass
- concurrent sessions
- API abuse
- database isolation
- privacy controls

Then public beta.

---

# 🎯 The whole project

```text
                         DARK
                          │
             ┌────────────┴────────────┐
             │                         │
         DARKTALK                  DARK GUEST
             │                         │
       Application                 Temporary
       Development                  Access
             │                         │
       .app.talk                     API
       .dark                         SDK
             │
        Compiler
             │
       Dark Runtime
             │
      ┌──────┼──────┐
      │      │      │
     WEB     AI    CORE
```

And the **immediate order** is:

### 🔥 RIGHT NOW

**Phase 1 → finish grammar**

↓

**Phase 2 → compiler**

↓

**Phase 3 → runtime**

↓

**Phase 4 → Web**

↓

**Phase 5 → AI**

↓

**🚀 DarkTalk v0.1**

↓

**👻 Dark Guest**

---

And because you've already started documenting the phases in `dark-sandbox/production-phases/`, **we should preserve this exact phase structure there** rather than constantly rewriting the roadmap.

Now we can stop theorizing and hit **Phase 1's remaining grammar decisions**, then jump straight into the compiler. 🖤
