import requests

from qdrant_client import QdrantClient

BASE_URL = "http://localhost:8000"

query = "Dark butterfly"

def embed_text(t: str):
    return requests.post(f"{BASE_URL}/embed/text", json={"text": t}).json()['embedding']

query_embedding = embed_text(query)

client = QdrantClient(path="./qdrant_data")

result = client.query_points(collection_name='image_assets', query=query_embedding, limit=5)
print([p.payload["path"] for p in result.points])

client.close()
