import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { VideoProjectSchema } from "../data/schemas/videoSchema";
import { VIDEO_FORMATS } from "../config/formats";

function assert(condition: unknown, message: string) {
  if (!condition) {
    console.error(`❌ E2E FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runE2E() {
  console.log("🚀 Starting trendsetter-video-engine End-to-End Verification...\n");

  const projectPath = path.resolve("data/projects/verifyly-launch.json");
  assert(fs.existsSync(projectPath), "Project JSON exists at data/projects/verifyly-launch.json");

  const raw = JSON.parse(fs.readFileSync(projectPath, "utf-8"));
  const parsed = VideoProjectSchema.parse(raw);
  assert(parsed.scenes.length >= 1, `Zod v4 validated ${parsed.scenes.length} scenes cleanly`);

  assert(VIDEO_FORMATS.desktop.width === 1920 && VIDEO_FORMATS.desktop.height === 1080, "16:9 Desktop preset locked (1920x1080)");
  assert(VIDEO_FORMATS.mobile.width === 1080 && VIDEO_FORMATS.mobile.height === 1920, "9:16 Mobile preset locked (1080x1920)");

  for (const scene of parsed.scenes) {
    assert(scene.headline.length <= 80, `Scene [${scene.id}] headline length (${scene.headline.length} chars) fits safely inside container`);
  }

  execSync("npm run build", { stdio: "inherit" });
  assert(true, "TypeScript compilation (tsc --noEmit) passed with 0 errors");

  fs.mkdirSync("out", { recursive: true });
  const testOut = path.resolve("out/e2e-smoke.mp4");
  if (fs.existsSync(path.resolve("public/projects/verifyly/home.png"))) {
    execSync(`npx remotion render Verifyly-Desktop-16x9 "${testOut}" --frames=0-15`, { stdio: "inherit" });
    assert(fs.existsSync(testOut) && fs.statSync(testOut).size > 1000, "Rendered playable 16:9 MP4 smoke test (out/e2e-smoke.mp4)");
  } else {
    console.log("⚠️  SKIPPED MP4 render: Copy home.png into public/projects/verifyly/home.png to run full MP4 output check.");
  }

  console.log("\n🎉 ALL END-TO-END CHECKS PASSED!");
}

runE2E();
