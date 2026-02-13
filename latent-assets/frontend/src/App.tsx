import { useRef, useState } from "react";
import { addImages, queryImages } from "./api";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [addStatus, setAddStatus] = useState("");

  const [queryText, setQueryText] = useState("");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<string[]>([]);

  const handleAddImages = async () => {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;

    try {
      const allTags = tagInput.trim() ? [...tags, tagInput.trim()] : tags;
      const response = await addImages(files, allTags.join(","));
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
      const response = await queryImages(queryText, topK);
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
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus-within:border-indigo-500">
              {tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-zinc-700 text-zinc-200 text-sm rounded">
                  {tag}
                </span>
              ))}
              <input
                type="text"
                placeholder={tags.length === 0 ? "Tags" : ""}
                value={tagInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(",")) {
                    const tag = val.replace(",", "").trim();
                    if (tag) setTags([...tags, tag]);
                    setTagInput("");
                  } else {
                    setTagInput(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
                    setTagInput(tags[tags.length - 1]);
                    setTags(tags.slice(0, -1));
                  }
                }}
                className="bg-transparent outline-none placeholder-zinc-500 text-sm min-w-[60px] flex-1"
              />
            </div>
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
            <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-md overflow-hidden">
              <button onClick={() => setTopK(Math.max(1, topK - 1))} className="px-2 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">&minus;</button>
              <input
                type="number"
                min={1}
                value={topK}
                onChange={(e) => setTopK(Math.max(1, Number(e.target.value)))}
                className="w-10 py-2 bg-transparent text-center focus:outline-none"
              />
              <button onClick={() => setTopK(topK + 1)} className="px-2 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">+</button>
            </div>
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
