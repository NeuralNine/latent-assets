from pydantic import BaseModel


class AddImagesResponse(BaseModel):
    added: int


class QueryRequest(BaseModel):
    text: str
    top_k: int = 5
    tags: list[str] = []


class QueryResponse(BaseModel):
    paths: list[str]
