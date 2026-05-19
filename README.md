# Task Tetris

**[Open Task Tetris](https://timihaji.github.io/task-tetris/)**

A physics-based task manager where tasks fall and stack like Tetris blocks. Whatever touches the floor is what you can work on right now.

## How it works

Tasks fall under gravity and pile up. Blocks resting on the floor are your **actionable now** zone — they get a ✓ button you can click to complete. When you clear a block, everything above falls down.

## Features

- Drag, throw, and stack task blocks with real physics
- Resize blocks by dragging any edge or corner
- 6 visual themes: Playful, Modern, Brutalist, Neon, Soft, Terminal
- 20 colour palettes, fully customisable per-swatch
- Snap-to-grid with adjustable grid size
- Lasso select, group labels, waiting/blocked state
- Export/import board as JSON
- Works offline — no server, no install, just open the HTML file

## Controls

| Input | Action |
|---|---|
| Drag block | Move |
| Drag corner | Resize |
| ✓ tick | Complete (floor blocks only) |
| Double-click | Edit title |
| Right-click | Context menu |
| Drag empty area | Lasso select |
| Cmd/Ctrl+N | New task |
| Enter | Complete selected |
| Delete / ⌫ | Delete selected |
| G | Group selected (2+) |
| Space | Pause / resume gravity |
| Shift-click | Add to selection |
| ? | Help overlay |

## Run locally

Just open `index.html` in any browser — no server needed.
