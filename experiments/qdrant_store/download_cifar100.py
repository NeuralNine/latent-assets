from pathlib import Path
from torchvision.datasets import CIFAR100

output_dir = Path("assets")
output_dir.mkdir(exist_ok=True)

cifar100 = CIFAR100(".", train=True, download=True)

for i in range(1000):
    image, _ = cifar100[i]
    image.save(output_dir / f"image{i}.png")

