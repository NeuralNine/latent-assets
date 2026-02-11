import { useRef, useState } from "react";
import { addImages, queryImages } from "./api";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addStatus, setAddStatus] = useState("");

  const [queryText, setQueryText] = useState("");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<string[]>([]);

  const handleAddImages = async () => {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;

    try {
      const response = await addImages(files);
      setAddStatus(`Added ${response.added} images`);
    } catch (e) {
      setAddStatus(`Error: ${e}`);
    }
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
    <>
      <h1>Latent Assets</h1>

      <section>
        <h2>Add Images</h2>
        <input type="file" accept="image/*" multiple ref={fileInputRef} />
        <br />
        <button onClick={handleAddImages}>Upload</button>
        {addStatus && <p>{addStatus}</p>}
      </section>

      <section>
        <h2>Query</h2>
        <input
          type="text"
          placeholder="Search text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          style={{ width: "300px" }}
        />
        <input
          type="number"
          min={1}
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          style={{ width: "60px", marginLeft: "0.5rem" }}
        />
        <button onClick={handleQuery} style={{ marginLeft: "0.5rem" }}>
          Search
        </button>
        {results.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
            {results.map((path, i) => (
              <img
                key={i}
                src={`http://localhost:8000/assets/${path.split("/").pop()}`}
                alt={path}
                style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default App;
