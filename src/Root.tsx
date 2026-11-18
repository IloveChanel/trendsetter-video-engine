import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { COMPOSITION_IDS, FormatKey, VIDEO_FORMATS } from "../config/formats";
import { VideoProject, VideoProjectSchema } from "../data/schemas/videoSchema";
import verifylyData from "../data/projects/verifyly-launch.json";
import { totalProjectFrames } from "../ai/syncTiming";
import { MasterVideo } from "./MasterVideo";

const defaultProject: VideoProject = VideoProjectSchema.parse(verifylyData);

/** Duration always follows the (synced) scene timings passed in as inputProps. */
const calculateMetadata: CalculateMetadataFunction<VideoProject> = ({ props }) => {
  const project = VideoProjectSchema.parse(props);
  return {
    durationInFrames: totalProjectFrames(project, project.fps),
    fps: project.fps,
    props: project,
  };
};

export const RemotionRoot: React.FC = () => (
  <>
    {(Object.keys(COMPOSITION_IDS) as FormatKey[]).map((key) => (
      <Composition
        key={key}
        id={COMPOSITION_IDS[key]}
        component={MasterVideo}
        durationInFrames={totalProjectFrames(defaultProject, defaultProject.fps)}
        fps={defaultProject.fps}
        width={VIDEO_FORMATS[key].width}
        height={VIDEO_FORMATS[key].height}
        schema={VideoProjectSchema}
        defaultProps={{ ...defaultProject, format: key }}
        calculateMetadata={calculateMetadata}
      />
    ))}
  </>
);
