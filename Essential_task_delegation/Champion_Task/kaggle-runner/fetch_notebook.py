"""Saves the executed copy of one Kaggle notebook version, every cell with its output.

`kaggle kernels output` doesn't list it, but Kaggle keeps it as __notebook__.ipynb in the version's output, and its
DownloadKernelOutput call (the one Kaggle Hub uses) hands it out. runner.ps1 runs this with the Python that kaggle.exe
uses and the account's token in KAGGLE_API_TOKEN.

Usage: fetch_notebook.py <owner> <notebook slug> <out.ipynb> [version number; 0 or none = the latest]
"""
import json
import sys

import requests
from kaggle.api.kaggle_api_extended import KaggleApi
from kagglesdk.kernels.types.kernels_api_service import ApiDownloadKernelOutputRequest

owner, slug, out = sys.argv[1:4]
version = int(sys.argv[4]) if len(sys.argv) > 4 else 0
api = KaggleApi()
api.authenticate()
request = ApiDownloadKernelOutputRequest()
request.owner_slug, request.kernel_slug, request.file_path = owner, slug, "__notebook__.ipynb"
if version:
    request.version_number = version
with api.build_kaggle_client() as kaggle:
    url = kaggle.kernels.kernels_api_client.download_kernel_output(request).url
reply = requests.get(url, timeout=300)
reply.raise_for_status()
cells = json.loads(reply.content)["cells"]          # a notebook, or this stops here and nothing is written
with open(out, "wb") as f:
    f.write(reply.content)
print(f"{out}: {len(cells)} cells, {sum(1 for c in cells if c.get('outputs'))} with outputs")
