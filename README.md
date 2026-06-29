# Schrödinger's Box

A browser-based quantum probability duel for [Entropy](https://entropy.hackclub.com/). Sit across from **The Observer**, bet **Alive** or **Dead** before the box opens, and survive nine rounds of escalating quantum cruelty.

Inspired by _Buckshot Roulette_. Built with [KAPLAY](https://kaplayjs.com/).

## Play

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). No install, no account — runs in any modern browser.

## How to play

1. Each round, a sealed box holds a cat in superposition.
2. Bet **ALIVE** or **DEAD** before observation collapses the wavefunction.
3. Correct guess → Observer loses a life. Wrong guess → you lose a life.
4. Use quantum items from your toolkit (max 4 slots) to peek, skew odds, entangle boxes, or cheat fate.
5. Survive three acts (9 rounds) and reduce the Observer to 0 lives.

### Acts

| Act                   | Rounds | Twists                                              |
| --------------------- | ------ | --------------------------------------------------- |
| I — The Box           | 1–3    | Pure 50/50, item grant, Observer bets               |
| II — Superposition    | 4–6    | Phantom box, half-life decay, entanglement          |
| III — Observer Effect | 7–9    | Peeking shifts reality, quantum shotgun, final duel |

### Items

| Item               | Effect                                           |
| ------------------ | ------------------------------------------------ |
| Geiger Counter     | Detect if odds ≠ 50/50                           |
| X-Ray Pulse        | Reveal one box's true state                      |
| Half-Life Vial     | −20% alive odds on active box                    |
| Entanglement Wire  | Link two boxes to opposite outcomes              |
| Decoherence Patch  | +1 life (max 4)                                  |
| Cigarette          | Observer skips this round; extra risk next round |
| Cat Treat          | Reroll a wrong collapse (once per run)           |
| Schrödinger's Dice | Next guess auto-wins (penalty if box was peeked) |

## Randomness (Entropy)

Every outcome uses **cryptographic randomness** via `crypto.getRandomValues()`:

```ts
// src/game/rng.ts
export function quantumRandom(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / (0xffffffff + 1);
}
```

- Uniform distribution over `[0, 1)`
- No seeded PRNG, no `Math.random()` for gameplay outcomes
- Item drops and Observer AI noise use the same RNG

## Build & deploy

```bash
bun run build    # outputs to dist/
bun run preview  # test production build
```

Deploy `dist/` to Vercel, Netlify, or Cloudflare Pages.

## Project structure

```
src/
├── main.ts
└── game/
    ├── audio.ts       # Web Audio (Geiger ticks, collapse sounds)
    ├── boxes.ts       # multi-box quantum state
    ├── items.ts       # 8-item toolkit
    ├── observer.ts    # opponent AI
    ├── rounds.ts      # 9-round act config
    ├── rng.ts         # crypto RNG
    ├── state.ts       # game logic
    ├── types.ts
    ├── ui.ts
    └── scenes/
```

## License

MIT — open source forever.
