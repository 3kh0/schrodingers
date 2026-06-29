import type { KAPLAYCtx } from "kaplay";
import { playItemUse } from "../audio";
import { COLORS, type RGB } from "../config";
import { isNewAct } from "../rounds";
import type { GameState } from "../types";
import { advanceRound, isDefeat, isVictory, useCatTreat } from "../state";
import { drawScanlines, makeButton, screenShake, text } from "../ui";

export function registerRevealScene(k: KAPLAYCtx) {
  k.scene("reveal", (state: GameState) => {
    const outcome = state.lastOutcome!;
    const alive = outcome === "alive" && !state.phantomWrong;
    const color: RGB = state.phantomWrong ? COLORS.textDim : alive ? COLORS.alive : COLORS.dead;

    if (!state.playerCorrect) screenShake(k);

    k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0), k.opacity(0.55), k.z(0)]);

    const cx = k.center().x;
    const count = state.boxes.length;
    const startX = cx - ((count - 1) * 100) / 2;

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

      text(k, icon, x, 200, {
        size: count > 1 ? 20 : 40,
        color: box.phantom && isActive ? COLORS.textDim : color,
        z: 1,
      });
    });

    const headline = state.phantomWrong ? "PHANTOM BOX" : `CAT IS ${outcome.toUpperCase()}`;
    text(k, headline, cx, 310, { size: 32, color, z: 1 });
    text(k, state.message, cx, 355, { size: 14, width: k.width() - 80, z: 1 });

    if (state.observerGuess) {
      const verdict = state.observerCorrect ? "correct" : "wrong";
      text(k, `Observer bet ${state.observerGuess.toUpperCase()} — ${verdict}`, cx, 385, {
        size: 13,
        color: COLORS.textDim,
        z: 1,
      });
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
      makeButton(k, "CAT TREAT", cx - 120, 450, 170, 44, () => {
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

    const continueX = canTreat ? cx + 120 : cx;
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
