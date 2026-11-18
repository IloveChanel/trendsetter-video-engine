import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { VideoProject } from "../data/schemas/videoSchema";
import verifylyBrand from "../config/brands/verifyly.json";

export const MasterVideo: React.FC<VideoProject> = ({ scenes }) => {
  const { fps } = useVideoConfig();
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: verifylyBrand.colors.background, color: verifylyBrand.colors.text, fontFamily: "Georgia, serif" }}>
      {scenes.map((scene) => {
        const durationInFrames = Math.ceil(scene.durationSec * fps);
        const from = currentFrame;
        currentFrame += durationInFrames;

        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <AbsoluteFill style={{ padding: "80px", justifyContent: "center" }}>
              <div style={{ fontSize: 28, letterSpacing: 2, textTransform: "uppercase", color: verifylyBrand.colors.muted, marginBottom: 16 }}>
                {verifylyBrand.brandName}
              </div>
              <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, maxWidth: "75%" }}>
                {scene.headline}
              </div>
              {scene.subheadline && (
                <div style={{ fontSize: 36, marginTop: 28, color: verifylyBrand.colors.muted }}>
                  {scene.subheadline}
                </div>
              )}
              {scene.type === "outro" && (
                <div style={{ marginTop: 48, fontSize: 28, fontFamily: "sans-serif", lineHeight: 1.6 }}>
                  <div>{verifylyBrand.website}</div>
                  <div>{verifylyBrand.email}</div>
                </div>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
