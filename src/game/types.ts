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

export type RoundTwist = "none" | "phantom_box" | "observer_effect";

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
  act: number;
  actTitle: string;
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
};

export type EndState = GameState & { won: boolean };
