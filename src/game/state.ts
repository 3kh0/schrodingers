import {
  applyHalfLifeDecay,
  applyHalfLifeVial,
  applyObserverEffectPeek,
  collapseBox,
  createBoxesForRound,
  entangleBoxes,
  getActiveBox,
  peekBox,
  updateBoxInList,
} from "./boxes";
import { addItem, randomItem, removeItem } from "./items";
import { observerGuess } from "./observer";
import { getRoundConfig } from "./rounds";
import type { GameState, Guess, ItemId, RunStats } from "./types";

export type { GameState, Guess, ItemId, EndState } from "./types";
export { isNewAct } from "./rounds";

function emptyStats(): RunStats {
  return {
    correctGuesses: 0,
    wrongGuesses: 0,
    itemsUsed: 0,
    roundsCleared: 0,
    observerWrong: 0,
  };
}

export function createInitialState(): GameState {
  return setupRound({
    globalRound: 1,
    playerLives: 3,
    observerLives: 3,
    maxPlayerLives: 3,
    inventory: [],
    catTreatUsed: false,
    stats: emptyStats(),
  });
}

function setupRound(partial: Partial<GameState> & Pick<GameState, "globalRound">): GameState {
  const roundConfig = getRoundConfig(partial.globalRound);
  const { boxes, activeBoxId, shotgunAliveCount } = createBoxesForRound(roundConfig.twist);

  let inventory = partial.inventory ?? [];
  let message = roundConfig.briefing;

  if (roundConfig.twist === "grant_item") {
    const item = randomItem(inventory);
    inventory = addItem(inventory, item);
    message = `Received ${item.toUpperCase()}. ${roundConfig.briefing}`;
  }

  if (partial.cigaretteRisk) {
    message = "Cigarette debt: wrong guess costs an extra life this round.";
  }

  return {
    act: roundConfig.act,
    globalRound: partial.globalRound,
    playerLives: partial.playerLives ?? 3,
    observerLives: partial.observerLives ?? 3,
    maxPlayerLives: partial.maxPlayerLives ?? 3,
    inventory,
    boxes,
    activeBoxId,
    roundConfig,
    cigaretteRisk: partial.nextRoundExtraRisk ?? false,
    nextRoundExtraRisk: false,
    catTreatUsed: partial.catTreatUsed ?? false,
    schrodingerDiceActive: false,
    schrodingerDicePeekingPenalty: false,
    observerSkipped: false,
    message,
    stats: partial.stats ?? emptyStats(),
    shotgunAliveCount,
    lastGuess: undefined,
    lastOutcome: undefined,
    observerGuess: undefined,
    observerCorrect: undefined,
    playerCorrect: undefined,
    phantomWrong: undefined,
  };
}

export function setActiveBoxId(state: GameState, boxId: string): GameState {
  return { ...state, activeBoxId: boxId };
}

export function useItem(state: GameState, itemId: ItemId): GameState {
  if (state.roundConfig.itemsDisabled) return state;
  if (!state.inventory.includes(itemId)) return state;

  let next: GameState = {
    ...state,
    stats: { ...state.stats, itemsUsed: state.stats.itemsUsed + 1 },
  };

  const active = getActiveBox(next);
  let boxes = next.boxes;

  switch (itemId) {
    case "geiger": {
      const skewed = Math.abs(active.trueProbability - 0.5) > 0.05;
      next.message = skewed
        ? "Geiger: ANOMALY DETECTED — odds are not baseline 50/50."
        : "Geiger: baseline radiation. Odds appear 50/50.";
      if (next.roundConfig.twist === "observer_effect") {
        const peeked = applyObserverEffectPeek(active);
        boxes = updateBoxInList(boxes, peeked);
        next.message += " Observation shifted the state.";
      }
      break;
    }
    case "xray": {
      const peeked = peekBox(active);
      boxes = updateBoxInList(boxes, peeked);
      if (peeked.phantom) {
        next.message = "X-Ray: hollow shell — this box is a PHANTOM.";
      } else {
        next.message = `X-Ray: cat is ${peeked.outcome!.toUpperCase()}.`;
      }
      if (next.roundConfig.twist === "observer_effect") {
        const shifted = applyObserverEffectPeek(peeked);
        boxes = updateBoxInList(boxes, shifted);
        next.message += " Observer effect disturbed the reading.";
      }
      break;
    }
    case "halfLife": {
      const vial = applyHalfLifeVial(active);
      boxes = updateBoxInList(boxes, vial);
      next.message = `Half-Life Vial: alive odds now ${Math.round(vial.trueProbability * 100)}%.`;
      break;
    }
    case "entangle": {
      if (next.boxes.length < 2) {
        next.message = "Need two boxes to entangle.";
        return state;
      }
      const partner = next.boxes.find((b) => b.id !== active.id && !b.phantom);
      if (!partner) {
        next.message = "No valid partner box.";
        return state;
      }
      boxes = entangleBoxes(boxes, active.id, partner.id);
      next.message = `Entangled ${active.label} ↔ ${partner.label}.`;
      break;
    }
    case "decoherence": {
      if (next.maxPlayerLives >= 4) {
        next.message = "Already at maximum coherence.";
        return state;
      }
      next.maxPlayerLives = 4;
      next.playerLives = Math.min(next.playerLives + 1, 4);
      next.message = "Decoherence Patch: +1 life. Max coherence is now 4.";
      break;
    }
    case "cigarette": {
      next.observerSkipped = true;
      next.nextRoundExtraRisk = true;
      next.message = "You smoke. Observer waits. Next round punishes mistakes.";
      break;
    }
    case "catTreat":
      next.message = "Cat Treat only works after a collapse.";
      return state;
    case "schrodingerDice": {
      next.schrodingerDiceActive = true;
      next.schrodingerDicePeekingPenalty = active.peeked;
      next.message = active.peeked
        ? "Dice rolled on a peeked box — victory costs 2 lives if wrong."
        : "Dice active: your next guess cannot fail.";
      break;
    }
  }

  if (next.roundConfig.twist === "half_life_decay") {
    boxes = applyHalfLifeDecay(boxes);
    next.message += " Half-life decay: alive odds −10%.";
  }

  next.boxes = boxes;
  next.inventory = removeItem(next.inventory, itemId);
  return next;
}

export function resolveGuess(state: GameState, guess: Guess): GameState {
  const active = getActiveBox(state);
  const partner = active.entangledWith
    ? state.boxes.find((b) => b.id === active.entangledWith)
    : undefined;

  const phantomWrong = active.phantom;

  const { box: collapsed, partner: collapsedPartner, outcome } = collapseBox(active, partner);

  let boxes = updateBoxInList(state.boxes, collapsed);
  if (collapsedPartner) {
    boxes = updateBoxInList(boxes, collapsedPartner);
  }

  // Dice guarantees a win unless rolled on a peeked box and the raw guess was wrong.
  let playerCorrect = !phantomWrong && guess === outcome;
  if (
    state.schrodingerDiceActive &&
    !phantomWrong &&
    !(state.schrodingerDicePeekingPenalty && !playerCorrect)
  ) {
    playerCorrect = true;
  }

  let playerLives = state.playerLives;
  let observerLives = state.observerLives;
  const dmg = state.roundConfig.damageMultiplier;

  if (phantomWrong) {
    playerLives -= dmg;
    if (state.cigaretteRisk) playerLives -= 1;
    if (state.schrodingerDiceActive && state.schrodingerDicePeekingPenalty) {
      playerLives -= 1;
    }
  } else if (playerCorrect) {
    observerLives -= dmg;
  } else {
    const diceFail = state.schrodingerDiceActive && state.schrodingerDicePeekingPenalty;
    playerLives -= diceFail ? dmg * 2 : dmg;
    if (state.cigaretteRisk) playerLives -= 1;
  }

  let inventory = state.inventory;
  let observerGuessVal: Guess | undefined;
  let observerCorrect: boolean | undefined;

  if (state.roundConfig.observerBets && !state.observerSkipped) {
    observerGuessVal = observerGuess(active.displayedProbability);
    observerCorrect = observerGuessVal === outcome && !phantomWrong;

    if (!observerCorrect && !phantomWrong) {
      const item = randomItem(inventory);
      inventory = addItem(inventory, item);
    }

    if (state.roundConfig.twist === "observer_bets" && playerCorrect && !observerCorrect) {
      const item = randomItem(inventory);
      inventory = addItem(inventory, item);
    }
  }

  const stats = { ...state.stats };
  if (playerCorrect) stats.correctGuesses++;
  else stats.wrongGuesses++;
  if (observerGuessVal && !observerCorrect) stats.observerWrong++;

  let message = phantomWrong
    ? "PHANTOM BOX — no cat inside. You lose coherence."
    : playerCorrect
      ? `Correct! Cat was ${outcome.toUpperCase()}. Observer bleeds.`
      : `Wrong. Cat was ${outcome.toUpperCase()}. You lose coherence.`;

  if (observerGuessVal) {
    message += ` Observer bet ${observerGuessVal.toUpperCase()}${observerCorrect ? " (correct)" : " (wrong)"}.`;
  }

  return {
    ...state,
    boxes,
    inventory,
    playerLives,
    observerLives,
    lastGuess: guess,
    lastOutcome: phantomWrong ? "dead" : outcome,
    observerGuess: observerGuessVal,
    observerCorrect,
    playerCorrect,
    phantomWrong,
    schrodingerDiceActive: false,
    schrodingerDicePeekingPenalty: false,
    message,
    stats,
  };
}

export function useCatTreat(state: GameState): GameState | null {
  if (state.catTreatUsed || !state.inventory.includes("catTreat")) return null;
  if (state.lastOutcome === undefined || state.lastGuess === undefined) return null;

  const wasWrong = !state.playerCorrect;
  if (!wasWrong) return null;

  let playerLives = state.playerLives + state.roundConfig.damageMultiplier;
  if (state.cigaretteRisk) playerLives += 1;
  playerLives = Math.min(playerLives, state.maxPlayerLives);

  const observerLives = state.observerLives - state.roundConfig.damageMultiplier;

  return {
    ...state,
    inventory: removeItem(state.inventory, "catTreat"),
    catTreatUsed: true,
    playerLives,
    observerLives,
    playerCorrect: true,
    message: "Cat Treat reroll! Timeline rewritten — that guess now stands correct.",
    stats: {
      ...state.stats,
      wrongGuesses: Math.max(0, state.stats.wrongGuesses - 1),
      correctGuesses: state.stats.correctGuesses + 1,
    },
  };
}

export function advanceRound(state: GameState): GameState {
  const nextRound = state.globalRound + 1;
  if (nextRound > 9) return state;

  return setupRound({
    globalRound: nextRound,
    playerLives: state.playerLives,
    observerLives: state.observerLives,
    maxPlayerLives: state.maxPlayerLives,
    inventory: state.inventory,
    catTreatUsed: state.catTreatUsed,
    nextRoundExtraRisk: state.nextRoundExtraRisk,
    stats: {
      ...state.stats,
      roundsCleared: state.stats.roundsCleared + 1,
    },
  });
}

export function isVictory(state: GameState): boolean {
  return state.observerLives <= 0;
}

export function isDefeat(state: GameState): boolean {
  return state.playerLives <= 0;
}
