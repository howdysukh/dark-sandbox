**YES. That is a much cleaner convention.** And it gives DarkTalk a very clear distinction between the **application entrypoint** and normal source modules.

Let's lock this into the design.

# 🖤 DarkTalk File System Model

### The main application file

```text
shop.app.talk
```

There is **exactly one** `.app.talk` entrypoint for an application.

Everything else is:

```text
products.dark
users.dark
payments.dark
monitor.dark
utils.dark
```

So a project could look like:

```text
my-app/
│
├── my-app.app.talk        ← application entrypoint
│
├── products.dark
├── users.dark
├── payments.dark
├── workflows.dark
├── web.dark
│
├── config/
│   └── development.dark
│
└── package/
    └── ...
```

The compiler knows:

> **`.app.talk` = application root**

> **`.dark` = DarkTalk module**

---

# 🔗 Imports

The main file can import modules:

```dark
import products from "./products.dark"
import users from "./users.dark"
import payments from "./payments.dark"
```

Then:

```text
my-app.app.talk
       │
       ├── products.dark
       ├── users.dark
       └── payments.dark
```

And those modules can potentially import other modules:

```text
products.dark
      ↓
utils.dark
      ↓
web.dark
```

Exactly like a normal programming ecosystem.

---

# 🧠 But I want one important rule

A `.dark` file should **not automatically be an application.**

It's a module.

For example:

### `products.dark`

```dark
data Product {
    name: text
    price: number
    stock: number
}

action calculateDiscount(product) {

    if product.price > 1000 {
        return product.price * 0.9
    }

    return product.price
}
```

Then:

### `shop.app.talk`

```dark
app Shop

import products from "./products.dark"

api products {

    GET /products {
        return products.list()
    }
}
```

The application composes modules.

---

# 🔥 This gives us a really nice architecture

```text
                  app.talk
                     │
               Application
                  Root
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   products.dark  users.dark  payments.dark
        │            │            │
        └────────────┼────────────┘
                     ▼
                Dark Runtime
                     │
                     ▼
                JavaScript
```

---

# 📦 What can `.dark` contain?

We should **not restrict it to one thing**.

A module could contain:

```dark
data Product {
    ...
}

action calculatePrice() {
    ...
}

event product.updated

function helper() {
    ...
}
```

So `.dark` means:

> **Reusable DarkTalk source module.**

---

# 🧩 Exports

We probably want explicit exports eventually.

For example:

```dark
export data Product {

    name: text
    price: number
}
```

And:

```dark
export action calculatePrice(product) {

    return product.price
}
```

Then:

```dark
import { Product, calculatePrice } from "./products.dark"
```

This is much more predictable than exporting everything automatically.

### But...

For v0.1, we could make module exports automatic and introduce explicit `export` in v0.2.

I'm leaning toward **explicit exports from day one**, though, because we're designing a real language and it'll save us from awkward module semantics later.

---

# 🚨 One thing we should NOT do

Don't make:

```text
section.dark
```

a different language.

It uses **the exact same DarkTalk syntax**.

The only difference is:

```text
.app.talk
```

has an application declaration:

```dark
app MyApplication
```

while:

```text
.dark
```

is a module.

---

# Example: universal application

### `research.app.talk`

```dark
app Research

import web from "./web.dark"
import analysis from "./analysis.dark"

task dailyResearch {

    every 1 day {

        results = web.collect()

        analysis.process(results)
    }
}
```

### `web.dark`

```dark
export action collect() {

    results = await web.search("latest AI research")

    return results
}
```

### `analysis.dark`

```dark
export action process(results) {

    return ai.summarize(results)
}
```

That's **not a shop language**.

It's a general application language.

---

# 📐 So our file specification becomes

| Extension | Meaning | Quantity |
|---|---|---|
| `.app.talk` | Application entrypoint | **Exactly 1** |
| `.dark` | DarkTalk source module | Unlimited |
| `.js` | JavaScript escape-hatch / external JS | Unlimited |
| `.json` | Data/config where appropriate | Optional |

And:

```text
project/
│
├── application.app.talk    ← required
│
├── *.dark                   ← source modules
├── *.js                     ← optional JS
└── dark.config              ← compiler configuration
```

### One additional rule:

**The `.app.talk` file doesn't need to be named after the app.**

So:

```text
main.app.talk
```

is valid.

But:

```text
shop.app.talk
```

is probably the natural convention.

---

## 🔒 I would officially lock this decision:

> **DarkTalk applications contain exactly one `.app.talk` entrypoint. The `.app.talk` file defines the application and serves as the compilation root. All reusable DarkTalk source is contained in `.dark` modules, which may be imported by the entrypoint or other modules. JavaScript remains an optional escape hatch.**

That's a **very good foundation** for the module system and compiler architecture.

Next grammar decision I'd tackle is **imports + exports properly**, because once we define those, we can start designing how the compiler builds the entire application's module graph.
