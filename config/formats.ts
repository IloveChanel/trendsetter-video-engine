export const VIDEO_FORMATS = {
  desktop: { id: "desktop", label: "16:9 Desktop / YouTube", width: 1920, height: 1080, fps: 30 },
  mobile: { id: "mobile", label: "9:16 Reels / TikTok / Shorts", width: 1080, height: 1920, fps: 30 },
  square: { id: "square", label: "1:1 Social Feed", width: 1080, height: 1080, fps: 30 }
} as const;

export type FormatKey = keyof typeof VIDEO_FORMATS;

export type FormatPreset = (typeof VIDEO_FORMATS)[FormatKey];

/** Resolves a project's `format` field to its render preset (defaults to desktop). */
export function getFormatPreset(format: string | undefined): FormatPreset {
  return VIDEO_FORMATS[(format as FormatKey) in VIDEO_FORMATS ? (format as FormatKey) : "desktop"];
}

export function isVerticalFormat(format: string | undefined): boolean {
  const p = getFormatPreset(format);
  return p.height > p.width;
}

/** Remotion composition id registered in src/Root.tsx for each format. */
export const COMPOSITION_IDS: Record<FormatKey, string> = {
  desktop: "Verifyly-Desktop-16x9",
  mobile: "Verifyly-Mobile-9x16",
  square: "Verifyly-Square-1x1",
};
