import type { KAPLAYCtx } from "kaplay";
import { playActSting } from "../audio";
import { COLORS } from "../config";
import type { GameState } from "../types";
import { drawScanlines, makeButton } from "../ui";

export function registerActIntroScene(k: KAPLAYCtx) {
  k.scene("actIntro", (state: GameState) => {
    const rc = state.roundConfig;

    playActSting();

    k.add([
      k.text(`ACT ${rc.act}`, { size: 20 }),
      k.pos(k.center().x, 140),
      k.anchor("center"),
      k.color(...COLORS.textDim),
    ]);

    k.add([
      k.text(rc.actTitle, { size: 40 }),
      k.pos(k.center().x, 200),
      k.anchor("center"),
      k.color(...COLORS.crtGreen),
    ]);

    k.add([
      k.text(rc.briefing, { size: 18, width: 500 }),
      k.pos(k.center().x, 280),
      k.anchor("center"),
      k.color(...COLORS.text),
    ]);

    k.add([
      k.text(`Round ${rc.roundInAct}: ${rc.title}`, { size: 16 }),
      k.pos(k.center().x, 340),
      k.anchor("center"),
      k.color(...COLORS.textDim),
    ]);

    makeButton(k, "ENTER THE LAB", k.center().x, 430, 220, 50, () => {
      k.go("play", state);
    });

    drawScanlines(k);
  });
}
