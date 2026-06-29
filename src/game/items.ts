import { qrand } from "./rng";
import type { ItemId } from "./types";

export type ItemDef = {
  id: ItemId;
  name: string;
  short: string;
  description: string;
};

export const ITEMS: Record<ItemId, ItemDef> = {
  geiger: {
    id: "geiger",
    name: "Geiger Counter",
    short: "GEIGER",
    description: "Detect if odds are not 50/50",
  },
  xray: {
    id: "xray",
    name: "X-Ray Pulse",
    short: "X-RAY",
    description: "Reveal one box's true state",
  },
  halfLife: {
    id: "halfLife",
    name: "Half-Life Vial",
    short: "VIAL",
    description: "Drop active box alive odds by 20%",
  },
  entangle: {
    id: "entangle",
    name: "Entanglement Wire",
    short: "WIRE",
    description: "Link two boxes to opposite fates",
  },
  decoherence: {
    id: "decoherence",
    name: "Decoherence Patch",
    short: "PATCH",
    description: "Restore +1 life",
  },
  cigarette: {
    id: "cigarette",
    name: "Cigarette",
    short: "SMOKE",
    description: "Observer skips this round; risky next round",
  },
  catTreat: {
    id: "catTreat",
    name: "Cat Treat",
    short: "TREAT",
    description: "Reroll the last collapse once per run",
  },
  schrodingerDice: {
    id: "schrodingerDice",
    name: "Schrödinger's Dice",
    short: "DICE",
    description: "Next guess auto-wins unless you peeked",
  },
};

const ALL_ITEM_IDS = Object.keys(ITEMS) as ItemId[];

export function randomItem(exclude: ItemId[] = []): ItemId {
  const pool = ALL_ITEM_IDS.filter((id) => !exclude.includes(id));
  const idx = Math.floor(qrand() * pool.length);
  return pool[idx] ?? "geiger";
}

export function addItem(inventory: ItemId[], item: ItemId, max = 4): ItemId[] {
  if (inventory.length >= max || inventory.includes(item)) return inventory;
  return [...inventory, item];
}

export function removeItem(inventory: ItemId[], item: ItemId): ItemId[] {
  return inventory.includes(item) ? inventory.filter((i) => i !== item) : inventory;
}
