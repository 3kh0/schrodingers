import { qrand } from "./rng";

let ctx: AudioContext | null = null;
let geigerTimer: ReturnType<typeof setInterval> | null = null;
let reducedMotion = false;

let bgmMaster: GainNode | null = null;
let bgmDroneOscs: OscillatorNode[] = [];
let bgmSeqTimer: ReturnType<typeof setInterval> | null = null;
let bgmPlaying = false;
let bgmBeat = 0;

const BGM_BASS = [110, 110, 98, 98, 82.41, 82.41, 98, 98];
const BGM_MELODY = [
  0, 220, 0, 261.63, 0, 329.63, 0, 293.66, 0, 261.63, 0, 220, 0, 196, 0, 220, 0, 246.94, 0, 261.63,
  0, 196, 0, 220, 0, 0, 0, 329.63, 0, 0, 0, 220,
];
const BGM_BEAT_MS = 520;

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

function playBgmTone(
  audio: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  gain: number,
) {
  if (!bgmMaster) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = Math.max(gain, 0.0001);
  osc.connect(g);
  g.connect(bgmMaster);
  const t = audio.currentTime;
  osc.start(t);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.stop(t + duration + 0.02);
}

function stepBgm() {
  const audio = ctx;
  if (!audio || !bgmMaster) return;

  const beat = bgmBeat++;

  if (beat % 2 === 0) {
    const bass = BGM_BASS[(beat / 2) % BGM_BASS.length];
    playBgmTone(audio, bass, 0.9, "triangle", 0.045);
  }

  const mel = BGM_MELODY[beat % BGM_MELODY.length];
  if (mel > 0) {
    playBgmTone(audio, mel, 0.4, "sine", 0.032);
  }

  if (beat % 16 === 12) {
    playBgmTone(audio, 440, 0.7, "sine", 0.018);
    playBgmTone(audio, 660, 0.5, "sine", 0.012);
  }
}

export function startBgm() {
  if (bgmPlaying) return;
  const audio = ensureAudio();
  if (!audio) return;

  bgmPlaying = true;
  bgmBeat = 0;

  bgmMaster = audio.createGain();
  bgmMaster.gain.value = 0.0001;
  bgmMaster.connect(audio.destination);
  bgmMaster.gain.exponentialRampToValueAtTime(0.5, audio.currentTime + 2.2);

  const drones: { freq: number; detune: number; gain: number }[] = [
    { freq: 55, detune: 0, gain: 0.07 },
    { freq: 55, detune: 6, gain: 0.045 },
    { freq: 82.41, detune: -3, gain: 0.035 },
  ];
  for (const d of drones) {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = d.freq;
    osc.detune.value = d.detune;
    g.gain.value = d.gain;
    osc.connect(g);
    g.connect(bgmMaster);
    osc.start();
    bgmDroneOscs.push(osc);
  }

  stepBgm();
  bgmSeqTimer = setInterval(stepBgm, BGM_BEAT_MS);
}

export function stopBgm() {
  if (bgmSeqTimer) {
    clearInterval(bgmSeqTimer);
    bgmSeqTimer = null;
  }
  for (const osc of bgmDroneOscs) {
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
  }
  bgmDroneOscs = [];
  if (bgmMaster && ctx) {
    try {
      bgmMaster.gain.cancelScheduledValues(ctx.currentTime);
      bgmMaster.gain.setValueAtTime(bgmMaster.gain.value, ctx.currentTime);
      bgmMaster.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      const master = bgmMaster;
      setTimeout(() => {
        try {
          master.disconnect();
        } catch {
          /* noop */
        }
      }, 500);
    } catch {
      /* noop */
    }
  }
  bgmMaster = null;
  bgmPlaying = false;
  bgmBeat = 0;
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
