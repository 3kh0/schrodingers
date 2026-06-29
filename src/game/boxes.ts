import { quantumRandom, collapse, type Outcome } from "./rng";
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
  shotgunAliveCount?: number;
} {
  switch (twist) {
    case "phantom_box": {
      const realIsA = quantumRandom() < 0.75;
      const boxes = [makeBox("a", "BOX A", 0.5, !realIsA), makeBox("b", "BOX B", 0.5, realIsA)];
      return { boxes, activeBoxId: "a" };
    }

    case "entanglement": {
      const boxes = [makeBox("a", "BOX A", 0.5), makeBox("b", "BOX B", 0.5)];
      boxes[0].entangledWith = "b";
      boxes[1].entangledWith = "a";
      return { boxes, activeBoxId: "a" };
    }

    case "quantum_shotgun": {
      const aliveCount = 1 + Math.floor(quantumRandom() * 3);
      const outcomes: Outcome[] = Array.from({ length: 4 }, (_, i) =>
        i < aliveCount ? "alive" : "dead",
      );
      for (let i = outcomes.length - 1; i > 0; i--) {
        const j = Math.floor(quantumRandom() * (i + 1));
        [outcomes[i], outcomes[j]] = [outcomes[j], outcomes[i]];
      }
      const boxes = outcomes.map((o, i) => {
        const box = makeBox(`q${i + 1}`, `Q${i + 1}`, o === "alive" ? 0.99 : 0.01);
        box.outcome = o;
        return box;
      });
      return { boxes, activeBoxId: "q1", shotgunAliveCount: aliveCount };
    }

    case "half_life_decay":
      return { boxes: [makeBox("main", "BOX", 0.6)], activeBoxId: "main" };

    default:
      return { boxes: [makeBox("main", "BOX", 0.5)], activeBoxId: "main" };
  }
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

export function applyHalfLifeDecay(boxes: BoxState[], amount = 0.1): BoxState[] {
  return boxes.map((b) => {
    if (b.phantom || b.collapsed) return b;
    const next = clampProb(b.trueProbability - amount);
    return {
      ...b,
      trueProbability: next,
      displayedProbability: next,
    };
  });
}

export function applyObserverEffectPeek(box: BoxState): BoxState {
  const shift = (quantumRandom() - 0.5) * 0.3;
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
