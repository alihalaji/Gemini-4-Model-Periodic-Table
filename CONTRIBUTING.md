# Contributing

Hey, glad you're here. This is a pretty small project so contributing is straightforward — no bureaucracy, just good vibes and clean PRs.

## Getting Set Up

1. Fork the repo and clone your fork.
2. Install deps and start the dev server:
   ```bash
   npm install
   npm run dev
   ```
3. Before opening a PR, make sure TypeScript is happy and the build doesn't explode:
   ```bash
   npm run lint
   npm run build
   ```

## What's Worth Contributing

- **New element-to-model mappings** — if you have a good case for why, say, Lithium (`Li`) would make a great lightweight summarization model, write it up and add it to `src/data/elements.ts`. The logic is half science, half vibe.
- **Mobile layout improvements** — the periodic table on a small screen is genuinely hard. Any improvement there is appreciated.
- **Accessibility** — keyboard navigation, screen reader labels, focus states. Always welcome.
- **Bug fixes** — especially layout bugs at weird viewport sizes or with unusual system font scaling.

## Style Notes

- Keep the UI faithful to Material Design 3 dark conventions — no neon glows, no heavy drop shadows, no nested bordered cards inside cards.
- Hardcoded color values are intentional (the palette is very precise). Don't swap them for Tailwind named colors without a good reason.
- Keep PRs focused. One thing per PR is ideal. Include a screenshot if you're changing anything visual.

## Found a Bug?

[Open an issue](https://github.com/alihalaji/Gemini-4-Model-Periodic-Table/issues) with your browser, OS, viewport size, and steps to reproduce. The more specific the better.

