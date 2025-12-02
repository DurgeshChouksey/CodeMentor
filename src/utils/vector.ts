import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
	url: process.env.QDRANT_URL!,
	apiKey: process.env.QDRANT_API_KEY!, // optional if self-hosted
});

export async function initCollection() {
	try {
		await client.getCollection("codementor");
		console.log("QDRANT: Collection already exists.");

		// ALWAYS ensure index exists
		await client.createPayloadIndex("codementor", {
			field_name: "repoId",
			field_schema: { type: "keyword" },
		});

		console.log("QDRANT: Payload index for repoId ensured.");
	} catch (e) {
		console.log("QDRANT: Creating collection...");

		await client.createCollection("codementor", {
			vectors: {
				size: 384,
				distance: "Cosine",
			},
		});

		await client.createPayloadIndex("codementor", {
			field_name: "repoId",
			field_schema: { type: "keyword" },
		});

		console.log("QDRANT: Collection created.");
	}
}

export async function storeChunkEmbedding(
	repoId: string,
	chunk: string,
	embedding: number[]
) {
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

export async function fetchRepoChunks(repoId: string) {
	let allChunks: string[] = [];
	let nextPageOffset: string | null = null;

	do {
		const res = await client.scroll("codementor", {
			filter: {
				must: [
					{
						key: "repoId",
						match: { value: repoId },
					},
				],
			},
			offset: nextPageOffset, // <-- IMPORTANT
			limit: 100, // fetch more per page for speed
		});

		const points = res.points ?? [];
		points.forEach((p) => {
			if (p.payload && typeof p.payload.chunk === "string") {
				allChunks.push(p.payload.chunk);
			}
		});

		nextPageOffset = (res.next_page_offset as string) ?? null;
	} while (nextPageOffset !== null);

	return allChunks;
}


export async function searchSimilarChunks(repoId: string, queryEmbedding: number[]) {
  const result = await client.search("codementor", {
    vector: queryEmbedding,
    limit: 5,
    filter: {
      must: [
        { key: "repoId", match: { value: repoId } }
      ]
    }
  });

  return result.map((p) => p.payload?.chunk).filter(Boolean);
}


export async function doesRepoHaveEmbeddings(repoId: string) {
  const result = await client.scroll("codementor", {
    limit: 1,
    with_payload: false,
    filter: {
      must: [
        { key: "repoId", match: { value: repoId } }
      ]
    }
  });

  return (result.points?.length ?? 0) > 0;
}
