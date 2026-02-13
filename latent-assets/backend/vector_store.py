from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct, Filter, FieldCondition, MatchValue, ScrollRequest

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


def hash_exists(client: QdrantClient, file_hash: str) -> bool:
    results = client.scroll(
        collection_name=COLLECTION_NAME,
        scroll_filter=Filter(must=[FieldCondition(key="hash", match=MatchValue(value=file_hash))]),
        limit=1,
    )
    return len(results[0]) > 0


def add_points(client: QdrantClient, embeddings: list[list[float]], paths: list[str], hashes: list[str], tags: list[str] = []):
    start_id = get_next_id(client)
    points = [
        PointStruct(id=start_id + i, vector=embeddings[i], payload={"path": paths[i], "tags": tags, "hash": hashes[i]})
        for i in range(len(embeddings))
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)


def search(client: QdrantClient, query_embedding: list[float], top_k: int, query: str = "") -> list[str]:
    tag_filter = Filter(must=[FieldCondition(key="tags", match=MatchValue(value=query))])
    tag_results = client.query_points(collection_name=COLLECTION_NAME, query=query_embedding, query_filter=tag_filter, limit=top_k)
    paths = [p.payload["path"] for p in tag_results.points]

    if len(paths) < top_k:
        seen = set(paths)
        general_results = client.query_points(collection_name=COLLECTION_NAME, query=query_embedding, limit=top_k + len(seen))

        for p in general_results.points:
            if p.payload["path"] not in seen:
                paths.append(p.payload["path"])

                if len(paths) == top_k:
                    break

    return paths
