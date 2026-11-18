// PLACEHOLDER: Reads generated MP3 duration and updates scene durationSec values
export function syncSceneTimings<T extends { durationSec: number }>(scenes: T[], audioDurationSec?: number): T[] {
  if (!audioDurationSec) return scenes;
  const totalCurrent = scenes.reduce((acc, s) => acc + s.durationSec, 0);
  const ratio = audioDurationSec / totalCurrent;
  return scenes.map((s) => ({ ...s, durationSec: Number((s.durationSec * ratio).toFixed(2)) }));
}
