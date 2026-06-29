import { quantumRandom } from "./rng";
import type { Guess } from "./types";

/** Observer AI — biased toward visible probability but imperfect. */
export function observerGuess(displayedProbability: number): Guess {
  const noise = (quantumRandom() - 0.5) * 0.35;
  const confidence = Math.min(0.92, Math.max(0.08, displayedProbability + noise));
  return quantumRandom() < confidence ? "alive" : "dead";
}
