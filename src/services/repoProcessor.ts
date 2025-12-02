import fs from "fs";
import path from "path";
import { downloadRepoFromS3 } from "../lib/s3.js";
import { extractZip, getAllFiles } from "../utils/file.js";
import { chunkText } from "../utils/chunks.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { embedText } from "../utils/embeddings.js";
import { doesRepoHaveEmbeddings, storeChunkEmbedding } from "../utils/vector.js";
import isUtf8 from "is-utf8";

// Allowed text/code extensions
const ALLOWED_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx",
  ".py", ".java", ".go",
  ".md", ".txt",
  ".json", ".html", ".css",
  ".c", ".cpp", ".h"
];

function isProbablyTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  if(ext == '.md') {
	console.log("we got md file")
  }
  if (ALLOWED_EXTENSIONS.includes(ext)) return true;

  const buffer = fs.readFileSync(filePath);
  return isUtf8(buffer);
}

export async function processRepository(
  jobId: string,
  s3Key: string,
  userId: string
) {
  const prisma = new PrismaClient();

  // ⭐ 1. CHECK IF WE ALREADY EMBEDDED THIS REPO
  const alreadyEmbedded = await doesRepoHaveEmbeddings(s3Key);

  if (alreadyEmbedded) {
    console.log("Embeddings already exist — skipping processing.");

    await prisma.repoJob.update({
      where: { id: jobId },
      data: { status: "completed" },
    });

    return true;
  }

  // ⭐ 2. Standard embedding flow
  const tempDir = `/tmp/${Date.now()}`;
  fs.mkdirSync(tempDir);

  const zipPath = await downloadRepoFromS3(s3Key, tempDir);

  const extractDir = path.join(tempDir, "repo");
  fs.mkdirSync(extractDir);

  await extractZip(zipPath, extractDir);

  const files = getAllFiles(extractDir);

//   console.log(files);

  const count = 0;

  for (const file of files) {

    // Skip folders
    if (!fs.statSync(file).isFile()) continue;

    // Skip package-lock.json
    if (path.basename(file) === "package-lock.json") {
      console.log("⏭️ Skipping package-lock.json:", file);
      continue;
    }

    // Skip binary/non-text files
    if (!isProbablyTextFile(file)) {
      console.log("⏭️ Skipping binary/non-text file:", file);
      continue;
    }

    // Read file as UTF-8
    const buffer = fs.readFileSync(file);
    const text = buffer.toString("utf8");

    // Chunk it
    const chunks = chunkText(text);

    // console.log("📦 Chunks for:", file);
    // console.log(chunks);

    // Store embeddings
    for (const chunk of chunks) {
      const embedding:any = await embedText(chunk);
      await storeChunkEmbedding(s3Key, chunk, embedding);
    }
  }

  // Update job status
  const res = await prisma.repoJob.update({
    where: { id: jobId },
    data: { status: "completed" },
  });

  // Cleanup temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });

  return true;
}
