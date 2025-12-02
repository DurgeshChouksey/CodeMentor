// src/controllers/repo.controller.ts

import type { Request, Response } from "express";
import axios from "axios";
import { BadRequestError } from "../utils/erros.js";
import { decrypt } from "../utils/crypto.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { uploadToS3 } from "../utils/uploadTos3.js";
import { deleteFromS3 } from "../utils/deleteFroms3.js";
import { qstash } from "../utils/qstash.js";

export const fetchRepos = async (req: Request, res: Response) => {
	const prisma = new PrismaClient();
	const user = req.user;

	if (!user || !user.userId) {
		throw new BadRequestError("User not authenticated");
	}

	// fetch encrypted token from DB
	const record = await prisma.user.findUnique({
		where: { id: user.userId },
		select: { githubToken: true },
	});

	if (!record?.githubToken) {
		throw new BadRequestError("GitHub token not found");
	}

	// decrypt
	const decryptedAccessToken = decrypt(record.githubToken);

	// call GitHub API to fetch repos
	const response = await fetch(
		"https://api.github.com/user/repos?per_page=100&sort=updated",
		{
			headers: {
				Authorization: `Bearer ${decryptedAccessToken}`,
				"User-Agent": "CodeMentorAI",
				Accept: "application/vnd.github+json",
			},
		}
	);

	if (!response.ok) {
		throw new BadRequestError("Failed to fetch repos from GitHub");
	}

	const repos = await response.json();

	return res.json({
		success: true,
		count: repos.length,
		repos,
	});
};

export const downloadRepo = async (req: Request, res: Response) => {
	const prisma = new PrismaClient();
	const user = req.user;

	if (!user || !user.userId) {
		throw new BadRequestError("User not authenticated");
	}

	const { owner, repo, branch = "main" } = req.body;

	if (!owner || !repo) {
		throw new BadRequestError("Owner and repo are required");
	}

	// fetch encrypted token from DB
	const record = await prisma.user.findUnique({
		where: { id: user.userId },
		select: { githubToken: true },
	});

	if (!record?.githubToken) {
		throw new BadRequestError("GitHub token not found");
	}

	// decrypt token
	const decryptedToken = decrypt(record.githubToken);

	// check if the repo is already synced or up-to datae
	const commitRes = await axios.get(
		`https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
		{
			headers: {
				Authorization: `Bearer ${decryptedToken}`,
				"User-Agent": "CodeMentorAI",
				Accept: "application/vnd.github+json",
			},
		}
	);

	const latestSha = commitRes.data.sha;

	// fetching existing repo details
	const existing = await prisma.repoSync.findFirst({
		where: {
			fullName: `${owner}/${repo}`,
		},
	});

	if (existing && existing.lastCommitSha === latestSha) {

		const job = await prisma.repoJob.create({
			data: {
				userId: user.userId,
				repoId: `${owner}/${repo}`,
				status: "processing",
			},
		});


		// call qstash for the woker process
		// await qstash.publishJSON({
		// 	url: "http://codementor-backend-394002869559.asia-south1.run.app/api/v1/worker/process",
		// 	body: { s3Key: existing.s3Key, userId: user.userId },
		// });



		// call worker from here (for localhost)
		await axios.post("http://localhost:3000/api/v1/worker/process", {
			jobId: job.id,
			s3Key: existing.s3Key,
			userId: user.userId,
		});

		return res.json({
			job,
			success: true,
			message: "Repo is already synced. No changes detected.",
			s3Key: existing.s3Key,
		});
	}

	if (existing?.s3Key) {
		await deleteFromS3(existing.s3Key);
	}

	// correct GitHub ZIP URL
	const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;

	// download repo zip from GitHub
	const response = await axios.get(zipUrl, {
		headers: {
			Authorization: `Bearer ${decryptedToken}`,
			"User-Agent": "CodeMentorAI",
			Accept: "application/vnd.github+json",
		},
		responseType: "arraybuffer", // IMPORTANT: zip is binary
	});

	const zipBuffer: Buffer = Buffer.from(response.data);

	// ---------- UPLOAD TO S3 HERE ----------
	const s3Key: string = `${user.userId}/${repo}-${Date.now()}.zip`;

	const uploadResult: any = await uploadToS3(zipBuffer, s3Key);

	// --- upsert into repoSync ---
	const fullName = `${owner}/${repo}`;

	await prisma.repoSync.upsert({
		where: { fullName },
		create: {
			userId: user.userId,
			owner,
			repo,
			fullName,
			lastCommitSha: latestSha,
			s3Key: s3Key,
		},
		update: {
			lastCommitSha: latestSha,
			s3Key: s3Key,
		},
	});

	// create a job entry in the RepoJob collectoin
	const job = await prisma.repoJob.create({
		data: {
			userId: user.userId,
			repoId: `${owner}/${repo}`,
			status: "processing",
		},
	});

	const jobId = job.id;

	// call worker locally (for localhost)
	const response2 = await axios.post(
		"http://localhost:3000/api/v1/worker/process",
		{
			jobId,
			s3Key,
			userId: user.userId,
		}
	);


	// call qstash for the woker process
	// await qstash.publishJSON({
	// 	url: "https://codementor-backend-394002869559.asia-south1.run.app/api/v1/worker/process",
	// 	body: { jobId, s3Key, userId: user.userId },
	// });

	// if you want to send zip as a downloadble file
	// set correct response headers to force download
	// res.set({
	// 	"Content-Type": "application/zip",
	// 	"Content-Disposition": `attachment; filename=${repo}.zip`,
	// });

	return res.json({
		job,
		success: true,
		message: "Repo downloaded & uploaded to S3",
		uploadResult,
		s3Key
	});
};
