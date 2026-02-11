import os
import requests

from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

BASE_URL = "http://localhost:8000"

images = [os.path.join("assets", f) for f in os.listdir("assets")]

def embed_image(path: str):
    with open(path, "rb") as f:
        return requests.post(f"{BASE_URL}/embed/image", files={"file": (path.split("/")[-1], f, "image/jpeg")}).json()['embedding']

image_embeddings = [embed_image(img) for img in images]

dim = len(image_embeddings[0])

client = QdrantClient(path="./qdrant_data")

client.recreate_collection(
    collection_name='image_assets',
    vectors_config=VectorParams(size=dim, distance=Distance.COSINE)
)

client.upsert(
    collection_name='image_assets',
    points=[
        PointStruct(id=i, vector=image_embeddings[i], payload={"path": images[i]})
        for i in range(len(images))
    ],
)

print(f"Stored {len(images)} image embeddings.")

client.close()

