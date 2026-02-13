from pydantic import BaseModel


class AddImagesResponse(BaseModel):
    added: int
    skipped: int = 0


class QueryRequest(BaseModel):
    text: str
    top_k: int = 5


class QueryResponse(BaseModel):
    paths: list[str]
