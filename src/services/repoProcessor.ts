import fs from "fs";
import path from "path";
import { downloadRepoFromS3 } from "../lib/s3.js";
import { extractZip, getAllFiles } from "../utils/file.js";
import { chunkText } from "../utils/chunks.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { embedText } from "../utils/embeddings.js";
import { storeChunkEmbedding } from "../utils/vector.js";

export async function processRepository(
	jobId: string,
	s3Key: string,
	userId: string
) {
	const prisma = new PrismaClient();

	const tempDir = `/tmp/${Date.now()}`;
	fs.mkdirSync(tempDir);

	const zipPath = await downloadRepoFromS3(s3Key, tempDir);
	const extractDir = path.join(tempDir, "repo");
	fs.mkdirSync(extractDir);

	await extractZip(zipPath, extractDir);

	const files = getAllFiles(extractDir);

	for (const file of files) {
		const text = fs.readFileSync(file, "utf8");

		const chunks = chunkText(text);

		for (const chunk of chunks) {
			const embedding: any = await embedText(chunk);
			await storeChunkEmbedding(s3Key, chunk, embedding);
		}
	}

	// Mark job completed
	const res = await prisma.repoJob.update({
		where: { id: jobId },
		data: { status: "completed" },
	});


	fs.rmSync(tempDir, { recursive: true, force: true });

	return true;
}
