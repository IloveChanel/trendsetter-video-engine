import type { VideoProject } from "../data/schemas/videoSchema";

/** Frames a scene occupies at the given fps. Matches MasterVideo's Math.ceil(durationSec * fps). */
export function sceneFrames(durationSec: number, fps: number): number {
  return Math.max(1, Math.ceil(durationSec * fps));
}

/** durationSec that maps back to exactly `frames` under Math.ceil (guards float error). */
function secondsForFrames(frames: number, fps: number): number {
  let d = frames / fps;
  if (Math.ceil(d * fps) !== frames) d = (frames - 1e-6) / fps;
  return d;
}

/** Total frames of a project, using the same per-scene rounding as the renderer. */
export function totalProjectFrames(project: Pick<VideoProject, "scenes">, fps: number): number {
  return project.scenes.reduce((sum, s) => sum + sceneFrames(s.durationSec, fps), 0);
}

/**
 * Re-times every scene so the video exactly matches the narration length.
 * Frames are distributed proportionally to each scene's voiceover text length
 * (largest-remainder method), so the per-scene frames sum EXACTLY to
 * ceil(totalDurationSec * fps). Returns an updated copy of the project.
 */
export function syncSceneTimings<P extends Pick<VideoProject, "scenes">>(
  project: P,
  totalDurationSec: number,
  fps: number
): P {
  if (!Number.isFinite(totalDurationSec) || totalDurationSec <= 0) {
    throw new Error(`[sync] Invalid audio duration: ${totalDurationSec}`);
  }
  const scenes = project.scenes;
  const totalFrames = Math.max(scenes.length, Math.ceil(totalDurationSec * fps));

  // Weight = voiceover length (fallback to headline, then 1) so silent scenes still show.
  const weights = scenes.map((s) => Math.max(1, (s.voiceover || s.headline || "").trim().length));
  const weightSum = weights.reduce((a, b) => a + b, 0);

  // Every scene gets at least 1 frame; distribute the rest proportionally.
  const distributable = totalFrames - scenes.length;
  const exact = weights.map((w) => (w / weightSum) * distributable);
  const frames = exact.map((x) => 1 + Math.floor(x));
  let remaining = totalFrames - frames.reduce((a, b) => a + b, 0);
  const order = exact
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; remaining > 0; k = (k + 1) % order.length, remaining--) {
    frames[order[k].i] += 1;
  }

  const updated = scenes.map((s, i) => ({ ...s, durationSec: secondsForFrames(frames[i], fps) }));
  const check = updated.reduce((sum, s) => sum + sceneFrames(s.durationSec, fps), 0);
  if (check !== totalFrames) {
    throw new Error(`[sync] Frame mismatch: ${check} != ${totalFrames}`);
  }
  return { ...project, scenes: updated };
}
