import type { Anchor, Comp, GameObj, KAPLAYCtx, TextComp } from "kaplay";
import { COLORS, type RGB } from "./config";
import { ITEMS } from "./items";
import type { BoxState, GameState, ItemId } from "./types";
import { getActiveBox } from "./boxes";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type TextOpts = { size?: number; color?: RGB; anchor?: Anchor; width?: number; z?: number };

export function text(k: KAPLAYCtx, str: string, x: number, y: number, opts: TextOpts = {}) {
  const { size = 14, color = COLORS.text, anchor = "center", width, z } = opts;
  const comps: Comp[] = [
    k.text(str, width ? { size, width } : { size }),
    k.pos(x, y),
    k.anchor(anchor),
    k.color(...color),
  ];
  if (z !== undefined) comps.push(k.z(z));
  return k.add(comps);
}

function drawPanel(k: KAPLAYCtx, x: number, y: number, w: number, h: number, label?: string) {
  const panel = k.add([
    k.pos(x, y),
    k.rect(w, h),
    k.color(...COLORS.panel),
    k.outline(2, k.rgb(...COLORS.panelBorder)),
  ]);
  if (label) text(k, label, x + 10, y + 8, { size: 13, color: COLORS.textDim, anchor: "topleft" });
  return panel;
}

export function makeButton(
  k: KAPLAYCtx,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  onPress: () => void,
  enabled = true,
) {
  const btn = k.add([
    k.pos(x, y),
    k.anchor("center"),
    k.rect(w, h),
    k.color(...(enabled ? COLORS.button : COLORS.panel)),
    k.outline(2, k.rgb(...COLORS.panelBorder)),
    k.area(),
    k.opacity(enabled ? 1 : 0.45),
    "button",
  ]);

  const txt = text(k, label, x, y, {
    size: Math.min(18, Math.floor(w / Math.max(label.length * 0.55, 6))),
    color: enabled ? COLORS.text : COLORS.textDim,
  });

  if (enabled) {
    btn.onHover(() => (btn.color = k.rgb(...COLORS.buttonHover)));
    btn.onHoverEnd(() => (btn.color = k.rgb(...COLORS.button)));
    btn.onClick(onPress);
  }

  return { btn, txt };
}

function livesText(lives: number, max = 3): string {
  return "♥".repeat(Math.max(0, lives)) + "♡".repeat(Math.max(0, max - lives));
}

export function drawScanlines(k: KAPLAYCtx) {
  for (let y = 0; y < k.height(); y += 4) {
    k.add([
      k.pos(0, y),
      k.rect(k.width(), 1),
      k.color(0, 0, 0),
      k.opacity(0.1),
      k.fixed(),
      k.z(1000),
    ]);
  }
}

export function screenShake(k: KAPLAYCtx, intensity = 6, duration = 0.35) {
  if (reducedMotion()) return;
  const cam = k.camPos();
  let elapsed = 0;
  const shakeObj = k.add([k.pos(0, 0), k.opacity(0), "shake"]);
  shakeObj.onUpdate(() => {
    elapsed += k.dt();
    if (elapsed >= duration) {
      k.camPos(cam);
      k.destroy(shakeObj);
      return;
    }
    k.camPos(cam.x + (Math.random() - 0.5) * intensity, cam.y + (Math.random() - 0.5) * intensity);
  });
}

export function drawHeader(k: KAPLAYCtx, state: GameState) {
  text(k, `ACT ${state.roundConfig.act}`, 20, 16, {
    size: 15,
    color: COLORS.textDim,
    anchor: "topleft",
  });
  text(k, `RUN ${state.globalRound}/9`, k.center().x, 16, {
    size: 13,
    color: COLORS.crtDim,
    anchor: "top",
  });
  text(k, `You ${livesText(state.playerLives, state.maxPlayerLives)}`, k.width() - 20, 16, {
    size: 18,
    color: COLORS.alive,
    anchor: "topright",
  });
}

export function drawObserverPanel(k: KAPLAYCtx, state: GameState) {
  drawPanel(k, 24, 52, 188, 150, "THE OBSERVER");
  text(k, livesText(state.observerLives), 118, 120, { size: 26, color: COLORS.dead });

  const quotes = ['"Bet, human."', '"Observe."', '"Collapse it."', '"The cat waits."'];
  text(k, quotes[state.globalRound % quotes.length], 118, 168, { size: 13, color: COLORS.textDim });
}

export function drawProbabilityDial(k: KAPLAYCtx, state: GameState) {
  const active = getActiveBox(state);
  drawPanel(k, k.width() - 212, 52, 188, 150, "PROBABILITY");
  text(k, `${Math.round(active.displayedProbability * 100)}%`, k.width() - 118, 118, {
    size: 44,
    color: COLORS.crtGreen,
  });
  text(k, "ALIVE", k.width() - 118, 158, { size: 14, color: COLORS.textDim });

  if (state.roundConfig.twist === "quantum_shotgun" && state.shotgunAliveCount) {
    text(k, `${state.shotgunAliveCount} alive hidden`, k.width() - 118, 182, {
      size: 11,
      color: COLORS.textDim,
    });
  }
}

function boxIcon(box: BoxState): string {
  if (box.phantom && box.peeked) return "VOID";
  if ((box.peeked || box.collapsed) && box.outcome)
    return box.outcome === "alive" ? "^..^" : "x..x";
  return "? ? ?";
}

export function drawBoxes(k: KAPLAYCtx, state: GameState, onSelect: (id: string) => void) {
  const { boxes } = state;
  const count = boxes.length;
  const startX = k.center().x - ((count - 1) * 110) / 2;
  const y = 250;

  boxes.forEach((box, i) => {
    const x = startX + i * 110;
    const selected = box.id === state.activeBoxId;

    const rect = k.add([
      k.pos(x, y),
      k.anchor("center"),
      k.rect(count > 1 ? 96 : 200, count > 1 ? 80 : 130),
      k.color(...COLORS.steel),
      k.outline(selected ? 4 : 2, k.rgb(...(selected ? COLORS.crtGreen : COLORS.rust))),
      k.area(),
      k.opacity(1),
      "box",
    ]);

    text(k, box.label, x, y - (count > 1 ? 52 : 78), { size: 11, color: COLORS.textDim });

    const icon = k.add([
      k.text(boxIcon(box), { size: count > 1 ? 18 : 34 }),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...(box.phantom && box.peeked ? COLORS.textDim : COLORS.crtGreen)),
      k.opacity(1),
    ]);

    if (box.entangledWith) {
      text(k, "⇄", x, y + (count > 1 ? 38 : 58), { size: 14, color: COLORS.crtDim });
    }

    let tick = 0;
    icon.onUpdate(() => {
      if (box.peeked || box.collapsed) return;
      tick += k.dt();
      icon.opacity = 0.55 + Math.sin(tick * 5) * 0.35;
    });

    if (count > 1) rect.onClick(() => onSelect(box.id));
  });
}

export function drawItemTray(k: KAPLAYCtx, state: GameState, onUse: (item: ItemId) => void) {
  // No items in play (Act 1, final duel) → hide the tray entirely.
  if (state.roundConfig.itemsDisabled) return;

  const slots = 4;
  const slotW = (k.width() - 80) / slots;

  for (let i = 0; i < slots; i++) {
    const x = 44 + i * slotW + slotW / 2;
    const y = k.height() - 44;
    const item = state.inventory[i];

    k.add([
      k.rect(slotW - 12, 48),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...COLORS.panel),
      k.outline(1, k.rgb(...COLORS.panelBorder)),
    ]);

    if (item) makeButton(k, ITEMS[item].short, x, y, slotW - 16, 42, () => onUse(item));
    else text(k, "—", x, y, { size: 20, color: COLORS.textDim });
  }
}

export function drawMessageLog(k: KAPLAYCtx, message: string): GameObj<TextComp> {
  return text(k, message, k.center().x, 360, {
    size: 14,
    width: k.width() - 60,
  }) as GameObj<TextComp>;
}
