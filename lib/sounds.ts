let lastPlayed = 0;

export default function playSound(type: "click" | "win" | "lose") {
  const now = Date.now();
  if (now - lastPlayed < 300) return; // 300ms debounce
  lastPlayed = now;

  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.5;
  audio.play().catch(() => {});
}
