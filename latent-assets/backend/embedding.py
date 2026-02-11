import requests

from config import EMBEDDING_ENDPOINT


def embed_image(filename: str, data: bytes) -> list[float]:
    response = requests.post(
        f"{EMBEDDING_ENDPOINT}/embed/image",
        files={"file": (filename, data, "image/jpeg")},
    )
    response.raise_for_status()
    return response.json()["embedding"]


def embed_text(text: str) -> list[float]:
    response = requests.post(
        f"{EMBEDDING_ENDPOINT}/embed/text",
        json={"text": text},
    )
    response.raise_for_status()
    return response.json()["embedding"]
