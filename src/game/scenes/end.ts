import type { GameObj, KAPLAYCtx } from "kaplay";
import { COLORS, type RGB } from "../config";
import type { EndState } from "../types";
import { drawScanlines, makeButton, text } from "../ui";

const LEARN_MORE_URL = "https://en.wikipedia.org/wiki/Schr%C3%B6dinger%27s_cat";

const SCIENCE: { title: string; body: string }[] = [
  {
    title: "SUPERPOSITION",
    body: "Until it is measured, a quantum system holds every possible state at once, which means the cat is alive AND dead. The probability is just how those states are weighted.",
  },
  {
    title: "DECOHERENCE",
    body: "Contact with the environment collapses superposition into one definite outcome. Your 'coherence' (lives) is that fragile in-between, lose it all and you decohere.",
  },
  {
    title: "THE OBSERVER EFFECT",
    body: "Measuring a quantum system disturbs it. Peeking inside a box can shift the very odds you were trying to read — observation is never free.",
  },
];

export function registerEndScene(k: KAPLAYCtx) {
  k.scene("end", (state: EndState) => {
    const title = state.won ? "Observer Dechored" : "You Dechored";
    const subtitle = state.won ? "You survived." : "You failed to protect the cat.";
    const color: RGB = state.won ? COLORS.alive : COLORS.dead;
    const cx = k.center().x;

    const scrollers: { o: GameObj; y: number }[] = [];
    const at = <T extends GameObj>(o: T, y: number): T => {
      scrollers.push({ o, y });
      return o;
    };

    at(text(k, title, cx, 90, { size: 34, color }), 90);
    at(text(k, subtitle, cx, 135, { size: 17, color: COLORS.textDim }), 135);

    const lines = [
      `Acts cleared: ${state.stats.roundsCleared}`,
      `Correct guesses: ${state.stats.correctGuesses}`,
      `Wrong guesses: ${state.stats.wrongGuesses}`,
      `Items used: ${state.stats.itemsUsed}`,
      `Observer mistakes: ${state.stats.observerWrong}`,
      `Final lives: ${state.playerLives} / ${state.maxPlayerLives}`,
    ];
    lines.forEach((line, i) => at(text(k, line, cx, 190 + i * 26, { size: 15 }), 190 + i * 26));

    const replay = makeButton(k, "PLAY AGAIN", cx, 372, 200, 48, () => k.go("menu"));
    at(replay.btn, 372);
    at(replay.txt, 372);

    at(
      text(k, "↓ scroll for the real quantum science ↓", cx, 432, {
        size: 12,
        color: COLORS.crtDim,
      }),
      432,
    );

    at(text(k, "THE REAL SCIENCE", cx, 512, { size: 20, color: COLORS.crtGreen }), 512);

    let y = 558;
    for (const s of SCIENCE) {
      at(text(k, s.title, cx, y, { size: 15, color: COLORS.alive }), y);
      at(text(k, s.body, cx, y + 24, { size: 13, color: COLORS.text, width: 720 }), y + 24);
      y += 92;
    }

    const link = k.add([
      k.text("Learn more: Schrödinger's cat (Wikipedia) ↗", { size: 13 }),
      k.pos(cx, y),
      k.anchor("center"),
      k.color(...COLORS.crtGreen),
      k.area(),
    ]);
    link.onClick(() => window.open(LEARN_MORE_URL, "_blank", "noopener"));
    link.onHover(() => (link.color = k.rgb(...COLORS.buttonHover)));
    link.onHoverEnd(() => (link.color = k.rgb(...COLORS.crtGreen)));
    at(link, y);

    at(text(k, "thanks for playing :3", cx, y + 45, { size: 11, color: COLORS.crtDim }), y + 45);

    const maxScroll = Math.max(0, y + 80 - k.height());
    let scrollY = 0;
    const apply = () => scrollers.forEach(({ o, y: baseY }) => (o.pos.y = baseY - scrollY));
    const scrollBy = (dy: number) => {
      scrollY = Math.min(Math.max(scrollY + dy, 0), maxScroll);
      apply();
    };

    k.onScroll((d) => scrollBy(d.y));
    k.onKeyDown("down", () => scrollBy(9));
    k.onKeyDown("up", () => scrollBy(-9));

    drawScanlines(k);
  });
}
