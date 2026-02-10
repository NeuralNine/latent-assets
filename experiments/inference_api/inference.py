import requests

BASE_URL = "http://localhost:8000"

response = requests.post(f"{BASE_URL}/embed/text", json={"text": "Red Car"})
print(response.json()["embedding"])

with open("assets/test.jpg", "rb") as f:
    response = requests.post(f"{BASE_URL}/embed/image", files={"file": ("test.jpg", f, "image/jpeg")})

print(response.json()["embedding"])
