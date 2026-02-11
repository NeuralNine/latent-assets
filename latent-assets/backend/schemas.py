from pydantic import BaseModel


class AddImagesResponse(BaseModel):
    added: int


class QueryRequest(BaseModel):
    text: str
    top_k: int = 5


class QueryResponse(BaseModel):
    paths: list[str]
