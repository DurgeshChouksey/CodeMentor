import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

export async function extractZip(zipPath: string, extractTo: string) {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractTo, true);
}

export function getAllFiles(dir: string, files: string[] = []) {
  const entries = fs.readdirSync(dir);
  console.log(entries);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}
