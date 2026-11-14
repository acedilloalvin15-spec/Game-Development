let context;
function audioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  context ||= new AudioContext();
  if (context.state === "suspended") context.resume();
  return context;
}
export function playSound(name) {
  tone(name);
}
function tone(name) {
  const ctx = audioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  const freq = name === "ring" ? 740 : name === "dispatch" ? 520 : 880;
  osc.type = name === "dispatch" ? "square" : "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (name === "alert") osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + .24);
  gain.gain.setValueAtTime(.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .28);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + .3);
}
