import type { RoundConfig } from "./types";

// One signature mechanic per act. Each act is a duel that runs until one side's
// lives hit 0 — there are no fixed sub-rounds.
export const ACTS: RoundConfig[] = [
  {
    act: 1,
    actTitle: "THE BOX",
    briefing: "Pure 50/50. Just the box.",
    twist: "none",
    observerBets: false,
    itemsDisabled: true,
    damageMultiplier: 1,
  },
  {
    act: 2,
    actTitle: "SUPERPOSITION",
    briefing: '"Let\'s make this more interesting." One box is a phantom.',
    twist: "phantom_box",
    observerBets: false,
    itemsDisabled: false,
    damageMultiplier: 1,
  },
  {
    act: 3,
    actTitle: "OBSERVER EFFECT",
    briefing: '"Now we\'re really playing." I bet too — peeking shifts the odds.',
    twist: "observer_effect",
    observerBets: true,
    itemsDisabled: false,
    damageMultiplier: 1,
  },
];

export function getActConfig(act: number): RoundConfig {
  return ACTS[Math.min(Math.max(act, 1), ACTS.length) - 1];
}

// Buckshot-style escalation: lives reset and grow each act (3 → 4 → 5).
export function actBaseLives(act: number): number {
  return act + 2;
}

export const FINAL_ACT = ACTS.length;
