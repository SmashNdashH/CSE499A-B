"""
Copy of support/Ridita_Integration_of_VLM__/DisasTeller/local_img_tool.py.
The original is unchanged.

Changes from the original (3 Nov 2026, roadmap T2 step 3):
  - The local model (local_model.py) describes the photos, not Gemini. So no API key and
    no internet are needed.
  - One photo per question, and each answer starts with the photo's file name. A 7B model
    handles one picture at a time better, and the Kaggle notebook lets vLLM take only one
    picture per request (the original sent all six together).
  - The photos are read in name order. os.listdir() gives a different order on different
    computers.
"""
import os
import base64
import io
from PIL import Image

from crewai.tools import tool
from local_model import ask_with_images

script_dir = os.path.dirname(os.path.abspath(__file__))
folder_path = os.path.join(script_dir, "Disaster_image", "Local_image")

def encode_image(image_path, target_size):
    with Image.open(image_path) as img:
        img_resized = img.resize(target_size)
    with io.BytesIO() as buffer:
        img_resized.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode('utf-8')

def image_names_in_folder(folder_path):
    files = os.listdir(folder_path)
    return sorted(f for f in files if f.endswith('.jpeg') or f.endswith('.jpg') or f.endswith('.png'))

def encode_images_in_folder(folder_path,target_size=(256,256)):
    encoded_image = []
    for image_file in image_names_in_folder(folder_path):
        image_path = os.path.join(folder_path, image_file)
        encoded_image.append(encode_image(image_path, target_size))
    return encoded_image


image_names = image_names_in_folder(folder_path)
encoded_images = encode_images_in_folder(folder_path, target_size=(720,720)) #encoded_images[i]

@tool
def local_img_interpreter(text: str) -> str:
    """
    Process the text with the LLM.

    Args:
        text (str): The input text.

    Returns:
        str: The input from the LLM.
    """

    prompt = "describe the disaster in detail in this image, in about 200 words. " + text
    answers = []
    for name, image in zip(image_names, encoded_images):
        print(f"Local information ({name}):", prompt)
        answers.append(f"Image {name}:\n" + ask_with_images(prompt, [image], max_tokens=600))
    return "\n\n".join(answers)
