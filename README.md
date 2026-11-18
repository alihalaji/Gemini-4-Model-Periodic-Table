# Gemini 4 — The Periodic Table of AI Models

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> *What if Google named every AI model after a chemical element — and gave you a full 118-element periodic table to pick from?*

That's the whole vibe here. This is a fully interactive Gemini UI concept built around one dumb-but-brilliant idea: **use the periodic table as a model selector.**

---

## Wait, Why the Periodic Table?

Okay so here's the thing — Google already started this. With Gemini, they went with names like **Flash**, **Pro**, **Ultra**, and **Nano**. Cool, but kind of boring and hard to remember which one does what.

Then with Gemini 2.0 they named a model **Flash Thinking**. With 1.5 they had **Flash-8B**. These names don't exactly roll off the tongue.

So I started thinking: what's a system that is *already familiar*, *infinitely scalable*, has *built-in hierarchy*, and each entry has a memorable short symbol? The **periodic table of elements**. It has 118 slots, it's already organized by capability tiers (periods = generations, groups = specializations), and every element has a one-or-two-letter symbol that's instantly recognizable.

Hydrogen (`H`) — lightest, fastest, most abundant. Perfect for the ultra-fast everyday model.
Carbon (`C`) — the backbone of everything complex. Deep reasoning, obviously.
Neon (`Ne`) — noble, balanced, glows without trying too hard. Flagship.
Argon (`Ar`) — stable, inert, used in precision industrial work. Agentic code.

The naming just *writes itself.* And you get 114 more slots for whatever comes next.

---

## What's in This Repo

This is a pixel-faithful recreation of the Gemini web UI with the periodic table wired in as the actual model picker. Everything runs in the browser — no API keys, no server, just the idea brought to life.

**The periodic table popup** is the main event — it opens when you click the model pill in the composer. On desktop it floats above the input with a live element inspector. On mobile it comes up as a full bottom sheet with a compact fit-to-screen table and a searchable list mode.

**The released models** (Hydrogen, Carbon, Neon, Argon) light up with color-coded themes. The other 114 elements sit there as "coming soon" — which honestly feels accurate.

**The chat** is a local simulation. Say hi and you get a greeting back. Ask it anything real and it'll tell you to go use actual Gemini. It's honest about what it is.

---

## The Four Models, Explained

| # | Element | Symbol | Vibe | Why it fits |
|:-:|:-------:|:------:|:----:|:------------|
| 1 | **Hydrogen** | H | ⚡ Ultra-fast | Lightest element. Reacts instantly. It's just speed. |
| 6 | **Carbon** | C | 🧠 Deep reasoning | Carbon is literally the foundation of complex life. Deep, structural, essential. |
| 10 | **Neon** | Ne | ✨ Flagship | Noble gas. Bright, balanced, doesn't react badly to anything. The default for a reason. |
| 18 | **Argon** | Ar | 🤖 Agentic code | Argon is used in precision manufacturing and welding. Steady, long-running, industrial-grade. |

---

## Keyboard Shortcuts

| Shortcut | What it does |
| :--- | :--- |
| `⌘ K` / `Ctrl + K` | Quick element search |
| `⌘ ⇧ O` / `Ctrl + Shift + O` | New chat |
| `/` | Filter inside the periodic table |
| `Esc` | Close whatever's open |

---

## Running It

```bash
git clone https://github.com/alihalaji/Gemini-4-Model-Periodic-Table.git
cd Gemini-4-Model-Periodic-Table
npm install
npm run dev
```

Opens at `http://localhost:3000`. No `.env` needed, no backend, no keys. Just open it.

```bash
npm run build    # production bundle
npm run preview  # preview the build locally
npm run lint     # TypeScript check
```

---

## Stack

React 19 · TypeScript 5 · Vite 8 · Tailwind CSS v4 · Motion (Framer) · Lucide icons

---

## Project Layout

```
src/
├── App.tsx                   — state, layout, modals, chat flow
├── data/elements.ts          — all 118 elements + Gemini model metadata
└── components/
    ├── PeriodicTablePopup.tsx — the whole periodic table UI
    ├── Composer.tsx           — input bar, model pill, attachments, voice
    ├── ConversationView.tsx   — message bubbles, thinking trace, feedback
    ├── Sidebar.tsx            — nav rail, mobile drawer, history
    └── Icons.tsx              — Gemini sparkle, sparkle icon, etc.
```

---

## Contributing

If you want to add more element-to-model mappings, improve the mobile table layout, or just fix something that's broken — go for it. See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Disclaimer

Fan-made concept. Not affiliated with Google or the Gemini team. If anyone from Google is reading this — the naming idea is free, you're welcome.

## License

[MIT](./LICENSE)
