const BASE_URL = "http://localhost:8000";

export async function addImages(files: FileList): Promise<{ added: number }> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const response = await fetch(`${BASE_URL}/images`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function queryImages(text: string, topK: number): Promise<{ paths: string[] }> {
  const response = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, top_k: topK }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
