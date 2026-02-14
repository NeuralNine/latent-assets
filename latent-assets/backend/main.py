import hashlib
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from config import ASSETS_DIRECTORY
from embedding import embed_image, embed_text
from schemas import AddImagesResponse, DeleteRequest, UpdateTagsRequest, QueryRequest, QueryResponse
from vector_store import get_client, ensure_collection, add_points, delete_by_path, hash_exists, search, update_tags


qdrant_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global qdrant_client
    qdrant_client = get_client()
    ensure_collection(qdrant_client)
    os.makedirs(ASSETS_DIRECTORY, exist_ok=True)
    yield
    qdrant_client.close()


app = FastAPI(title="Latent Assets", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
@app.get("/assets/{filename}")
def serve_asset(filename: str):
    return FileResponse(os.path.join(ASSETS_DIRECTORY, filename))


@app.post("/images", response_model=AddImagesResponse)
async def add_images(files: list[UploadFile], tags: str = Form("")):
    paths = []
    embeddings = []
    hashes = []
    skipped = 0
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    for file in files:
        data = await file.read()
        file_hash = hashlib.sha256(data).hexdigest()

        if hash_exists(qdrant_client, file_hash):
            skipped += 1
            continue

        save_path = os.path.join(ASSETS_DIRECTORY, file.filename)
        with open(save_path, "wb") as f:
            f.write(data)

        embeddings.append(embed_image(file.filename, data))
        paths.append(save_path)
        hashes.append(file_hash)

    if paths:
        add_points(qdrant_client, embeddings, paths, hashes, tag_list)

    return AddImagesResponse(added=len(paths), skipped=skipped)


@app.post("/delete")
def delete_image(request: DeleteRequest):
    delete_by_path(qdrant_client, request.path)
    file_path = os.path.join(ASSETS_DIRECTORY, os.path.basename(request.path))
    if os.path.exists(file_path):
        os.remove(file_path)
    return {"deleted": True}


@app.post("/tags")
def update_image_tags(request: UpdateTagsRequest):
    update_tags(qdrant_client, request.path, request.tags)
    return {"updated": True}


@app.post("/query", response_model=QueryResponse)
def query_images(request: QueryRequest):
    query_embedding = embed_text(request.text)
    results = search(qdrant_client, query_embedding, request.top_k, request.text)
    return QueryResponse(results=results)
