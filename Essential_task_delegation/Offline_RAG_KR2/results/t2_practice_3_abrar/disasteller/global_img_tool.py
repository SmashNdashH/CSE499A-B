"""
Copy of support/Ridita_Integration_of_VLM__/DisasTeller/global_img_tool.py.
The original is unchanged.

Changes from the original (3 Nov 2026, roadmap T2 step 3):
  - The local model (local_model.py) reads the map, not Gemini. So no API key and no
    internet are needed.
  - One picture per question, as the Kaggle notebook lets vLLM take only one picture per
    request. Global_image/ holds one map (2.jpg), so this is a single question, as before.
  - The pictures are read in name order (os.listdir() differs between computers).
  - (5 Nov 2026, after Kaggle practice run 2) The tool's description tells the agent what
    the tool does (it was "Process the text with the LLM"). The question to the model is
    unchanged.
"""
import os
import base64
import io
from PIL import Image

from crewai.tools import tool
from local_model import ask_with_images

script_dir = os.path.dirname(os.path.abspath(__file__))
folder_path = os.path.join(script_dir, "Disaster_image", "Global_image")

def encode_image(image_path, target_size):
    with Image.open(image_path) as img:
        img_resized = img.resize(target_size)
    with io.BytesIO() as buffer:
        img_resized.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode('utf-8')

def encode_images_in_folder(folder_path,target_size=(256,256)):
    encoded_image = []
    files = os.listdir(folder_path)
    image_files = sorted(f for f in files if f.endswith('.jpeg') or f.endswith('.jpg') or f.endswith('.png'))
    for image_file in image_files:
        image_path = os.path.join(folder_path, image_file)
        encoded_image.append(encode_image(image_path, target_size))
    return encoded_image


encoded_images = encode_images_in_folder(folder_path, target_size=(720,720)) #encoded_images[i]

@tool
def global_img_interpreter(text: str) -> str:
    """
    Looks at the map of the whole disaster area and finds potentially dangerous areas.
    Give it what you know: the places and their damage grades, and what you want to find.

    Args:
        text (str): The places, their damage grades, and your question about the map.

    Returns:
        str: The model's reading of the map.
    """
    prompt = "Analyze the map for potential dangerous areas. " + text
    print("Global information:", prompt)

    answers = [ask_with_images(prompt, [image], max_tokens=800) for image in encoded_images]
    return "\n\n".join(answers)
