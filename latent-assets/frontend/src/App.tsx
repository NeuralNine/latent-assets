import { useRef, useState } from "react";
import { addImages, deleteImage, queryImages, updateTags, type ImageResult } from "./api";

type UploadItem = { file: File; preview: string; tags: string[]; tagInput: string };

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [addStatus, setAddStatus] = useState("");
  const [dragging, setDragging] = useState(false);

  const [queryText, setQueryText] = useState("");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<ImageResult | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");

  const addFiles = (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setUploads((prev) => [
      ...prev,
      ...imageFiles.map((f) => ({ file: f, preview: URL.createObjectURL(f), tags: [], tagInput: "" })),
    ]);
  };

  const updateUpload = (i: number, patch: Partial<UploadItem>) => {
    setUploads(uploads.map((u, j) => j === i ? { ...u, ...patch } : u));
  };

  const handleAddImages = async () => {
    if (uploads.length === 0) return;

    try {
      const files = uploads.map((u) => u.file);
      const tagsPerFile = uploads.map((u) => {
        const all = u.tagInput.trim() ? [...u.tags, u.tagInput.trim()] : u.tags;
        return all.join(",");
      });
      const response = await addImages(files, tagsPerFile);
      const parts = [`Added ${response.added} images`];
      if (response.skipped) parts.push(`(${response.skipped} duplicate${response.skipped > 1 ? "s" : ""} skipped)`);
      setAddStatus(parts.join(" "));
      setUploads([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setAddStatus(`Error: ${e}`);
    }
  };

  const copyImageToClipboard = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteImage(deleteTarget);
    setResults(results.filter((r) => r.path !== deleteTarget));
    setDeleteTarget(null);
  };

  const openEdit = (result: ImageResult) => {
    setEditTarget(result);
    setEditTags([...result.tags]);
    setEditTagInput("");
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    const allTags = editTagInput.trim() ? [...editTags, editTagInput.trim()] : editTags;
    await updateTags(editTarget.path, allTags);
    setResults(results.map((r) => r.path === editTarget.path ? { ...r, tags: allTags } : r));
    setEditTarget(null);
  };

  const handleQuery = async () => {
    if (!queryText.trim()) return;

    try {
      const response = await queryImages(queryText, topK);
      setResults(response.results);
    } catch (e) {
      setResults([`Error: ${e}`]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold tracking-tight">&#128269;&#65039; Latent Assets</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-300">Add Images</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={() => {
              const files = fileInputRef.current?.files;
              if (files) addFiles(files);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center gap-2 w-full py-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragging ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-sm text-zinc-400">Drop images here or <span className="text-indigo-400">browse</span></p>
          </div>
          {uploads.length > 0 && (
            <>
              <div className="flex flex-wrap gap-3">
                {uploads.map((item, i) => (
                  <div key={i} className="relative flex flex-col gap-1.5">
                    <div className="relative">
                      <img src={item.preview} className="max-w-[120px] max-h-[120px] object-contain rounded-md border border-zinc-800" />
                      <button
                        onClick={() => setUploads(uploads.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-800 border border-zinc-600 rounded-full text-zinc-400 hover:text-zinc-100 text-xs flex items-center justify-center"
                      >&times;</button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 px-1.5 py-1 bg-zinc-900 border border-zinc-700 rounded-md focus-within:border-indigo-500 max-w-[120px]">
                      {item.tags.map((tag, ti) => (
                        <span key={ti} className="px-1.5 py-0 bg-zinc-700 text-zinc-200 text-[11px] rounded">{tag}</span>
                      ))}
                      <input
                        type="text"
                        placeholder={item.tags.length === 0 ? "Tags" : ""}
                        value={item.tagInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes(",")) {
                            const tag = val.replace(",", "").trim();
                            if (tag) updateUpload(i, { tags: [...item.tags, tag], tagInput: "" });
                            else updateUpload(i, { tagInput: "" });
                          } else {
                            updateUpload(i, { tagInput: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && item.tagInput === "" && item.tags.length > 0) {
                            e.preventDefault();
                            updateUpload(i, { tagInput: item.tags[item.tags.length - 1], tags: item.tags.slice(0, -1) });
                          }
                        }}
                        className="bg-transparent outline-none placeholder-zinc-500 text-[11px] min-w-[40px] flex-1 w-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddImages}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md font-medium transition-colors"
              >
                Upload {uploads.length} image{uploads.length !== 1 ? "s" : ""}
              </button>
            </>
          )}
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
              {results.map((result, i) => (
                <div key={i} className="relative group">
                  <img
                    crossOrigin="anonymous"
                    src={`http://localhost:8000/assets/${result.path.split("/").pop()}`}
                    alt={result.path}
                    onClick={() => copyImageToClipboard(`http://localhost:8000/assets/${result.path.split("/").pop()}`)}
                    className="max-w-[160px] max-h-[160px] object-contain rounded-lg border border-zinc-800 cursor-pointer hover:border-indigo-500 transition-colors"
                  />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => openEdit(result)}
                      className="p-1 bg-zinc-900/80 rounded text-zinc-400 hover:text-indigo-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(result.path)}
                      className="p-1 bg-zinc-900/80 rounded text-zinc-400 hover:text-red-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                  {result.tag_match && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-indigo-600/80 text-[10px] rounded text-zinc-100">tagged</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {editTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setEditTarget(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 space-y-4 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Edit Tags</h3>
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-md focus-within:border-indigo-500">
              {editTags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-zinc-700 text-zinc-200 text-sm rounded flex items-center gap-1">
                  {tag}
                  <button onClick={() => setEditTags(editTags.filter((_, j) => j !== i))} className="text-zinc-400 hover:text-zinc-100">&times;</button>
                </span>
              ))}
              <input
                type="text"
                placeholder={editTags.length === 0 ? "Add tags" : ""}
                value={editTagInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(",")) {
                    const tag = val.replace(",", "").trim();
                    if (tag) setEditTags([...editTags, tag]);
                    setEditTagInput("");
                  } else {
                    setEditTagInput(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && editTagInput === "" && editTags.length > 0) {
                    e.preventDefault();
                    setEditTagInput(editTags[editTags.length - 1]);
                    setEditTags(editTags.slice(0, -1));
                  }
                }}
                className="bg-transparent outline-none placeholder-zinc-500 text-sm min-w-[60px] flex-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm transition-colors">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 space-y-4 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Delete image?</h3>
            <p className="text-sm text-zinc-400">This will permanently remove the image from the store.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
