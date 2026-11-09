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

Changes after Kaggle practice run 2 (5 Nov 2026):
  - The agent's input text is no longer added to the question about each photo. In run 2 the
    agent sent its own guess of a description, and the model repeated that guess: 4 of the
    6 photo descriptions were the same text. The question now asks only about the photo,
    and to name the place on its sticker. The agent's text is still shown in the run log.
  - The photos are described once per run. A later call (the same team again, or the
    Emergency service team) gets the same descriptions back without asking the model again.
  - The tool's description tells the agent what the tool does (it was "Process the text
    with the LLM").

Change after Kaggle practice run 3 (9 Nov 2026):
  - The input text may be left out, as the question about each photo does not use it. In
    run 3 a team called the map tool with no input ({}), CrewAI refused the call, and the
    team gave up. This tool could have failed the same way.
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

PROMPT = ("describe the disaster in detail in this image, in about 200 words. "
          "If the image has a sticker or sign with a place name, start with that place name. "
          "Describe only what this image shows.")
_descriptions = None  # filled by the first call; the photos don't change during a run


@tool
def local_img_interpreter(text: str = "") -> str:
    """
    Describes the six post-earthquake photos taken on the ground, one by one: the place
    name on each photo's sticker, and the damage to buildings, roads and trees. The photos
    are always the same, so the input text can be short, e.g. "describe the photos".

    Args:
        text (str): A short request. May be left out.

    Returns:
        str: One description per photo, each starting with the photo's file name.
    """
    global _descriptions
    print(f"Photo tool asked: {text[:300]}")
    if _descriptions is not None:
        return "(The same photos, described earlier in this run.)\n\n" + _descriptions

    answers = []
    for name, image in zip(image_names, encoded_images):
        print(f"Local information ({name}):", PROMPT)
        answers.append(f"Image {name}:\n" + ask_with_images(PROMPT, [image], max_tokens=600))
    result = "\n\n".join(answers)
    if "An error occurred" not in result:
        _descriptions = result
    return result
