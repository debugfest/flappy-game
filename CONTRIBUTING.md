# Contributing Guide

Thanks for your interest in improving Flappy Game! This guide keeps contributions simple and consistent.

## Ways to Contribute
- Open issues (bugs, ideas, questions)
- Improve visuals/UX (canvas rendering, accessibility, responsiveness)
- Add features (difficulty levels, themes, sounds, touch controls)
- Refactor/cleanup and small fixes
- Docs (README, comments, examples)

## Quick Start
```bash
git clone https://github.com/debugfest/flappy-game.git
cd flappy-game
npm install
npm run dev
```

Useful scripts:
```bash
npm run dev       # Start dev server (Vite)
npm run build     # Production build
npm run preview   # Preview build locally
```

## Workflow
1. Fork the repo and create a feature branch:
   ```bash
   git checkout -b feat/short-description
   # or fix/short-description, docs/short-description
   ```
2. Make focused changes and commit with clear messages:
   - type(scope): short summary
   - Example: `feat(game): add pipe difficulty levels`
3. Push your branch and open a Pull Request (PR).

## Coding Standards
- Vanilla JavaScript (ES6+) + HTML5 Canvas
- Prefer readable names and small functions; avoid deep nesting
- Keep comments only for non‑obvious logic
- Keep DOM access minimal inside the render loop
- No unused variables/parameters; keep code lint‑friendly

### Project Conventions
- Game loop and logic in `main.js`
- Static assets under `public/` (if any)
- Keep constants grouped at top of file or a separate module

## PR Checklist
- [ ] Runs locally: `npm run dev`
- [ ] Build works: `npm run build`
- [ ] No unrelated file changes
- [ ] Screenshots/GIFs for visual changes (optional but helpful)
- [ ] Description explains the why + what

## Reporting Issues
Please include:
- What happened vs. expected behavior
- Steps to reproduce
- Environment (OS, browser)
- Screenshots/GIFs if visual

## License
By contributing, you agree your contributions are licensed under the repository’s MIT license.

Thanks again for helping make Flappy Game better!
