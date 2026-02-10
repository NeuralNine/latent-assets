import io

from PIL import Image
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File

import torch
from sentence_transformers import SentenceTransformer

device = "cuda" if torch.cuda.is_available() else "cpu"
truncate_dim = 512
model = SentenceTransformer("jinaai/jina-clip-v2", trust_remote_code=True, truncate_dim=truncate_dim).to(device)

app = FastAPI()


class TextRequest(BaseModel):
    text: str


@app.post("/embed/text")
def embed_text(req: TextRequest):
    embedding = model.encode(req.text, normalize_embeddings=True, device=device)
    return {"embedding": embedding.tolist()}


@app.post("/embed/image")
async def embed_image(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read()))
    embedding = model.encode(image, normalize_embeddings=True, device=device)
    return {"embedding": embedding.tolist()}
