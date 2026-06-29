# Schrödinger's Box — Game Design Document

> A browser-based psychological probability game for [Entropy](https://entropy.hackclub.com/).  
> Inspired by _Buckshot Roulette_ · Built on randomness, tension, and gambling

---

## 1. Elevator Pitch

You sit at a rusted lab table. In front of you lies a sealed box. Inside, a cat exists in quantum superposition — alive _and_ dead until someone opens it.

Each round, you must **bet on the outcome** (Alive or Dead) before the box is opened. Guess right and you gain advantages. Guess wrong and you are fucked, three strikes and you are out. As rounds progress, the quantum rules get stranger: multiple boxes, entangled states, decaying probabilities, and items that bend reality.

The game is fundamentally about **uncertainty under pressure** — not reflexes, not memorization.

---

## 2. Entropy Hackathon Fit

| Requirement                           | How we satisfy it                                                                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fundamentally based in randomness** | Every collapse uses `crypto.getRandomValues()`; probability states are visible but outcomes are genuinely random. README documents the RNG approach. |
| **Open source forever**               | MIT/Apache license, public repo, no proprietary assets.                                                                                              |
| **README.md included**                | Setup, rules, RNG explanation, how to play in-browser.                                                                                               |
| **Accessible without setup**          | Deploy to static hosting (Vercel/Netlify/Cloudflare). Play in any modern browser — no install, no account.                                           |
| **Hackatime tracking**                | Standard dev workflow; time logged on implementation.                                                                                                |

**Entropy bonus alignment:** The hackathon site literally suggests a _"Schrödinger's cat simulator"_ — this project is a direct hit.

---

## 3. Design Pillars (Buckshot Roulette DNA)

| Pillar                       | Buckshot Roulette                           | Schrödinger's Box                             |
| ---------------------------- | ------------------------------------------- | --------------------------------------------- |
| **Hidden information**       | Shell count unknown until checked           | Cat state unknown until observed              |
| **High-stakes guessing**     | Pull trigger on self or opponent            | Bet Alive/Dead before opening box             |
| **Item economy**             | Cigarettes, magnifying glass, defibrillator | Geiger counter, half-life decay, entanglement |
| **Escalating dread**         | More shells, dealer gets smarter            | More boxes, decoherence, entangled fates      |
| **Short sessions**           | ~15 min runs                                | Target 10–20 min runs                         |
| **Atmosphere over graphics** | Low-fi horror, tactile UI                   | Cold-war lab, CRT flicker, Geiger clicks      |

---

## 4. Core Game Loop

```
┌─────────────────────────────────────────────────────────┐
│  ROUND START                                            │
│  · Load shells (hidden quantum state)                   │
│  · Distribute items (optional)                          │
│  · Show probability hint (may be distorted)             │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│  PLAYER TURN                                            │
│  · Use items (peek, shift odds, entangle, etc.)         │
│  · Commit guess: ALIVE or DEAD                          │
│  · OR pass / force Observer to guess (advanced rounds)  │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│  COLLAPSE (observation)                                 │
│  · Box opens — outcome revealed                         │
│  · Apply damage / rewards                               │
│  · Trigger visual + audio feedback                      │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│  ROUND END                                              │
│  · Check win/loss (lives, Observer lives)               │
│  · Advance to next round or game over                   │
└─────────────────────────────────────────────────────────┘
```

### Lives System (mirrors defibrillator charges)

- Player starts with **3 Lives** (quantum coherence).
- Wrong guess = **−1 Life**.
- At 0 Lives → game over.
- Bonus: "Decoherence" item = one extra life (like defibrillator).

### Observer (opponent)

- The Observer also has 3 Lives.
- In later rounds, Observer guesses too — if they're wrong, you gain an item or life.
- Observer uses simple AI weighted by visible probability.

---

## 5. Quantum State Model

Each box has a hidden state generated at round start:

```ts
type QuantumState = {
  outcome: "alive" | "dead"; // resolved on collapse
  trueProbability: number; // 0.0–1.0, may differ from 50/50
  observed: boolean;
  entangledWith?: string; // box ID
  decayRate?: number; // probability shifts each turn
};
```

**Collapse algorithm:**

1. Roll `r = cryptoRandom()` (0–1).
2. If `r < trueProbability` → Alive, else Dead.
3. If entangled: partner box collapses to opposite outcome (EPR paradox).
4. Log roll + seed slice in dev mode for transparency.

**Why this satisfies Entropy:** Randomness is cryptographic, auditable, and central — not cosmetic.

---

## 6. Round Structure (3 Acts)

### Act I — "The Box" (Rounds 1–3)

_Tutorial tension. Single box. 50/50 odds unless items say otherwise._

| Round | Twist                                      |
| ----- | ------------------------------------------ |
| 1     | Pure 50/50. No items. Learn the dread.     |
| 2     | Player receives 1 random item.             |
| 3     | Observer bets too — winner steals an item. |

### Act II — "Superposition" (Rounds 4–6)

_Multiple boxes, shifting odds._

| Round | Twist                                                            |
| ----- | ---------------------------------------------------------------- |
| 4     | **Two boxes** — only one is real; other is phantom (25% chance). |
| 5     | **Half-life decay** — Alive probability drops 10% each turn.     |
| 6     | **Entanglement** — two boxes linked; opposite outcomes.          |

### Act III — "The Observer Effect" (Rounds 7–9)

_Reality breaks. Maximum Buckshot energy._

| Round | Twist                                                    |
| ----- | -------------------------------------------------------- |
| 7     | Peeking **changes** the outcome (observer effect).       |
| 8     | **Quantum shotgun** — 4 boxes, 1–3 alive (hidden count). |
| 9     | Final duel — both bet, highest stakes, no items.         |

**Win condition:** Reduce Observer to 0 Lives.  
**Lose condition:** Player reaches 0 Lives.

---

## 7. Items (Quantum Toolkit)

| Item                   | Effect                                                                       | BR Equivalent           |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| **Geiger Counter**     | Reveals if probability ≠ 50% (not exact %)                                   | Magnifying glass        |
| **X-Ray Pulse**        | See Alive/Dead on ONE box (single use)                                       | Hand saw / burner phone |
| **Half-Life Vial**     | Force target box −20% Alive chance                                           | Beer (distorts vision)  |
| **Entanglement Wire**  | Link two boxes for opposite outcomes                                         | Adrenaline              |
| **Decoherence Patch**  | +1 Life (max 4)                                                              | Defibrillator           |
| **Cigarette**          | Skip Observer's turn; −1 your Life risk next round                           | Cigarettes              |
| **Cat Treat**          | Reroll last collapse (once per run)                                          | Inverter                |
| **Schrödinger's Dice** | Your next guess can't be wrong — but costs 2 Lives if box was already peeked | Handcuffs               |

_Design rule:_ Max 4 items in inventory. Items drop from correct guesses or round rewards.

---

## 8. Player Experience & Atmosphere

### Visual direction

- **Era:** 1960s cold-war physics lab, not neon sci-fi.
- **Palette:** Sickly green CRT phosphor, rust brown, chalk white, deep black.
- **Hero object:** A battered steel box with a radiation trefoil and a small viewing port.
- **UI:** Diegetic — gauges, analog dials, typewritten labels.

### Audio

- Geiger counter clicks scaling with probability.
- Heavy box latch clunk on open.
- Single cat meow OR flatline beep — never both until collapse.
- Low HVAC hum loop; silence before reveal.

### Juice (feel-good feedback)

- Screen micro-shake on wrong guess.
- CRT scanline burst on collapse.
- Probability dial swings before settling.
- `prefers-reduced-motion` disables shake/flash.

---

## 9. Technical Architecture

### Current stack (KAPLAY + Vite)

```
KAPLAY 3001             → scenes, game objects, input, rendering
Vite                    → dev server + static deploy
TypeScript              → game logic (rng, state, scenes)
└── (future) Howler.js  → Geiger clicks, collapse audio
```

**Why KAPLAY?** Turn-based UI game with scene flow (menu → play → reveal → end). KAPLAY's scene system maps directly to Buckshot-style round progression.

### State machine

```
MENU → RUN_START → ROUND_SETUP → PLAYER_TURN → COLLAPSE → ROUND_END
                      ↑                              |
                      └──────── NEXT_ROUND ──────────┘
ROUND_END → ACT_CLEAR → RUN_START (next act)
ROUND_END → GAME_OVER / VICTORY
```

### File structure (current)

```
src/
├── main.ts
└── game/
    ├── config.ts
    ├── rng.ts
    ├── state.ts
    ├── ui.ts
    └── scenes/
        ├── menu.ts
        ├── play.ts
        ├── reveal.ts
        └── end.ts
```

### RNG implementation (Entropy-critical)

```ts
// composables/useQuantumRNG.ts
export function quantumRandom(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / (0xffffffff + 1);
}

export function collapse(probability: number): "alive" | "dead" {
  return quantumRandom() < probability ? "alive" : "dead";
}
```

Document in README: algorithm, uniform distribution proof sketch, and optional seed display for debugging.

### Deployment

- `nuxt generate` → static site.
- Host on Vercel/Netlify/Cloudflare Pages.
- Single URL, zero install — satisfies Entropy accessibility.

---

## 10. Web Game Engine Options

Below are engines/frameworks suited to a **browser-based, UI-heavy, turn-based** game. Ranked for _this specific project_.

### Tier 1 — Best fit

| Engine / Library                   | Pros                                                                                  | Cons                                    | Verdict                |
| ---------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------- |
| **Nuxt/Vue + CSS (current stack)** | Already scaffolded; perfect for UI-heavy games; easy deploy; great for Entropy README | No built-in sprite physics (not needed) | **★ Recommended**      |
| **PixiJS** (layer on Vue)          | WebGL particles, shaders, CRT effects                                                 | Extra learning curve for small scope    | Great for collapse VFX |
| **Howler.js**                      | Best-in-class web audio                                                               | Audio only                              | **Use regardless**     |

### Tier 2 — Solid alternatives

| Engine / Library              | Pros                                     | Cons                                    | Verdict                                              |
| ----------------------------- | ---------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| **Phaser 3**                  | Full 2D game loop, scenes, input, tweens | Heavier; fights Vue's reactivity model  | Use if you want sprite-heavy mini-games inside boxes |
| **Excalibur.js**              | TypeScript-first, ECS, good docs         | Smaller community than Phaser           | Good TS ergonomics                                   |
| **Kaboom.js**                 | Fast jam prototyping, simple API         | Less suited to polished UI menus        | Good for 48h prototype, migrate later                |
| **TresJS** (Three.js for Vue) | 3D box you can orbit, dramatic opens     | Overkill for v1; perf on low-end mobile | v2 "immersive mode"                                  |

### Tier 3 — Different workflow

| Engine / Library           | Pros                               | Cons                                      | Verdict                                |
| -------------------------- | ---------------------------------- | ----------------------------------------- | -------------------------------------- |
| **Godot 4 → HTML5 export** | Visual editor, great for jam games | Export size; separate toolchain from Nuxt | Consider if team prefers visual editor |
| **Construct 3**            | No-code, rapid iteration           | Not open-source; harder Entropy story     | Skip for OSS requirement               |
| **Unity WebGL**            | Powerful                           | Huge build size, load times               | Skip for browser accessibility         |

### Recommendation summary

> **Start with Nuxt + Vue + Pinia + Howler.js.**  
> Add **PixiJS** only for the collapse particle moment.  
> Revisit **TresJS** if you want a 3D box in Act III.

This keeps the repo cohesive, satisfies Entropy's "no setup" rule, and matches Buckshot's UI-first design.

---

## 11. MVP Scope (ship for Entropy)

### Must have (v1.0)

- [ ] Single run: Act I (3 rounds)
- [ ] Alive/Dead guessing with lives
- [ ] 4 items: Geiger Counter, X-Ray Pulse, Decoherence Patch, Cigarette
- [ ] Observer opponent (basic AI)
- [ ] `crypto.getRandomValues` RNG with README docs
- [ ] CRT lab aesthetic + Geiger audio
- [ ] Mobile-friendly tap targets
- [ ] `prefers-reduced-motion` support
- [ ] Deployed public URL

### Nice to have (v1.1)

- [ ] Acts II & III
- [ ] Full 8-item roster
- [ ] Run statistics / death recap screen
- [ ] Daily seeded run (same seed = same box states for competition)

### Out of scope (v2+)

- Multiplayer
- Real QRNG API integration
- 3D box (TresJS)

**Time estimate:** MVP ~8–12 hours · Full game ~20–30 hours (qualifies for custom dice tier at 5+ hours).

---

## 12. UI Wireframe (ASCII)

```
┌────────────────────────────────────────────────────────────┐
│  SCHRÖDINGER'S BOX          Act I · Round 2    [?] [♥♥♡]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│     ┌──────────┐         ┌─────────────┐        ┌──────┐  │
│     │ OBSERVER │         │  SEALED BOX │        │ DIAL │  │
│     │  ♥♥♡     │         │  ┌───────┐  │        │ 62%  │  │
│     │  "Bet."  │         │  │ ? ? ? │  │        │ ALIVE│  │
│     └──────────┘         │  └───────┘  │        └──────┘  │
│                          └─────────────┘                   │
│                                                            │
│         [ ALIVE ]          [ DEAD ]          [ USE ITEM ]  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Items: [Geiger] [X-Ray] [—] [—]                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  > Geiger counter ticking intensifies...                   │
└────────────────────────────────────────────────────────────┘
```

---

## 13. Risk Register

| Risk                                 | Mitigation                                                       |
| ------------------------------------ | ---------------------------------------------------------------- |
| Game feels like pure coin flip       | Items + probability hints + escalating twists add agency         |
| Too similar to Buckshot (derivative) | Quantum theme, entanglement, observer effect are distinct        |
| RNG feels unfair                     | Document algorithm; show probability dial; optional dev seed log |
| Scope creep                          | Ship Act I first; Acts II–III as fast follow                     |
| Mobile UX                            | Large buttons; no hover-only interactions                        |

---

## 14. Success Metrics

- **Entropy:** Qualifying submission with clear randomness story in README.
- **Feel:** Playtesters describe tension, not boredom ("I was sweating on 50/50").
- **Session length:** Average run 12–18 minutes.
- **Replay:** >40% start a second run after game over.

---

## 15. Next Steps

1. **Approve core loop** — betting + lives + collapse.
2. **Build Act I prototype** in existing Nuxt repo (no engine switch).
3. **Add Howler.js** for Geiger + collapse sounds.
4. **Playtest** with 3 people — tune dread pacing.
5. **Write README** with RNG section for Entropy reviewers.
6. **Deploy** static build; submit to Entropy with Hackatime log.

---

_Document version: 0.1 · Project: schrodingers · Stack: Nuxt 4 + Vue 3_
