from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

from config import VECTOR_STORE_DIRECTORY, COLLECTION_NAME, EMBEDDING_DIMENSION


def get_client() -> QdrantClient:
    return QdrantClient(path=VECTOR_STORE_DIRECTORY)


def ensure_collection(client: QdrantClient):
    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in collections:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=EMBEDDING_DIMENSION, distance=Distance.COSINE),
        )


def get_next_id(client: QdrantClient) -> int:
    collection_info = client.get_collection(COLLECTION_NAME)
    return collection_info.points_count


def add_points(client: QdrantClient, embeddings: list[list[float]], paths: list[str]):
    start_id = get_next_id(client)
    points = [
        PointStruct(id=start_id + i, vector=embeddings[i], payload={"path": paths[i]})
        for i in range(len(embeddings))
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)


def search(client: QdrantClient, query_embedding: list[float], top_k: int) -> list[str]:
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=top_k,
    )
    return [point.payload["path"] for point in results.points]
