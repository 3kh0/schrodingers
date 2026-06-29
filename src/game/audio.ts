import { qrand } from "./rng";

let ctx: AudioContext | null = null;
let geigerTimer: ReturnType<typeof setInterval> | null = null;
let reducedMotion = false;

export function initAudioSettings() {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ensureAudio(): AudioContext | null {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

function tone(frequency: number, duration: number, type: OscillatorType = "square", gain = 0.08) {
  const audio = ensureAudio();
  if (!audio) return;

  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(audio.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  osc.stop(audio.currentTime + duration);
}

function click(gain = 0.12) {
  const audio = ensureAudio();
  if (!audio) return;
  const buffer = audio.createBuffer(1, audio.sampleRate * 0.02, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (qrand() * 2 - 1) * (1 - i / data.length);
  }
  const src = audio.createBufferSource();
  const g = audio.createGain();
  src.buffer = buffer;
  g.gain.value = gain;
  src.connect(g);
  g.connect(audio.destination);
  src.start();
}

export function playGeigerTick(intensity: number) {
  if (reducedMotion) return;
  click(0.04 + intensity * 0.1);
}

export function startGeiger(probability: number) {
  stopGeiger();
  if (reducedMotion) return;
  const intensity = Math.abs(probability - 0.5) * 2;
  const interval = Math.max(120, 900 - intensity * 700);
  geigerTimer = setInterval(() => playGeigerTick(intensity), interval);
}

export function stopGeiger() {
  if (geigerTimer) {
    clearInterval(geigerTimer);
    geigerTimer = null;
  }
}

export function playCorrect() {
  tone(520, 0.1, "triangle", 0.07);
  tone(780, 0.18, "triangle", 0.06);
}

export function playWrong() {
  tone(140, 0.3, "sawtooth", 0.1);
}

export function playItemUse() {
  tone(400, 0.06, "sine", 0.05);
  tone(600, 0.1, "sine", 0.04);
}

export function playActSting() {
  tone(220, 0.2, "triangle", 0.06);
  tone(330, 0.35, "triangle", 0.05);
}
