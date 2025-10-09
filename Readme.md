# 🐦 Flappy Game

A simple, fast Flappy‑style arcade game built with JavaScript and HTML5 Canvas. Tap or press to flap, dodge obstacles, and chase a new high score.

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg)](https://javascript.info)
[![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Features

- **Smooth gameplay** at 60 FPS with Canvas rendering
- **Responsive controls**: keyboard and pointer/touch
- **Procedural obstacles** with fair gaps and pacing
- **Score + High Score** tracking (localStorage)
- **Pause/Restart** support

## 🛠️ Tech Stack

- HTML5 Canvas, Vanilla JavaScript (ES6+)
- Lightweight build/dev via Vite

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

## 🚀 Quick Start

```bash
git clone <YOUR_REPO_URL>
cd flappy-game

# install deps
npm install

# start dev server
npm run dev

# open the URL from the terminal (usually http://localhost:5173)
```

## 📁 Project Structure

```
flappy-game/
├── index.html            # Canvas + UI
├── main.js               # Game loop, physics, input, rendering
├── package.json          # Scripts and deps
├── vite.config.js        # Vite config (optional)
└── Readme.md             # This file
```

## 🎮 How to Play

### Controls
- Mouse/Touch: click/tap to flap
- Keyboard: Space / ↑ Arrow to flap, P to pause, R to restart

### Rules
1. Flap to keep the bird in the air and pass through gaps.
2. Each set of pipes passed increases your score.
3. Hitting a pipe or the ground ends the run.
4. Your best score is saved locally.

## 🔧 Scripts

```bash
npm run dev       # Start development server with HMR
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Run linting (if configured)
```

## 🤝 Contributing

Contributions are welcome! Issues and PRs for performance, visuals, new obstacles, or difficulty options are appreciated.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**⭐ If you enjoy this project, please give it a star! ⭐**

Made with ❤️ — Have fun playing Flappy!

</div>