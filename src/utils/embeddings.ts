import { pipeline } from "@xenova/transformers";

// Embedder instance cached across function calls
let embedder: any = null;

// Load model ONCE per Cloud Run instance
async function loadModel() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"   // FREE embedding model
    );
  }
  return embedder;
}

export async function embedText(text: string) {
  const model = await loadModel();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  // Convert typed array → normal array
  return Array.from(output.data);
}
