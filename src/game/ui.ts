import type { KAPLAYCtx } from "kaplay";
import { COLORS } from "./config";
import { ITEMS } from "./items";
import type { BoxState, GameState, ItemId } from "./types";
import { getActiveBox } from "./boxes";

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function drawPanel(
  k: KAPLAYCtx,
  x: number,
  y: number,
  w: number,
  h: number,
  label?: string,
) {
  const panel = k.add([
    k.pos(x, y),
    k.rect(w, h),
    k.color(...COLORS.panel),
    k.outline(2, k.rgb(...COLORS.panelBorder)),
  ]);

  if (label) {
    k.add([k.text(label, { size: 13 }), k.pos(x + 10, y + 8), k.color(...COLORS.textDim)]);
  }

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

  const txt = k.add([
    k.text(label, { size: Math.min(18, Math.floor(w / Math.max(label.length * 0.55, 6))) }),
    k.pos(x, y),
    k.anchor("center"),
    k.color(...(enabled ? COLORS.text : COLORS.textDim)),
  ]);

  if (enabled) {
    btn.onHover(() => {
      btn.color = k.rgb(...COLORS.buttonHover);
    });
    btn.onHoverEnd(() => {
      btn.color = k.rgb(...COLORS.button);
    });
    btn.onClick(onPress);
  }

  return { btn, txt };
}

export function livesText(lives: number, max = 3): string {
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
  const rc = state.roundConfig;
  k.add([
    k.text(`Act ${rc.act} · Round ${rc.roundInAct}/3 — ${rc.title}`, { size: 15 }),
    k.pos(20, 16),
    k.color(...COLORS.textDim),
  ]);

  k.add([
    k.text(`RUN ${state.globalRound}/9`, { size: 13 }),
    k.pos(k.center().x, 16),
    k.anchor("top"),
    k.color(...COLORS.crtDim),
  ]);

  k.add([
    k.text(`You ${livesText(state.playerLives, state.maxPlayerLives)}`, { size: 18 }),
    k.pos(k.width() - 20, 16),
    k.anchor("topright"),
    k.color(...COLORS.alive),
  ]);
}

export function drawObserverPanel(k: KAPLAYCtx, state: GameState) {
  drawPanel(k, 24, 52, 188, 150, "THE OBSERVER");
  k.add([
    k.text(livesText(state.observerLives), { size: 26 }),
    k.pos(118, 120),
    k.anchor("center"),
    k.color(...COLORS.dead),
  ]);

  const quotes = ['"Bet, human."', '"Observe."', '"Collapse it."', '"The cat waits."'];
  const quote = quotes[state.globalRound % quotes.length];
  k.add([
    k.text(quote, { size: 13 }),
    k.pos(118, 168),
    k.anchor("center"),
    k.color(...COLORS.textDim),
  ]);
}

export function drawProbabilityDial(k: KAPLAYCtx, state: GameState) {
  const active = getActiveBox(state);
  drawPanel(k, k.width() - 212, 52, 188, 150, "PROBABILITY");
  const pct = Math.round(active.displayedProbability * 100);
  k.add([
    k.text(`${pct}%`, { size: 44 }),
    k.pos(k.width() - 118, 118),
    k.anchor("center"),
    k.color(...COLORS.crtGreen),
  ]);
  k.add([
    k.text("ALIVE", { size: 14 }),
    k.pos(k.width() - 118, 158),
    k.anchor("center"),
    k.color(...COLORS.textDim),
  ]);

  if (state.roundConfig.twist === "quantum_shotgun" && state.shotgunAliveCount) {
    k.add([
      k.text(`${state.shotgunAliveCount} alive hidden`, { size: 11 }),
      k.pos(k.width() - 118, 182),
      k.anchor("center"),
      k.color(...COLORS.textDim),
    ]);
  }
}

function boxIcon(box: BoxState): string {
  if (box.phantom && box.peeked) return "VOID";
  if ((box.peeked || box.collapsed) && box.outcome) {
    return box.outcome === "alive" ? "^..^" : "x..x";
  }
  return "? ? ?";
}

export function drawBoxes(k: KAPLAYCtx, state: GameState, onSelect: (id: string) => void) {
  const boxes = state.boxes;
  const count = boxes.length;
  const startX = k.center().x - ((count - 1) * 110) / 2;
  const y = 250;

  boxes.forEach((box, i) => {
    const x = startX + i * 110;
    const selected = box.id === state.activeBoxId;
    const border = selected ? COLORS.crtGreen : COLORS.rust;

    const rect = k.add([
      k.pos(x, y),
      k.anchor("center"),
      k.rect(count > 1 ? 96 : 200, count > 1 ? 80 : 130),
      k.color(...COLORS.steel),
      k.outline(selected ? 4 : 2, k.rgb(...border)),
      k.area(),
      k.opacity(1),
      "box",
    ]);

    k.add([
      k.text(box.label, { size: 11 }),
      k.pos(x, y - (count > 1 ? 52 : 78)),
      k.anchor("center"),
      k.color(...COLORS.textDim),
    ]);

    const icon = k.add([
      k.text(boxIcon(box), { size: count > 1 ? 18 : 34 }),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...(box.phantom && box.peeked ? COLORS.textDim : COLORS.crtGreen)),
      k.opacity(1),
    ]);

    if (box.entangledWith) {
      k.add([
        k.text("⇄", { size: 14 }),
        k.pos(x, y + (count > 1 ? 38 : 58)),
        k.anchor("center"),
        k.color(...COLORS.crtDim),
      ]);
    }

    let tick = 0;
    icon.onUpdate(() => {
      if (box.peeked || box.collapsed) return;
      tick += k.dt();
      icon.opacity = 0.55 + Math.sin(tick * 5) * 0.35;
    });

    if (count > 1) {
      rect.onClick(() => onSelect(box.id));
    }
  });
}

export function drawItemTray(k: KAPLAYCtx, state: GameState, onUse: (item: ItemId) => void) {
  drawPanel(k, 24, k.height() - 88, k.width() - 48, 72, "QUANTUM TOOLKIT");

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

    if (item) {
      const def = ITEMS[item];
      const enabled = !state.roundConfig.itemsDisabled;
      makeButton(k, def.short, x, y, slotW - 16, 42, () => onUse(item), enabled);
    } else {
      k.add([
        k.text("—", { size: 20 }),
        k.pos(x, y),
        k.anchor("center"),
        k.color(...COLORS.textDim),
      ]);
    }
  }

  if (state.roundConfig.itemsDisabled) {
    k.add([
      k.text("ITEMS LOCKED — FINAL DUEL", { size: 11 }),
      k.pos(k.center().x, k.height() - 82),
      k.anchor("center"),
      k.color(...COLORS.dead),
    ]);
  }
}

export function drawMessageLog(k: KAPLAYCtx, message: string) {
  return k.add([
    k.text(message, { size: 14, width: k.width() - 60 }),
    k.pos(k.center().x, 360),
    k.anchor("center"),
    k.color(...COLORS.text),
  ]);
}
