import yaml
from pathlib import Path

CONFIG_PATH = Path(__file__).parent / "config.yaml"

def load_config() -> dict:
    with open(CONFIG_PATH) as f:
        return yaml.safe_load(f)

config = load_config()

ASSETS_DIRECTORY = config["assets_directory"]
VECTOR_STORE_DIRECTORY = config["vector_store_directory"]
EMBEDDING_ENDPOINT = config["embedding_endpoint"]
COLLECTION_NAME = config["collection_name"]
EMBEDDING_DIMENSION = config["embedding_dimension"]
