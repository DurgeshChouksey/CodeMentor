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
  const allowedExtensions = [".ts", ".js", ".jsx", ".tsx", ".py", ".java", ".md"];
  const allowedFiles = ["Dockerfile", "package.json", "package-lock.json", "requirements.txt"];
  const allowedDirectories = ["src", "server", "app", "lib"];

  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      // Skip unnecessary directories
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      if (!allowedDirectories.includes(entry)) continue;

      getAllFiles(fullPath, files);
    } else {
      const ext = path.extname(entry);

      if (allowedExtensions.includes(ext) || allowedFiles.includes(entry)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}
