export function formatDuration(seconds = 0) {
  const value = Math.max(Math.round(Number(seconds) || 0), 0);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = value % 60;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function courseTone(name = "") {
  if (name.includes("C++")) return ["#173c9a", "#3158e8"];
  if (name.includes("Java")) return ["#8e351c", "#d4692e"];
  if (name.includes("DevHub")) return ["#07506b", "#0fa7b6"];
  if (name.includes("Live")) return ["#8f1f4a", "#e65075"];
  if (name.includes("Aptitude")) return ["#087b5b", "#35bd82"];
  if (name.includes("Plus")) return ["#176449", "#26a96c"];
  return ["#4c2aac", "#7c4dff"];
}
