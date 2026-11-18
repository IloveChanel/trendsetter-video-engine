import fs from "fs";
import path from "path";
import { parseFile } from "music-metadata";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { VideoProjectSchema } from "../data/schemas/videoSchema";
import { generateVoiceover, voiceoverPathFor } from "../ai/generateVoiceover";
import { syncSceneTimings, totalProjectFrames } from "../ai/syncTiming";
import { COMPOSITION_IDS } from "../config/formats";

const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (fs.existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath);
    } catch (err) {
      console.warn(`[env] Could not load .env: ${String(err)}`);
    }
  }
}

async function main() {
  loadEnv();
  const projectPath = path.resolve(process.argv[2] || "data/projects/verifyly-launch.json");
  console.log(`[build] Project: ${projectPath}`);
  const project = VideoProjectSchema.parse(JSON.parse(fs.readFileSync(projectPath, "utf-8").replace(/^\uFEFF/, "")));

  // Warn about screenshots that aren't in public/ yet (PhoneMockup shows a placeholder).
  for (const s of new Set(project.scenes.flatMap((sc) => sc.screenshots))) {
    if (!fs.existsSync(path.join(ROOT, "public", s))) {
      console.warn(`[build] Screenshot missing: public/${s} (placeholder screen will be used; run npm run sync-assets)`);
    }
  }

  // 1) One continuous free Edge TTS voiceover.
  const audioPath = path.join(ROOT, voiceoverPathFor(project.projectId));
  await generateVoiceover(project, audioPath);

  // 2) Measure it.
  const meta = await parseFile(audioPath, { duration: true });
  const durationSec = meta.format.duration;
  if (!durationSec) throw new Error(`[build] Could not measure duration of ${audioPath}`);
  console.log(`[build] Voiceover duration: ${durationSec.toFixed(3)}s`);

  // 3) Sync scene timings to the narration.
  const synced = syncSceneTimings(project, durationSec, project.fps);
  const totalFrames = totalProjectFrames(synced, synced.fps);
  console.log(`[build] Synced ${synced.scenes.length} scenes -> ${totalFrames} frames @ ${synced.fps}fps (${(totalFrames / synced.fps).toFixed(2)}s)`);
  for (const s of synced.scenes) console.log(`        ${s.id}: ${s.durationSec.toFixed(3)}s`);

  // 4) Bundle (copies public/, including the fresh MP3).
  console.log("[build] Bundling Remotion project...");
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, "src", "index.ts"),
    publicDir: path.join(ROOT, "public"),
    onProgress: (p) => (p % 25 === 0 ? console.log(`        bundle ${p}%`) : undefined),
  });

  // 5) Select + render.
  const audioTrack = `audio/${synced.projectId}.mp3`;
  const inputProps = { ...synced, audioTrack } as unknown as Record<string, unknown>;
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_IDS[synced.format], inputProps });
  console.log(`[build] Composition ${composition.id}: ${composition.width}x${composition.height}, ${composition.durationInFrames} frames`);

  const outDir = path.join(ROOT, "out");
  fs.mkdirSync(outDir, { recursive: true });
  const outputLocation = path.join(outDir, `${synced.projectId}.mp4`);
  let lastPct = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps,
    imageFormat: "jpeg",
    concurrency: 2,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== lastPct) {
        lastPct = pct;
        console.log(`        render ${pct}%`);
      }
    },
  });

  const sizeMb = fs.statSync(outputLocation).size / (1024 * 1024);
  console.log(`[build] Done: ${outputLocation} (${sizeMb.toFixed(2)} MB)`);
}

main().catch((err) => {
  console.error("[build] FAILED:", err);
  process.exit(1);
});
