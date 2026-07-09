import type { KAPLAYCtx } from "kaplay";
import { ensureAudio, initAudioSettings, startBgm } from "../audio";
import { COLORS } from "../config";
import { createInitialState } from "../state";
import { drawScanlines, makeButton, text } from "../ui";

export function registerMenuScene(k: KAPLAYCtx) {
  k.scene("menu", () => {
    initAudioSettings();
    const cx = k.center().x;

    text(k, "SCHRODINGER'S BOX", cx, 90, { size: 40, color: COLORS.crtGreen });
    text(k, "A simple game about randomness", cx, 160, { size: 16, color: COLORS.textDim });

    const box = k.add([
      k.pos(cx, 275),
      k.anchor("center"),
      k.rect(170, 115),
      k.color(...COLORS.steel),
      k.outline(3, k.rgb(...COLORS.rust)),
      k.opacity(1),
    ]);
    text(k, "? ? ?", cx, 275, { size: 40, color: COLORS.crtGreen });

    let pulse = 0;
    box.onUpdate(() => {
      pulse += k.dt() * 2;
      box.opacity = 0.82 + Math.sin(pulse) * 0.18;
    });

    makeButton(k, "BEGIN", cx, 400, 200, 50, () => {
      ensureAudio();
      startBgm();
      k.go("actIntro", createInitialState());
    });

    drawScanlines(k);
  });
}
