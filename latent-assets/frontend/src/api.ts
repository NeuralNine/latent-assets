const BASE_URL = "http://localhost:8000";

export async function addImages(files: File[], tagsPerFile: string[]): Promise<{ added: number; skipped: number }> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  for (const tags of tagsPerFile) {
    formData.append("tags", tags);
  }

  const response = await fetch(`${BASE_URL}/images`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function deleteImage(path: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (!response.ok) throw new Error(await response.text());
}

export async function updateTags(path: string, tags: string[]): Promise<void> {
  const response = await fetch(`${BASE_URL}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, tags }),
  });
  if (!response.ok) throw new Error(await response.text());
}

export type ImageResult = { path: string; tags: string[]; tag_match: boolean };

export async function queryImages(text: string, topK: number): Promise<{ results: ImageResult[] }> {
  const response = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, top_k: topK }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
