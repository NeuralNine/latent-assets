# 🔍️ latent-assets
Managing assets like images with the help of embeddings and vector stores.

## Running

**Embedding Server**
```bash
cd experiments/inference_api
uv run fastapi dev fastapi_server.py --port 9999
```

**Backend**
```bash
cd latent-assets/backend
uv run fastapi dev main.py
```

**Frontend**
```bash
cd latent-assets/frontend
npm run dev
```

Configuration is in `latent-assets/backend/config.yaml`.
