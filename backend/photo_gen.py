import requests
from dotenv import load_dotenv
import os
import base64

from PIL import Image

# invoke_url = "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium"
load_dotenv(override=True)
key = os.getenv('Nvidia')

# headers = {
#     "Authorization": f"Bearer {key}",
#     "Accept": "application/json",
# }

# payload = {
#     "prompt": "a sunset time with scenery",
#     "cfg_scale": 5,
#     "aspect_ratio": "16:9",
#     "seed": 0,
#     "steps": 50,
#     "negative_prompt": ""
# }

# response = requests.post(invoke_url, headers=headers, json=payload)
# response.raise_for_status()

# response_body = response.json()


import requests

invoke_url = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell"

headers = {
    "Authorization": f"Bearer {key}",
    "Accept": "application/json",
}

payload = {
    "prompt": "car driving alongside ocean",
    "width": 1024,
    "height": 1024,
    "seed": 0,
    "steps": 4
}

response = requests.post(invoke_url, headers=headers, json=payload)

response.raise_for_status()
response_body = response.json()
print(response_body.keys)


# # ✅ Extract the base64 string from the correct field
# image_base64 = response_body  # or response_body["artifacts"][0]["base64"]

# # Strip the data URI prefix if present (e.g., "data:image/png;base64,...")
# # if "," in image_base64:
# #     image_base64 = image_base64.split(",")[1]

# image_bytes = base64.b64decode(image_base64)

# with open("output.png", "wb") as f:
#     f.write(image_bytes)





img = Image.open('output.png')
img.show()

