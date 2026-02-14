from pydantic import BaseModel


class AddImagesResponse(BaseModel):
    added: int
    skipped: int = 0


class DeleteRequest(BaseModel):
    path: str


class UpdateTagsRequest(BaseModel):
    path: str
    tags: list[str]


class QueryRequest(BaseModel):
    text: str
    top_k: int = 5


class ImageResult(BaseModel):
    path: str
    tags: list[str]
    tag_match: bool = False


class QueryResponse(BaseModel):
    results: list[ImageResult]
