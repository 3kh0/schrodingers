import type { KAPLAYCtx } from "kaplay";
import { playCorrect, playItemUse, playWrong, startGeiger, stopGeiger } from "../audio";
import { COLORS } from "../config";
import type { GameState, Guess, ItemId } from "../types";
import { isDefeat, isVictory, resolveGuess, setActiveBoxId, useItem } from "../state";
import {
  drawBoxes,
  drawHeader,
  drawItemTray,
  drawMessageLog,
  opanel,
  pdial,
  drawScanlines,
  makeButton,
  screenShake,
  text,
} from "../ui";

export function registerPlayScene(k: KAPLAYCtx) {
  k.scene("play", (state: GameState) => {
    let current = state;
    let guessing = true;

    const active = () => current.boxes.find((b) => b.id === current.activeBoxId)!;

    drawHeader(k, current);
    // The clear meter (header) tracks the duel; the Observer panel only appears when it bets.
    if (current.roundConfig.observerBets) opanel(k);
    pdial(k, current);

    drawBoxes(k, current, (id) => {
      if (!guessing) return;
      current = setActiveBoxId(current, id);
      k.go("play", current);
    });

    const log = drawMessageLog(k, current.message);

    startGeiger(active().displayedProbability);

    function handleItem(item: ItemId) {
      if (!guessing) return;
      const next = useItem(current, item);
      if (next === current) return;
      playItemUse();
      stopGeiger();
      k.go("play", next);
    }

    function commitGuess(guess: Guess) {
      if (!guessing) return;
      guessing = false;
      stopGeiger();

      const next = resolveGuess(current, guess);
      current = next;
      log.text = next.message;

      if (next.playerCorrect) playCorrect();
      else {
        playWrong();
        screenShake(k);
      }

      k.wait(1.1, () => {
        if (isDefeat(next)) {
          k.go("end", { ...next, won: false });
          return;
        }
        if (isVictory(next)) {
          k.go("end", { ...next, won: true });
          return;
        }
        k.go("reveal", next);
      });
    }

    drawItemTray(k, current, (item) => handleItem(item));

    const betY = current.inventory.length > 0 ? 418 : 440;
    makeButton(k, "ALIVE", k.center().x - 130, betY, 150, 46, () => commitGuess("alive"));
    makeButton(k, "DEAD", k.center().x + 130, betY, 150, 46, () => commitGuess("dead"));

    // Guidance sits below the boxes (boxes end ~y290, message log at y360) so nothing overlaps.
    if (current.boxes.length > 1) {
      text(k, "Select a box, then bet.", k.center().x, 305, { size: 12, color: COLORS.crtDim });
    }

    if (current.schrodingerDiceActive) {
      text(k, "DICE ACTIVE", k.center().x, 325, { size: 12, color: COLORS.crtGreen });
    }

    drawScanlines(k);

    k.onDestroy(() => stopGeiger());
  });
}
