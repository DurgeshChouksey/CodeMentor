import type { Request, Response } from "express";
import { processRepository } from "../services/repoProcessor.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { fetchRepoChunks } from "../utils/vector.js";

export const processRepo = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
	const { jobId, s3Key, userId } = req.body;

	try {
		await processRepository(jobId, s3Key, userId);
		return res.json({ status: "processing started" });
	} catch (err) {
		console.error(err);
		await prisma.repoJob.update({
			where: { id: jobId },
			data: { status: "Failed" },
		});
		return res.status(500).json({ error: "Processing failed" });
	}
};
