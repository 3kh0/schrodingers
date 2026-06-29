import { qrand, collapse, type Outcome } from "./rng";
import type { BoxState, RoundTwist } from "./types";

function clampProb(p: number): number {
  return Math.min(0.95, Math.max(0.05, p));
}

function makeBox(id: string, label: string, trueProbability = 0.5, phantom = false): BoxState {
  return {
    id,
    label,
    trueProbability: clampProb(trueProbability),
    displayedProbability: clampProb(trueProbability),
    collapsed: false,
    peeked: false,
    phantom,
  };
}

export function createBoxesForRound(twist: RoundTwist): {
  boxes: BoxState[];
  activeBoxId: string;
} {
  if (twist === "phantom_box") {
    const realIsA = qrand() < 0.75;
    const boxes = [makeBox("a", "BOX A", 0.5, !realIsA), makeBox("b", "BOX B", 0.5, realIsA)];
    return { boxes, activeBoxId: "a" };
  }

  return { boxes: [makeBox("main", "BOX", 0.5)], activeBoxId: "main" };
}

export function getActiveBox(state: { boxes: BoxState[]; activeBoxId: string }): BoxState {
  return state.boxes.find((b) => b.id === state.activeBoxId) ?? state.boxes[0];
}

export function collapseBox(
  box: BoxState,
  entangledPartner?: BoxState,
): {
  box: BoxState;
  partner?: BoxState;
  outcome: Outcome;
} {
  if (box.phantom) {
    return {
      box: { ...box, collapsed: true, outcome: "dead" },
      outcome: "dead",
    };
  }

  const outcome = box.outcome ?? collapse(box.trueProbability);
  const collapsed: BoxState = { ...box, collapsed: true, outcome, peeked: true };

  if (entangledPartner && !entangledPartner.collapsed) {
    const partnerOutcome: Outcome = outcome === "alive" ? "dead" : "alive";
    const partner: BoxState = {
      ...entangledPartner,
      collapsed: true,
      outcome: partnerOutcome,
      peeked: true,
      trueProbability: partnerOutcome === "alive" ? 0.99 : 0.01,
      displayedProbability: partnerOutcome === "alive" ? 0.99 : 0.01,
    };
    return { box: collapsed, partner, outcome };
  }

  return { box: collapsed, outcome };
}

export function applyObserverEffectPeek(box: BoxState): BoxState {
  const shift = (qrand() - 0.5) * 0.3;
  const next = clampProb(box.trueProbability + shift);
  return {
    ...box,
    trueProbability: next,
    displayedProbability: next,
    peeked: true,
  };
}

export function peekBox(box: BoxState): BoxState {
  if (box.phantom) {
    return { ...box, peeked: true, outcome: undefined };
  }
  const outcome = box.outcome ?? collapse(box.trueProbability);
  return {
    ...box,
    peeked: true,
    outcome,
    displayedProbability: outcome === "alive" ? 0.99 : 0.01,
  };
}

export function applyHalfLifeVial(box: BoxState): BoxState {
  const next = clampProb(box.trueProbability - 0.2);
  return { ...box, trueProbability: next, displayedProbability: next };
}

export function entangleBoxes(boxes: BoxState[], aId: string, bId: string): BoxState[] {
  return boxes.map((b) => {
    if (b.id === aId) return { ...b, entangledWith: bId };
    if (b.id === bId) return { ...b, entangledWith: aId };
    return b;
  });
}

export function updateBoxInList(boxes: BoxState[], updated: BoxState): BoxState[] {
  return boxes.map((b) => (b.id === updated.id ? updated : b));
}
