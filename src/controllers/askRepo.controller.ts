import type { Request, Response } from "express";
import { embedText } from "../utils/embeddings.js";
import { doesRepoHaveEmbeddings, searchSimilarChunks } from "../utils/vector.js";
import { askGemini } from "../utils/gemini.js";

export const askRepo = async (req: Request, res: Response) => {
  const { repoId, prompt } = req.body;

  if (!repoId || !prompt) {
    return res.status(400).json({ error: "repoId and prompt required" });
  }

  try {
    const isthere = await doesRepoHaveEmbeddings(repoId);

    // ⭐ 1. Create embedding for user prompt
    const queryEmbedding: any = await embedText(prompt);

    // ⭐ 2. Similarity search in Qdrant
    const relevantChunks = await searchSimilarChunks(repoId, queryEmbedding);


    // ⭐ 3. Combine chunks
    const context = relevantChunks.join("\n\n---\n\n");
    console.log(context)
    console.log("***** _______ ****** _______ ***** _______ ****** _______")

    // ⭐ 4. Ask Gemini
    const answer = await askGemini(prompt, context);

    return res.json({
      success: true,
      answer,
      contextUsed: relevantChunks.length,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to answer prompt" });
  }
};
