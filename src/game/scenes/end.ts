import type { KAPLAYCtx } from "kaplay";
import { COLORS, type RGB } from "../config";
import type { EndState } from "../types";
import { drawScanlines, makeButton, text } from "../ui";

export function registerEndScene(k: KAPLAYCtx) {
  k.scene("end", (state: EndState) => {
    const title = state.won ? "OBSERVER DECOHERED" : "YOU DECOHERED";
    const subtitle = state.won
      ? "Nine rounds of quantum dread. You survived."
      : "Superposition claims another victim.";
    const color: RGB = state.won ? COLORS.alive : COLORS.dead;
    const cx = k.center().x;

    text(k, title, cx, 100, { size: 34, color });
    text(k, subtitle, cx, 150, { size: 17, color: COLORS.textDim });

    const lines = [
      `Rounds cleared: ${state.stats.roundsCleared}`,
      `Correct guesses: ${state.stats.correctGuesses}`,
      `Wrong guesses: ${state.stats.wrongGuesses}`,
      `Items used: ${state.stats.itemsUsed}`,
      `Observer mistakes: ${state.stats.observerWrong}`,
      `Final lives: ${state.playerLives} / ${state.maxPlayerLives}`,
    ];
    lines.forEach((line, i) => text(k, line, cx, 210 + i * 28, { size: 15 }));

    text(k, "RNG: crypto.getRandomValues() — true quantum randomness", cx, 400, {
      size: 11,
      color: COLORS.crtDim,
    });

    makeButton(k, "PLAY AGAIN", cx, 450, 200, 48, () => k.go("menu"));

    drawScanlines(k);
  });
}
