import { z } from "zod";

export const SceneSchema = z.object({
  id: z.string(),
  type: z.enum(["intro", "stats", "walkthrough", "flash", "outro"]),
  headline: z.string(),
  subheadline: z.string().optional(),
  durationSec: z.number().positive(),
  voiceover: z.string(),
  screenshots: z.array(z.string()).default([]),
  stats: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  chartPoints: z.array(z.object({ year: z.string(), amount: z.number(), label: z.string() })).optional(),
  typedText: z.string().optional(),
  verdict: z.enum(["VERIFIED", "HOLD ON", "STOP"]).optional()
});

export const VideoProjectSchema = z.object({
  projectId: z.string(),
  brand: z.string(),
  format: z.enum(["desktop", "mobile", "square"]).default("desktop"),
  fps: z.number().default(30),
  audioTrack: z.string().optional(),
  scenes: z.array(SceneSchema).min(1)
});

export type VideoProject = z.infer<typeof VideoProjectSchema>;
