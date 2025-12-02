export function chunkText(str: string, size = 800) {
  // Remove trailing empty lines so we don't create an empty last chunk
  const clean = str.trimEnd();

  const chunks = [];
  for (let i = 0; i < clean.length; i += size) {
    const slice = clean.slice(i, i + size);

    // Always keep README chunks, prevent accidental dropping
    chunks.push(slice);
  }

  return chunks;
}
