import { useRef, useState } from "react";
import { addImages, queryImages } from "./api";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTags, setUploadTags] = useState("");
  const [addStatus, setAddStatus] = useState("");

  const [queryText, setQueryText] = useState("");
  const [queryTags, setQueryTags] = useState("");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<string[]>([]);

  const handleAddImages = async () => {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;

    try {
      const response = await addImages(files, uploadTags);
      setAddStatus(`Added ${response.added} images`);
    } catch (e) {
      setAddStatus(`Error: ${e}`);
    }
  };

  const copyImageToClipboard = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  };

  const handleQuery = async () => {
    if (!queryText.trim()) return;

    try {
      const tagList = queryTags.split(",").map(t => t.trim()).filter(Boolean);
      const response = await queryImages(queryText, topK, tagList);
      setResults(response.paths);
    } catch (e) {
      setResults([`Error: ${e}`]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold tracking-tight">Latent Assets</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-300">Add Images</h2>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="text-sm file:mr-3 file:px-4 file:py-2 file:rounded-md file:border-0 file:bg-zinc-800 file:text-zinc-200 file:cursor-pointer hover:file:bg-zinc-700"
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={uploadTags}
              onChange={(e) => setUploadTags(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAddImages}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md font-medium transition-colors"
            >
              Upload
            </button>
          </div>
          {addStatus && <p className="text-sm text-zinc-400">{addStatus}</p>}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-300">Query</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Filter tags"
              value={queryTags}
              onChange={(e) => setQueryTags(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              className="w-40 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              min={1}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-16 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-center focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleQuery}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md font-medium transition-colors"
            >
              Search
            </button>
          </div>

          {results.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {results.map((path, i) => (
                <img
                  key={i}
                  src={`http://localhost:8000/assets/${path.split("/").pop()}`}
                  alt={path}
                  onClick={() => copyImageToClipboard(`http://localhost:8000/assets/${path.split("/").pop()}`)}
                  className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-zinc-800 cursor-pointer hover:border-indigo-500 transition-colors"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
