import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import ASSETS_DIRECTORY
from embedding import embed_image, embed_text
from schemas import AddImagesResponse, QueryRequest, QueryResponse
from vector_store import get_client, ensure_collection, add_points, search


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
app.mount("/assets", StaticFiles(directory=ASSETS_DIRECTORY), name="assets")


@app.post("/images", response_model=AddImagesResponse)
async def add_images(files: list[UploadFile], tags: str = Form("")):
    paths = []
    embeddings = []
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    for file in files:
        data = await file.read()

        save_path = os.path.join(ASSETS_DIRECTORY, file.filename)
        with open(save_path, "wb") as f:
            f.write(data)

        embeddings.append(embed_image(file.filename, data))
        paths.append(save_path)

    add_points(qdrant_client, embeddings, paths, tag_list)

    return AddImagesResponse(added=len(paths))


@app.post("/query", response_model=QueryResponse)
def query_images(request: QueryRequest):
    query_embedding = embed_text(request.text)
    paths = search(qdrant_client, query_embedding, request.top_k, request.tags)
    return QueryResponse(paths=paths)
