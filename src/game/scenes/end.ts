import type { GameObj, KAPLAYCtx } from "kaplay";
import { COLORS, type RGB } from "../config";
import type { EndState } from "../types";
import { drawScanlines, makeButton, text } from "../ui";

const LEARN_MORE_URL = "https://en.wikipedia.org/wiki/Schr%C3%B6dinger%27s_cat";

const SCIENCE: { title: string; body: string }[] = [
  {
    title: "SUPERPOSITION",
    body: "Superposition is the idea that a tiny quantum particle can be in multiple states at the same time. Imagine a coin spinning in the air, while it's spinning, it's not just heads or tails, it's both at once. Only when it lands (or gets measured) does it become one or the other. This isn't because we don't know the answer, the particle genuinely exists in all possibilities simultaneously until something forces it to pick one.",
  },
  {
    title: "DECOHERENCE",
    body: "Decoherence is what happens when the quantum world collides with our normal, everyday environment. When a quantum particle bumps into air molecules, light, heat, or anything else around it, it loses its ability to stay in multiple states at once. It's like the spinning coin finally getting touched or disturbed, it has to settle on heads or tails. This is why we never see big things like cats or people being in two states at the same time in real life.",
  },
  {
    title: "THE OBSERVER EFFECT",
    body: "The observer effect means that simply trying to measure or look at a quantum particle changes what it does. Before you measure it, the particle can be in superposition (many states at once). But the moment you check on it, it is forced to pick one definite state. It's not magic eyes or conscious observation that matters; it's the physical interaction of the measurement itself that collapses all the possibilities into one outcome.",
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
