import unzipper from "unzipper";
import fs from "fs";
import path from "path";

export async function extractZip(zipPath: string, extractTo: string) {
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractTo }))
    .promise();
}

export function getAllFiles(dir: string, files: string[] = []) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    if (fs.lstatSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}
