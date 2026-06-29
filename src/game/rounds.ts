import type { RoundConfig } from "./types";

export const ROUNDS: RoundConfig[] = [
  {
    globalRound: 1,
    act: 1,
    roundInAct: 1,
    actTitle: "THE BOX",
    title: "First Collapse",
    briefing: "Pure 50/50.",
    twist: "none",
    observerBets: false,
    itemsDisabled: true,
    damageMultiplier: 1,
  },
  {
    globalRound: 2,
    act: 1,
    roundInAct: 2,
    actTitle: "THE BOX",
    title: "Cold Open",
    briefing: "Trust your gut.",
    twist: "none",
    observerBets: false,
    itemsDisabled: true,
    damageMultiplier: 1,
  },
  {
    globalRound: 3,
    act: 1,
    roundInAct: 3,
    actTitle: "THE BOX",
    title: "No Safety Net",
    briefing: "Last chance.",
    twist: "none",
    observerBets: false,
    itemsDisabled: true,
    damageMultiplier: 1,
  },
  {
    globalRound: 4,
    act: 2,
    roundInAct: 1,
    actTitle: "SUPERPOSITION",
    title: "Phantom Box",
    briefing: "Let's make this more interesting. Only one of the boxes is real.",
    twist: "phantom_box",
    observerBets: false,
    itemsDisabled: false,
    damageMultiplier: 1,
  },
  {
    globalRound: 5,
    act: 2,
    roundInAct: 2,
    actTitle: "SUPERPOSITION",
    title: "Half-Life Decay",
    briefing: "Alive odds decay 10% each item use.",
    twist: "half_life_decay",
    observerBets: false,
    itemsDisabled: false,
    damageMultiplier: 1,
  },
  {
    globalRound: 6,
    act: 2,
    roundInAct: 3,
    actTitle: "SUPERPOSITION",
    title: "Entanglement",
    briefing: "Two boxes. Opposite fates. Pick one to bet on.",
    twist: "entanglement",
    observerBets: true,
    itemsDisabled: false,
    damageMultiplier: 1,
  },
  {
    globalRound: 7,
    act: 3,
    roundInAct: 1,
    actTitle: "OBSERVER EFFECT",
    title: "Disturbed State",
    briefing: '"Now we\'re really playing." Peeking shifts reality — X-Ray with care.',
    twist: "observer_effect",
    observerBets: false,
    itemsDisabled: false,
    damageMultiplier: 1,
  },
  {
    globalRound: 8,
    act: 3,
    roundInAct: 2,
    actTitle: "OBSERVER EFFECT",
    title: "Quantum Shotgun",
    briefing: "Four boxes. 1-3 cats alive. Bet on one.",
    twist: "quantum_shotgun",
    observerBets: true,
    itemsDisabled: false,
    damageMultiplier: 1,
  },
  {
    globalRound: 9,
    act: 3,
    roundInAct: 3,
    actTitle: "OBSERVER EFFECT",
    title: "Final Duel",
    briefing: "No items. Both bet. Double damage.",
    twist: "final_duel",
    observerBets: true,
    itemsDisabled: true,
    damageMultiplier: 2,
  },
];

export function getRoundConfig(globalRound: number): RoundConfig {
  return ROUNDS[globalRound - 1] ?? ROUNDS[ROUNDS.length - 1];
}

export function isNewAct(globalRound: number): boolean {
  return globalRound === 1 || globalRound === 4 || globalRound === 7;
}

// Buckshot-style escalation: lives reset and grow each act (2 → 4 → 6).
export function actBaseLives(act: number): number {
  return act * 2;
}

// First global round of a given act (1, 4, 7).
export function actStartRound(act: number): number {
  return (act - 1) * 3 + 1;
}
