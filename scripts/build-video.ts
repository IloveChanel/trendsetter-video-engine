import fs from "fs";
import path from "path";
import { VideoProjectSchema } from "../data/schemas/videoSchema";
import { generateVoiceover } from "../ai/generateVoiceover";

async function main() {
  const projectPath = process.argv[2] || "data/projects/verifyly-launch.json";
  const raw = JSON.parse(fs.readFileSync(projectPath, "utf-8"));
  const project = VideoProjectSchema.parse(raw);

  const combinedScript = project.scenes.map((s) => s.voiceover).join(" ");
  const audioOut = path.join("public", "audio", `${project.projectId}.mp3`);

  await generateVoiceover(combinedScript, audioOut);
  console.log(`Ready to render [${project.projectId}] (${project.format}) -> Run: npx remotion render Verifyly-Desktop-16x9 out/${project.projectId}.mp4`);
}

main();
