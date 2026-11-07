"""
Copy of support/Ridita_Integration_of_VLM__/DisasTeller/global_annotation_tool.py.
The original is unchanged.

Changes from the original (all 3 Nov 2026):
  - The labelled map is saved as reports/offline/4_anotated.png (or reports/online/),
    next to the run's six reports. The original saved it in Disaster_image/Global_image/,
    but this tool and global_img_tool.py send every picture in that folder to the model.
    So each run also saw the last run's labels, and it wrote over a file in git.
  - Font size 40 instead of 150, so the labels on the 1080-pixel-wide map don't cover
    each other. On a computer without Arial (Kaggle), Pillow's own font is used at the
    same size; the original fell back to a tiny font.
  - Roadmap T2 step 3: the local model (local_model.py) finds the places on the map, not
    Gemini. So no API key and no internet are needed.
  - The question to the model talks about one map and gives its size in pixels. The
    original asked to find the places in "the first image" and label them in "the second
    image"; on Ridita's PC the second image was the old labelled map.
  - The model gets exactly the picture that is labelled (2.jpg).
  - Qwen models often give a place as a box ("bbox_2d": [x1, y1, x2, y2]) and a "label".
    Both forms are accepted; a box's label goes at its top-left corner. A label without
    a usable position is skipped instead of stopping the whole map.
"""

import os
import json
import re
from PIL import Image, ImageDraw, ImageFont
from crewai.tools import tool
import base64
import io

from local_model import ask_with_images

def encode_image(image_path, target_size):
    with Image.open(image_path) as img:
        img_resized = img.resize(target_size)
    with io.BytesIO() as buffer:
        img_resized.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode('utf-8')

script_dir = os.path.dirname(os.path.abspath(__file__))
MAP_SIZE = (1080, 1522)  # width, height: the size the model sees and the size that is labelled
map_path = os.path.join(script_dir, "Disaster_image", "Global_image", "2.jpg")
map_image = encode_image(map_path, target_size=MAP_SIZE)


def annotate_image(image_path, annotations, output_path, size=None):
    image = Image.open(image_path)
    if size is not None:
        image = image.resize(size)
    draw = ImageDraw.Draw(image)

    # Define font
    font_size = 40  # 150 in the original: the labels covered each other
    font_color = (255, 255, 0)  # Red color
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        try:
            font = ImageFont.load_default(size=font_size)  # Pillow 10.1+
        except TypeError:
            font = ImageFont.load_default()

    # Draw annotations on the image
    drawn = 0
    for annotation in annotations:
        if not isinstance(annotation, dict):
            print(f"Skipped a label that is not a JSON object: {annotation!r}")
            continue
        position = annotation.get('position') or annotation.get('bbox_2d')
        text = annotation.get('text') or annotation.get('label') or ""
        try:
            x, y = float(position[0]), float(position[1])  # for a box, its top-left corner
        except (TypeError, ValueError, IndexError):
            print(f"Skipped a label without a usable position: {annotation!r}")
            continue
        draw.text((x, y), str(text), font=font, fill=font_color)
        drawn += 1

    # Save the annotated image
    image.save(output_path)
    return drawn


@tool
def global_map_annotation(text: str) -> str:
    """
    Process the text with the LLM.

    Args:
        text (str): The input text.

    Returns:
        str: The input from the LLM.
    """

    base_instruction = (
        "This image is a map of a place that experienced a disaster. It is "
        f"{MAP_SIZE[0]} pixels wide and {MAP_SIZE[1]} pixels high. "
        "There are different disaster grade such as G1~G10 for the different locations on this map. "
        "Firstly, please find the following locations on the map according to location names; Secondly, "
        "generate a json structure for all the relevant disaster locations with position and grading information "
        "to annotate these labels on the same map, where position is [x, y] in pixels from the top-left corner, like this: "
        '{"annotations": [{"position": [820, 380], "text": "G1"}, {"position": [660, 620], "text": "G2"}]}. '
        "The disaster locations with relevant grading are following: "
    )
    prompt = base_instruction + text
    print(prompt)

    llm_response = ask_with_images(prompt, [map_image], max_tokens=800)
    if llm_response.startswith("An error occurred"):
        return llm_response

    try:
        print(llm_response)

        json_match = re.search(r'```json\s*(.*?)\s*```', llm_response, re.DOTALL)
        if not json_match:
            json_match = re.search(r'```\s*(.*?)\s*```', llm_response, re.DOTALL)

        content_dict = None
        if json_match:
            json_str = json_match.group(1).strip()
            json_str = re.sub(r'//.*', '', json_str)
            try:
                content_dict = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"Failed to decode JSON: {e}")
        else:
            try:
                content_dict = json.loads(llm_response.strip())
            except json.JSONDecodeError as e:
                print("No JSON structure found in the content.")

        if isinstance(content_dict, list):  # a bare list of labels, as Qwen often answers
            content_dict = {"annotations": content_dict}

        if content_dict and 'annotations' in content_dict:
            print(content_dict['annotations'])
            # Saved next to this run's reports, not in Global_image/: both map tools send every
            # picture there to the model. Like the reports, the path starts from the folder you run in.
            mode = "online" if os.getenv("DISASTELLER_ONLINE") == "1" else "offline"  # as in the main script
            os.makedirs(os.path.join("reports", mode), exist_ok=True)
            output_path = os.path.join("reports", mode, "4_anotated.png")
            drawn = annotate_image(map_path, content_dict['annotations'], output_path, size=MAP_SIZE)
            print(f"Labelled map saved: {output_path} ({drawn} labels)")
        else:
            print("Could not annotate image: invalid or missing annotations structure.")

        return text

    except Exception as e:
        return f"An error occurred: {str(e)}"
