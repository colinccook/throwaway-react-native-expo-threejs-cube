/**
 * Sci-fi sound effects using the Web Audio API.
 * All sounds are synthesised — no external audio files required.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Call on the first user gesture to unlock the AudioContext. */
export function ensureAudioContext(): void {
  getCtx();
}

// ── Typing beep ────────────────────────────────────────────────────────────

const BEEP_FREQS = [1200, 900, 1400, 1100, 800];

/** Short electronic beep — one per character during the title-type animation. */
export function playBeep(charIndex: number): void {
  const c = getCtx();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();

  const freq = BEEP_FREQS[charIndex % BEEP_FREQS.length];
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(
    freq * 0.7,
    c.currentTime + 0.04,
  );

  gain.gain.setValueAtTime(0.06, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);

  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.06);
}

// ── Transition swish ───────────────────────────────────────────────────────

/** Filtered-noise whoosh played when a page actually transitions. */
export function playSwish(): void {
  const c = getCtx();
  if (!c) return;

  const len = c.sampleRate * 0.25;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }

  const src = c.createBufferSource();
  src.buffer = buf;

  const filt = c.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.setValueAtTime(3000, c.currentTime);
  filt.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.25);
  filt.Q.value = 1.2;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.15, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);

  src.connect(filt).connect(gain).connect(c.destination);
  src.start();
}

// ── Continuous swipe sound (builds while dragging) ─────────────────────────

let swipeSrc: AudioBufferSourceNode | null = null;
let swipeGain: GainNode | null = null;
let swipeFilt: BiquadFilterNode | null = null;

/** Start a looping filtered-noise bed that grows with drag distance. */
export function startSwipeSound(): void {
  stopSwipeSound(false); // clean up any previous instance
  const c = getCtx();
  if (!c) return;

  const len = c.sampleRate * 4;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

  swipeSrc = c.createBufferSource();
  swipeSrc.buffer = buf;
  swipeSrc.loop = true;

  swipeFilt = c.createBiquadFilter();
  swipeFilt.type = "lowpass";
  swipeFilt.frequency.value = 200;
  swipeFilt.Q.value = 1.5;

  swipeGain = c.createGain();
  swipeGain.gain.value = 0;

  swipeSrc.connect(swipeFilt).connect(swipeGain).connect(c.destination);
  swipeSrc.start();
}

/** Intensity 0–1: maps drag progress to volume & filter cutoff. */
export function updateSwipeSound(intensity: number): void {
  if (!swipeGain || !swipeFilt) return;
  const clamped = Math.min(1, Math.max(0, intensity));
  swipeGain.gain.value = clamped * 0.1;
  swipeFilt.frequency.value = 200 + clamped * 2500;
}

/**
 * Fade the continuous swipe noise out.
 * If `didTransition` is true a whoosh is played on top.
 */
export function stopSwipeSound(didTransition: boolean): void {
  const c = getCtx();
  if (swipeGain && c) {
    try {
      swipeGain.gain.exponentialRampToValueAtTime(
        0.001,
        c.currentTime + 0.08,
      );
    } catch {
      /* already stopped */
    }
  }
  if (swipeSrc) {
    try {
      swipeSrc.stop(c ? c.currentTime + 0.1 : 0);
    } catch {
      /* already stopped */
    }
  }
  swipeSrc = null;
  swipeGain = null;
  swipeFilt = null;

  if (didTransition) playSwish();
}
