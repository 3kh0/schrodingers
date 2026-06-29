import type { KAPLAYCtx } from "kaplay";
import { playActSting } from "../audio";
import { COLORS } from "../config";
import type { GameState } from "../types";
import { drawScanlines, makeButton, text } from "../ui";

export function registerActIntroScene(k: KAPLAYCtx) {
  k.scene("actIntro", (state: GameState) => {
    const rc = state.roundConfig;
    const cx = k.center().x;
    const play = () =>
      makeButton(k, "PLAY", cx, rc.act === 1 ? 330 : 380, 220, 50, () => k.go("play", state));

    playActSting();

    // Act 1 is the bare opening — no items, no twists. Keep its card minimal.
    if (rc.act === 1) {
      text(k, "ACT 1", cx, 230, { size: 48, color: COLORS.crtGreen });
      play();
      drawScanlines(k);
      return;
    }

    text(k, `ACT ${rc.act}`, cx, 135, { size: 20, color: COLORS.textDim });
    text(k, rc.actTitle, cx, 195, { size: 40, color: COLORS.crtGreen });
    text(k, rc.briefing, cx, 265, { size: 18, width: 500 });
    play();
    drawScanlines(k);
  });
}
