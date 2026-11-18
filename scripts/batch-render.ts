import fs from "fs";
import path from "path";

const projectsDir = process.argv[2] || "data/projects";
const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".json"));
console.log(`Found ${files.length} project(s) in ${projectsDir}:`, files);
// TODO: Loop through files and invoke build-video pipeline for each
