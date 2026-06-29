import { qrand } from "./rng";
import type { Guess } from "./types";

export function observerGuess(displayedProbability: number): Guess {
  // slightly rigged
  const noise = (qrand() - 0.5) * 0.35;
  const confidence = Math.min(0.92, Math.max(0.08, displayedProbability + noise));
  return qrand() < confidence ? "alive" : "dead";
}
