import React from "react";
import { Composition } from "remotion";
import { VIDEO_FORMATS } from "../config/formats";
import { VideoProjectSchema } from "../data/schemas/videoSchema";
import verifylyData from "../data/projects/verifyly-launch.json";
import { MasterVideo } from "./MasterVideo";

export const RemotionRoot: React.FC = () => {
  const parsed = VideoProjectSchema.parse(verifylyData);
  const totalSec = parsed.scenes.reduce((sum, s) => sum + s.durationSec, 0);
  const totalFrames = Math.ceil(totalSec * parsed.fps);

  return (
    <>
      <Composition
        id="Verifyly-Desktop-16x9"
        component={MasterVideo}
        durationInFrames={totalFrames}
        fps={parsed.fps}
        width={VIDEO_FORMATS.desktop.width}
        height={VIDEO_FORMATS.desktop.height}
        schema={VideoProjectSchema}
        defaultProps={parsed}
      />
      <Composition
        id="Verifyly-Mobile-9x16"
        component={MasterVideo}
        durationInFrames={totalFrames}
        fps={parsed.fps}
        width={VIDEO_FORMATS.mobile.width}
        height={VIDEO_FORMATS.mobile.height}
        schema={VideoProjectSchema}
        defaultProps={{ ...parsed, format: "mobile" }}
      />
    </>
  );
};
