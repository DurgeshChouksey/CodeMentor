// src/controllers/repo.controller.ts

import type { Request, Response } from "express";
import axios from "axios";
import { BadRequestError } from "../utils/erros.js";
import { decrypt } from "../utils/crypto.js";
import { PrismaClient } from "../generated/prisma/client.js";


export const fetchRepos = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    const user = req.user;

    if (!user || !user.userId) {
        throw new BadRequestError("User not authenticated");
    }

    // fetch encrypted token from DB
    const record = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { githubToken: true }
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
        console.log(await response.text());
        throw new BadRequestError("Failed to fetch repos from GitHub");
    }

    const repos = await response.json();

    return res.json({
        success: true,
        count: repos.length,
        repos
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
        select: { githubToken: true }
    });

    if (!record?.githubToken) {
        throw new BadRequestError("GitHub token not found");
    }

    // decrypt token
    const decryptedToken = decrypt(record.githubToken);

    // correct GitHub ZIP URL
    const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;

    // download repo zip from GitHub
    const response = await axios.get(zipUrl, {
        headers: {
            Authorization: `Bearer ${decryptedToken}`,
            "User-Agent": "CodeMentorAI",
            Accept: "application/vnd.github+json",
        },
        responseType: "arraybuffer"   // IMPORTANT: zip is binary
    });

    console.log(response);

    // set correct response headers to force download
    res.set({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${repo}.zip`
    });

    return res.send(response.data);
};
