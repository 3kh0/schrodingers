import type { KAPLAYCtx } from "kaplay";
import { COLORS, type RGB } from "../config";
import type { EndState } from "../types";
import { drawScanlines, makeButton } from "../ui";

export function registerEndScene(k: KAPLAYCtx) {
  k.scene("end", (state: EndState) => {
    const title = state.won ? "OBSERVER DECOHERED" : "YOU DECOHERED";
    const subtitle = state.won
      ? "Nine rounds of quantum dread. You survived."
      : "Superposition claims another victim.";
    const color: RGB = state.won ? COLORS.alive : COLORS.dead;

    k.add([
      k.text(title, { size: 34 }),
      k.pos(k.center().x, 100),
      k.anchor("center"),
      k.color(...color),
    ]);

    k.add([
      k.text(subtitle, { size: 17 }),
      k.pos(k.center().x, 150),
      k.anchor("center"),
      k.color(...COLORS.textDim),
    ]);

    const lines = [
      `Rounds cleared: ${state.stats.roundsCleared}`,
      `Correct guesses: ${state.stats.correctGuesses}`,
      `Wrong guesses: ${state.stats.wrongGuesses}`,
      `Items used: ${state.stats.itemsUsed}`,
      `Observer mistakes: ${state.stats.observerWrong}`,
      `Final lives: ${state.playerLives} / ${state.maxPlayerLives}`,
    ];

    lines.forEach((line, i) => {
      k.add([
        k.text(line, { size: 15 }),
        k.pos(k.center().x, 210 + i * 28),
        k.anchor("center"),
        k.color(...COLORS.text),
      ]);
    });

    k.add([
      k.text("RNG: crypto.getRandomValues() — true quantum randomness", { size: 11 }),
      k.pos(k.center().x, 400),
      k.anchor("center"),
      k.color(...COLORS.crtDim),
    ]);

    makeButton(k, "PLAY AGAIN", k.center().x, 450, 200, 48, () => {
      k.go("menu");
    });

    drawScanlines(k);
  });
}
