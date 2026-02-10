import torch
from sentence_transformers import SentenceTransformer

device = 'cuda' if torch.cuda.is_available() else 'cpu'
print('Using', device)

truncate_dim = 512

model = SentenceTransformer('jinaai/jina-clip-v2', trust_remote_code=True, truncate_dim=truncate_dim).to(device)

texts = ['Red Car', 'Sunset']
images = ['assets/test.jpg', 'assets/test2.jpg', 'assets/test3.jpg']

text_embeddings = model.encode(texts, normalize_embeddings=True, device=device)
image_embeddings = model.encode(images, normalize_embeddings=True, device=device)

query = 'red sports car in parking lot with white stripe on the right'
query_embeddings = model.encode(query, prompt_name='retrieval.query', normalize_embeddings=True, device=device)

print('Query IMG1', str(query_embeddings @ image_embeddings[0].T))
print('Query IMG2', str(query_embeddings @ image_embeddings[1].T))
print('Query IMG3', str(query_embeddings @ image_embeddings[2].T))

print('IMG1 IMG2', str(image_embeddings[0] @ image_embeddings[1].T))
print('IMG1 IMG1', str(image_embeddings[0] @ image_embeddings[0].T))

print('QUERY TXT1', str(query_embeddings @ text_embeddings[0].T))
print('QUERY TXT2', str(query_embeddings @ text_embeddings[1].T))

print('TXT1 IMG1', str(text_embeddings[0] @ image_embeddings[0].T))
print('TXT2 IMG1', str(text_embeddings[1] @ image_embeddings[0].T))
print('TXT1 IMG3', str(text_embeddings[0] @ image_embeddings[2].T))
print('TXT2 IMG3', str(text_embeddings[1] @ image_embeddings[2].T))

