import fs from "fs";
import path from "path";
import { EdgeTTS } from "node-edge-tts";
import type { VideoProject } from "../data/schemas/videoSchema";

export const DEFAULT_EDGE_TTS_VOICE = "en-US-AndrewNeural";

/** Joins every scene's voiceover into one continuous narration script. */
export function buildNarrationScript(project: Pick<VideoProject, "scenes">): string {
  return project.scenes
    .map((s) => s.voiceover.trim())
    .filter(Boolean)
    .join(" ");
}

/** Path (relative to repo root) where the project's voiceover MP3 is written. */
export function voiceoverPathFor(projectId: string): string {
  return path.join("public", "audio", `${projectId}.mp3`);
}

/**
 * Generates ONE continuous voiceover MP3 for the whole project using the free
 * Microsoft Edge read-aloud TTS service (no API key, $0).
 * Voice comes from EDGE_TTS_VOICE (default en-US-AndrewNeural).
 */
export async function generateVoiceover(
  project: Pick<VideoProject, "projectId" | "scenes">,
  outputPath: string = voiceoverPathFor(project.projectId)
): Promise<string> {
  const script = buildNarrationScript(project);
  if (!script) throw new Error(`[TTS] Project "${project.projectId}" has no voiceover text.`);

  const voice = process.env.EDGE_TTS_VOICE?.trim() || DEFAULT_EDGE_TTS_VOICE;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  console.log(`[TTS] Edge TTS voice=${voice}, ${script.length} chars -> ${outputPath}`);
  const tts = new EdgeTTS({
    voice,
    lang: voice.split("-").slice(0, 2).join("-"),
    outputFormat: "audio-24khz-96kbitrate-mono-mp3",
    rate: process.env.EDGE_TTS_RATE || "default",
    timeout: 60_000,
  });

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await tts.ttsPromise(script, outputPath);
      const size = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
      if (size === 0) throw new Error("Edge TTS produced an empty file");
      console.log(`[TTS] Wrote ${outputPath} (${(size / 1024).toFixed(1)} KB)`);
      return outputPath;
    } catch (err) {
      lastErr = err;
      console.warn(`[TTS] Attempt ${attempt} failed: ${String(err)}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw new Error(`[TTS] Edge TTS failed after 3 attempts: ${String(lastErr)}`);
}
