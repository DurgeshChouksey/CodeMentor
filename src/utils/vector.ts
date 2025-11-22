import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!, // optional if self-hosted
});

export async function initCollection() {
  try {
    // Check if collection exists
    await client.getCollection("codementor");
    console.log("QDRANT: Collection already exists.");
  } catch (e) {
    console.log("QDRANT: Creating collection...");

    await client.createCollection("codementor", {
      vectors: {
        size: 384,
        distance: "Cosine",
      },
    });

    console.log("QDRANT: Collection created.");
  }
}

export async function storeChunkEmbedding(repoId: string, chunk: string, embedding: number[]) {
  await client.upsert("codementor", {
    points: [
      {
        id: crypto.randomUUID(),
        vector: embedding,
        payload: { repoId, chunk },
      },
    ],
  });
}
