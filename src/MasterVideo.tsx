import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { VideoProject } from "../data/schemas/videoSchema";
import verifylyBrand from "../config/brands/verifyly.json";
import { SpringEntrance } from "./components/MotionPrimitives";
import { PhoneMockup } from "./components/PhoneMockup";

export const MasterVideo: React.FC<VideoProject> = ({ scenes, format, audioTrack }) => {
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width || format === "mobile";
  let currentFrame = 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: verifylyBrand.colors.background,
        color: verifylyBrand.colors.text,
        fontFamily: "Georgia, serif",
      }}
    >
      {audioTrack && <Audio src={staticFile(audioTrack)} />}

      {scenes.map((scene) => {
        const durationInFrames = Math.ceil(scene.durationSec * fps);
        const from = currentFrame;
        currentFrame += durationInFrames;
        const primaryScreenshot = scene.screenshots[0];

        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <AbsoluteFill
              style={{
                padding: isVertical ? "72px 56px" : "72px 96px",
                display: "flex",
                flexDirection: isVertical ? "column" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: isVertical ? "40px" : "64px",
              }}
            >
              {/* Left / Top Text Column with strict text wrapping */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  maxWidth: isVertical ? "100%" : "58%",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                <SpringEntrance delayFrames={0}>
                  <div
                    style={{
                      fontSize: isVertical ? 26 : 24,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      fontFamily: "sans-serif",
                      fontWeight: 700,
                      color: verifylyBrand.colors.muted,
                      marginBottom: 18,
                    }}
                  >
                    {verifylyBrand.brandName}
                  </div>
                </SpringEntrance>

                <SpringEntrance delayFrames={4}>
                  <div
                    style={{
                      fontSize: isVertical ? 64 : 68,
                      fontWeight: 700,
                      lineHeight: 1.12,
                    }}
                  >
                    {scene.headline}
                  </div>
                </SpringEntrance>

                {scene.subheadline && (
                  <SpringEntrance delayFrames={8}>
                    <div
                      style={{
                        fontSize: isVertical ? 34 : 32,
                        marginTop: 24,
                        lineHeight: 1.35,
                        fontFamily: "sans-serif",
                        color: verifylyBrand.colors.muted,
                      }}
                    >
                      {scene.subheadline}
                    </div>
                  </SpringEntrance>
                )}

                {scene.type === "outro" && (
                  <SpringEntrance delayFrames={12}>
                    <div
                      style={{
                        marginTop: 36,
                        padding: "20px 28px",
                        borderRadius: 16,
                        backgroundColor: verifylyBrand.colors.primary,
                        color: verifylyBrand.colors.background,
                        fontSize: isVertical ? 28 : 26,
                        fontFamily: "sans-serif",
                        lineHeight: 1.5,
                        display: "inline-block",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{verifylyBrand.website}</div>
                      <div>{verifylyBrand.email}</div>
                    </div>
                  </SpringEntrance>
                )}
              </div>

              {/* Right / Bottom Device Column */}
              {primaryScreenshot && (
                <SpringEntrance delayFrames={6}>
                  <PhoneMockup src={primaryScreenshot} />
                </SpringEntrance>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
