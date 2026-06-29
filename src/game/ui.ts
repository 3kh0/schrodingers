import type { Anchor, Comp, GameObj, KAPLAYCtx, TextComp } from "kaplay";
import { COLORS, type RGB } from "./config";
import { ITEMS } from "./items";
import type { BoxState, GameState, ItemId } from "./types";
import { getActiveBox } from "./boxes";
import { actBaseLives } from "./rounds";

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

function hpt(lives: number, max = 3): string {
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
  const toClear = hpt(state.observerLives, actBaseLives(state.act));
  text(k, `CLEAR ${toClear}`, k.center().x, 16, { size: 15, color: COLORS.dead, anchor: "top" });
  text(k, `You ${hpt(state.playerLives, state.maxPlayerLives)}`, k.width() - 20, 16, {
    size: 18,
    color: COLORS.alive,
    anchor: "topright",
  });
}

export function opanel(k: KAPLAYCtx) {
  drawPanel(k, 24, 52, 188, 150, "THE OBSERVER");
  text(k, '"I bet too."', 118, 110, { size: 16, color: COLORS.crtGreen });
  text(k, "guess better than it", 118, 150, { size: 11, color: COLORS.textDim });
}

export function pdial(k: KAPLAYCtx, state: GameState) {
  const active = getActiveBox(state);
  drawPanel(k, k.width() - 212, 52, 188, 150, "PROBABILITY");
  text(k, `${Math.round(active.displayedProbability * 100)}%`, k.width() - 118, 118, {
    size: 44,
    color: COLORS.crtGreen,
  });
  text(k, "ALIVE", k.width() - 118, 158, { size: 14, color: COLORS.textDim });
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

function tt(k: KAPLAYCtx, item: ItemId, slotX: number, bottomY: number): GameObj[] {
  const def = ITEMS[item];
  const w = 230,
    h = 50;
  const x = Math.min(Math.max(slotX, w / 2 + 10), k.width() - w / 2 - 10);
  const bg = k.add([
    k.rect(w, h),
    k.pos(x, bottomY),
    k.anchor("bot"),
    k.color(...COLORS.panel),
    k.outline(1, k.rgb(...COLORS.crtGreen)),
    k.z(50),
  ]);
  const name = text(k, def.name, x, bottomY - h + 12, { size: 12, color: COLORS.crtGreen, z: 51 });
  const desc = text(k, def.description, x, bottomY - 14, {
    size: 11,
    color: COLORS.text,
    width: w - 16,
    z: 51,
  });
  return [bg, name, desc];
}

export function drawItemTray(k: KAPLAYCtx, state: GameState, onUse: (item: ItemId) => void) {
  if (state.roundConfig.itemsDisabled) return;

  const slots = 4,
    slotW = (k.width() - 80) / slots;

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

    if (!item) {
      text(k, "—", x, y, { size: 20, color: COLORS.textDim });
      continue;
    }

    const { btn } = makeButton(k, ITEMS[item].short, x, y, slotW - 16, 42, () => onUse(item));
    let tip: GameObj[] = [];
    btn.onHover(() => (tip = tt(k, item, x, y - 32)));
    btn.onHoverEnd(() => {
      tip.forEach((o) => k.destroy(o));
      tip = [];
    });
  }
}

export function drawMessageLog(k: KAPLAYCtx, message: string): GameObj<TextComp> {
  return text(k, message, k.center().x, 360, {
    size: 14,
    width: k.width() - 60,
  }) as GameObj<TextComp>;
}
