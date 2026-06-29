import type { KAPLAYCtx } from "kaplay";
import { ensureAudio, initAudioSettings } from "../audio";
import { COLORS } from "../config";
import { createInitialState } from "../state";
import { drawScanlines, makeButton } from "../ui";

export function registerMenuScene(k: KAPLAYCtx) {
  k.scene("menu", () => {
    initAudioSettings();

    k.add([
      k.text("SCHRODINGER'S BOX", { size: 40 }),
      k.pos(k.center().x, 90),
      k.anchor("center"),
      k.color(...COLORS.crtGreen),
    ]);

    k.add([
      k.text("A simple game about randomness", { size: 16 }),
      k.pos(k.center().x, 160),
      k.anchor("center"),
      k.color(...COLORS.textDim),
    ]);

    const box = k.add([
      k.pos(k.center().x, 275),
      k.anchor("center"),
      k.rect(170, 115),
      k.color(...COLORS.steel),
      k.outline(3, k.rgb(...COLORS.rust)),
      k.opacity(1),
    ]);

    k.add([
      k.text("? ? ?", { size: 40 }),
      k.pos(k.center().x, 275),
      k.anchor("center"),
      k.color(...COLORS.crtGreen),
    ]);

    let pulse = 0;
    box.onUpdate(() => {
      pulse += k.dt() * 2;
      box.opacity = 0.82 + Math.sin(pulse) * 0.18;
    });

    makeButton(k, "BEGIN", k.center().x, 400, 200, 50, () => {
      ensureAudio();
      k.go("actIntro", createInitialState());
    });

    drawScanlines(k);
  });
}
