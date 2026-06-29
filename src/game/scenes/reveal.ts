import type { KAPLAYCtx } from "kaplay";
import { playCollapse, playItemUse } from "../audio";
import { COLORS, type RGB } from "../config";
import { isNewAct } from "../rounds";
import type { GameState } from "../types";
import { advanceRound, isDefeat, isVictory, useCatTreat } from "../state";
import { drawScanlines, makeButton, screenShake } from "../ui";

export function registerRevealScene(k: KAPLAYCtx) {
  k.scene("reveal", (state: GameState) => {
    const outcome = state.lastOutcome!;
    const alive = outcome === "alive" && !state.phantomWrong;
    const color: RGB = state.phantomWrong ? COLORS.textDim : alive ? COLORS.alive : COLORS.dead;

    playCollapse(alive && !state.phantomWrong);

    if (!state.playerCorrect) screenShake(k);

    k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0), k.opacity(0.55), k.z(0)]);

    k.add([
      k.text("WAVEFUNCTION COLLAPSED", { size: 22 }),
      k.pos(k.center().x, 72),
      k.anchor("center"),
      k.color(...COLORS.crtGreen),
      k.z(1),
    ]);

    const count = state.boxes.length;
    const startX = k.center().x - ((count - 1) * 100) / 2;

    state.boxes.forEach((box, i) => {
      const x = startX + i * 100;
      const isActive = box.id === state.activeBoxId;
      const icon =
        state.phantomWrong && isActive ? "VOID" : box.outcome === "alive" ? "^..^" : "x..x";

      k.add([
        k.rect(count > 1 ? 88 : 220, count > 1 ? 70 : 120),
        k.pos(x, 200),
        k.anchor("center"),
        k.color(...COLORS.steel),
        k.outline(isActive ? 4 : 2, k.rgb(...(isActive ? color : COLORS.rust))),
        k.z(1),
      ]);

      k.add([
        k.text(icon, { size: count > 1 ? 20 : 40 }),
        k.pos(x, 200),
        k.anchor("center"),
        k.color(...(box.phantom && isActive ? COLORS.textDim : color)),
        k.z(1),
      ]);
    });

    const headline = state.phantomWrong ? "PHANTOM BOX" : `CAT IS ${outcome.toUpperCase()}`;

    k.add([
      k.text(headline, { size: 32 }),
      k.pos(k.center().x, 310),
      k.anchor("center"),
      k.color(...color),
      k.z(1),
    ]);

    k.add([
      k.text(state.message, { size: 14, width: k.width() - 80 }),
      k.pos(k.center().x, 355),
      k.anchor("center"),
      k.color(...COLORS.text),
      k.z(1),
    ]);

    if (state.observerGuess) {
      k.add([
        k.text(
          `Observer bet ${state.observerGuess.toUpperCase()} — ${state.observerCorrect ? "correct" : "wrong"}`,
          { size: 13 },
        ),
        k.pos(k.center().x, 385),
        k.anchor("center"),
        k.color(...COLORS.textDim),
        k.z(1),
      ]);
    }

    const canTreat =
      !state.catTreatUsed && state.inventory.includes("catTreat") && state.playerCorrect === false;

    function continueGame() {
      const next = advanceRound(state);
      if (isDefeat(state) || isVictory(state)) return;

      if (isNewAct(next.globalRound)) {
        k.go("actIntro", next);
      } else {
        k.go("play", next);
      }
    }

    if (canTreat) {
      makeButton(k, "CAT TREAT", k.center().x - 120, 450, 170, 44, () => {
        const rerolled = useCatTreat(state);
        if (!rerolled) return;
        playItemUse();
        if (isDefeat(rerolled)) {
          k.go("end", { ...rerolled, won: false });
          return;
        }
        if (isVictory(rerolled)) {
          k.go("end", { ...rerolled, won: true });
          return;
        }
        k.go("reveal", rerolled);
      });
    }

    const continueX = canTreat ? k.center().x + 120 : k.center().x;
    const continueLabel = state.globalRound >= 9 ? "FINISH" : "NEXT ROUND";

    makeButton(k, continueLabel, continueX, 450, 170, 44, () => {
      if (state.globalRound >= 9) {
        k.go("end", { ...state, won: state.playerLives > 0 });
        return;
      }
      continueGame();
    });

    drawScanlines(k);
  });
}
