const TONES = {
  afraid: { rate: .96, pitch: 1.07, pause: "..." },
  shocked: { rate: .9, pitch: 1.03, pause: "—" },
  panicked: { rate: 1.1, pitch: 1.08, pause: "!" },
  angry: { rate: 1.03, pitch: .94, pause: "." },
  injured: { rate: .84, pitch: .96, pause: "..." },
  calm: { rate: .98, pitch: .98, pause: "," },
  operator: { rate: 1, pitch: .97, pause: "," }
};
let voices = [];
function refreshVoices() {
  if ("speechSynthesis" in window) voices = window.speechSynthesis.getVoices();
}
if ("speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}
export function availableProfiles() {
  const enhanced = voices.filter(voice => /natural|enhanced|neural|premium/i.test(voice.name));
  return { female: pickVoice(enhanced, /female|woman|zira|samantha/i), male: pickVoice(enhanced, /male|man|david|daniel/i), senior: pickVoice(enhanced, /older|senior/i), operator: pickVoice(enhanced, /female|woman|samantha/i) };
}
function pickVoice(preferred, terms) {
  return preferred.find(voice => terms.test(voice.name)) || voices.find(voice => voice.lang?.toLowerCase().startsWith("en")) || voices[0] || null;
}
export async function speak(text, { tone = "calm", profile = "female" } = {}) {
  const nativePlugin = window.Capacitor?.Plugins?.TextToSpeech;
  const style = TONES[tone] || TONES.calm;
  const prepared = String(text).replace(/([.!?])\s+/g, `$1${style.pause} `);
  if (nativePlugin?.speak) {
    await nativePlugin.speak({ text: prepared, rate: style.rate, pitch: style.pitch, volume: 1, lang: "en-US" });
    return;
  }
  if (!("speechSynthesis" in window)) return;
  refreshVoices();
  const utterance = new SpeechSynthesisUtterance(prepared);
  utterance.rate = style.rate;
  utterance.pitch = Math.min(1.12, Math.max(.9, style.pitch));
  const selected = availableProfiles()[profile] || pickVoice([], /./);
  if (selected) utterance.voice = selected;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
