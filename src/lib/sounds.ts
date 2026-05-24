export type SoundName =
  | "pick"
  | "correct"
  | "wrong"
  | "continue"
  | "complete"
  | "share"
  | "playAgain";

export type CompleteOptions = {
  score?: number;
  total?: number;
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

/** Call on first user gesture so later sounds are not blocked. */
export function unlockAudio(): void {
  getAudioContext();
}

function playNote(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  frequencyEnd?: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (frequencyEnd !== undefined && frequencyEnd > 0) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(frequencyEnd, 1),
      start + duration,
    );
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playSound(
  name: SoundName,
  options: CompleteOptions = {},
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;

  switch (name) {
    case "pick":
      playNote(ctx, 520, t, 0.07, 0.12, "sine", 380);
      break;
    case "correct":
      playNote(ctx, 523, t, 0.1, 0.11, "sine");
      playNote(ctx, 659, t + 0.08, 0.12, 0.1, "sine");
      playNote(ctx, 784, t + 0.16, 0.14, 0.09, "sine");
      break;
    case "wrong":
      playNote(ctx, 330, t, 0.14, 0.1, "triangle", 220);
      playNote(ctx, 280, t + 0.1, 0.12, 0.08, "triangle", 180);
      break;
    case "continue":
      playNote(ctx, 880, t, 0.05, 0.07, "sine", 720);
      break;
    case "complete": {
      const perfect =
        options.score !== undefined &&
        options.total !== undefined &&
        options.score === options.total;
      const notes = perfect
        ? [523, 659, 784, 988]
        : [440, 554, 659];
      notes.forEach((freq, i) => {
        playNote(ctx, freq, t + i * 0.1, 0.16, 0.09, "sine");
      });
      break;
    }
    case "share":
      playNote(ctx, 740, t, 0.06, 0.08, "sine", 880);
      break;
    case "playAgain":
      playNote(ctx, 420, t, 0.08, 0.08, "sine", 320);
      playNote(ctx, 520, t + 0.1, 0.1, 0.09, "sine", 640);
      break;
  }
}
