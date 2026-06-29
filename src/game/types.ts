import type { Outcome } from "./rng";

export type Guess = Outcome;

export type ItemId =
  | "geiger"
  | "xray"
  | "halfLife"
  | "entangle"
  | "decoherence"
  | "cigarette"
  | "catTreat"
  | "schrodingerDice";

export type RoundTwist =
  | "none"
  | "grant_item"
  | "observer_bets"
  | "phantom_box"
  | "half_life_decay"
  | "entanglement"
  | "observer_effect"
  | "quantum_shotgun"
  | "final_duel";

export type BoxState = {
  id: string;
  label: string;
  trueProbability: number;
  displayedProbability: number;
  outcome?: Outcome;
  collapsed: boolean;
  peeked: boolean;
  phantom: boolean;
  entangledWith?: string;
};

export type RoundConfig = {
  globalRound: number;
  act: number;
  roundInAct: number;
  actTitle: string;
  title: string;
  briefing: string;
  twist: RoundTwist;
  observerBets: boolean;
  itemsDisabled: boolean;
  damageMultiplier: number;
};

export type RunStats = {
  correctGuesses: number;
  wrongGuesses: number;
  itemsUsed: number;
  roundsCleared: number;
  observerWrong: number;
};

export type GameState = {
  act: number;
  globalRound: number;
  playerLives: number;
  observerLives: number;
  maxPlayerLives: number;
  inventory: ItemId[];
  boxes: BoxState[];
  activeBoxId: string;
  roundConfig: RoundConfig;
  cigaretteRisk: boolean;
  nextRoundExtraRisk: boolean;
  catTreatUsed: boolean;
  schrodingerDiceActive: boolean;
  schrodingerDicePeekingPenalty: boolean;
  observerSkipped: boolean;
  lastGuess?: Guess;
  lastOutcome?: Outcome;
  observerGuess?: Guess;
  observerCorrect?: boolean;
  playerCorrect?: boolean;
  phantomWrong?: boolean;
  message: string;
  stats: RunStats;
  shotgunAliveCount?: number;
};

export type EndState = GameState & { won: boolean };
