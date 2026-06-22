// Tiny procedural Web Audio SFX. No assets. Lazily creates the context on first
// user gesture so autoplay policies don't block it.

let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.12,
  slideTo?: number,
) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, a.currentTime);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
  g.gain.setValueAtTime(0.0001, a.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + dur + 0.02);
}

export const sfx = {
  tap: () => tone(520, 0.09, 'triangle', 0.08, 660),
  shuffle: () => tone(340, 0.07, 'square', 0.05, 480),
  start: () => {
    tone(300, 0.5, 'sawtooth', 0.05, 120);
  },
  reveal: () => {
    tone(440, 0.12, 'triangle', 0.1, 880);
    setTimeout(() => tone(660, 0.18, 'sine', 0.1, 990), 90);
  },
};
