export type Outcome = "alive" | "dead";

export function qrand(): number {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / (0xffffffff + 1);
}

export function collapse(a: number): Outcome {
  return qrand() < a ? "alive" : "dead";
}
