export const VIDEO_FORMATS = {
  desktop: { id: "desktop", label: "16:9 Desktop / YouTube", width: 1920, height: 1080, fps: 30 },
  mobile: { id: "mobile", label: "9:16 Reels / TikTok / Shorts", width: 1080, height: 1920, fps: 30 },
  square: { id: "square", label: "1:1 Social Feed", width: 1080, height: 1080, fps: 30 }
} as const;

export type FormatKey = keyof typeof VIDEO_FORMATS;
