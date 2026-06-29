export type Outcome = "alive" | "dead";

/** Cryptographically secure random float in [0, 1). */
export function quantumRandom(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / (0xffffffff + 1);
}

export function collapse(probabilityAlive: number): Outcome {
  return quantumRandom() < probabilityAlive ? "alive" : "dead";
}
