"""
local_model.py
--------------
New file (3 Nov 2026, roadmap T2 steps 1-3). The one place that says which local model
DisasTeller uses instead of Gemini:
  - crew_llm() is the LLM of the four agents;
  - ask_with_images() is what the three image tools call.
Both talk to the same local server. The server answers in OpenAI's format at an address
on this computer, so no prompt, picture or report leaves it.

Settings (environment variables, or lines in disasteller_offline/.env):
  LOCAL_LLM_PROVIDER      hosted_vllm (default): vLLM, as in the Kaggle notebook.
                          ollama: Ollama, for a small test on a laptop.
  LOCAL_LLM_MODEL         The model's name on that server. Default disasterm3-7b, the
                          name the Kaggle notebook gives the team's fine-tuned 7B.
  LOCAL_LLM_BASE_URL      Default http://localhost:8000/v1 (vLLM) or
                          http://localhost:11434/v1 (Ollama).
  LOCAL_LLM_CONTEXT       The server's limit in tokens, question and answer together.
                          Default 16384, the number the Kaggle notebook gives vLLM.
  LOCAL_LLM_TEMPERATURE   Default 0.2.
  LOCAL_LLM_SEED          Default 0, so a run can be repeated.
  LOCAL_LLM_NATIVE_TOOLS  0 (default): CrewAI writes the tool list into the prompt and
                          reads the tool calls from the model's text. This works with any
                          model and any chat template.
                          1: the server returns tool calls itself. This needs a chat
                          template that shows tools and, in vLLM, --enable-auto-tool-choice.
The address must be on this computer (localhost, 127.0.0.1 or ::1). Anything else stops
the program, so a wrong setting can't send data out.
"""

import os
import time
from urllib.parse import urlparse

from dotenv import load_dotenv
from crewai.llms.providers.openai_compatible.completion import OpenAICompatibleCompletion

script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(script_dir, ".env"))

PROVIDER = os.getenv("LOCAL_LLM_PROVIDER", "hosted_vllm")
if PROVIDER not in ("hosted_vllm", "ollama"):
    raise ValueError(f"LOCAL_LLM_PROVIDER must be hosted_vllm or ollama, not {PROVIDER!r}.")
MODEL = os.getenv("LOCAL_LLM_MODEL", "disasterm3-7b")
BASE_URL = os.getenv("LOCAL_LLM_BASE_URL") or (
    "http://localhost:11434/v1" if PROVIDER == "ollama" else "http://localhost:8000/v1")
API_KEY = os.getenv("LOCAL_LLM_API_KEY", "local")  # a local server ignores it, but the client needs one
CONTEXT = int(os.getenv("LOCAL_LLM_CONTEXT", "16384"))
TEMPERATURE = float(os.getenv("LOCAL_LLM_TEMPERATURE", "0.2"))
SEED = int(os.getenv("LOCAL_LLM_SEED", "0"))
NATIVE_TOOLS = os.getenv("LOCAL_LLM_NATIVE_TOOLS") == "1"

if urlparse(BASE_URL).hostname not in ("localhost", "127.0.0.1", "::1"):
    raise ValueError(f"LOCAL_LLM_BASE_URL must be on this computer (localhost), not {BASE_URL!r}.")

# The run log shows this line, and check_run.py counts it: a tool that got no answer
FAILED_MARK = "Local model gave no answer after 3 tries"


class LocalLLM(OpenAICompatibleCompletion):
    """CrewAI's connection to a local OpenAI-style server (vLLM or Ollama), with three changes."""

    def supports_function_calling(self) -> bool:
        # False: CrewAI uses its text format for tool calls (see LOCAL_LLM_NATIVE_TOOLS)
        return NATIVE_TOOLS and super().supports_function_calling()

    def _prepare_completion_params(self, messages, tools=None):
        # CrewAI 1.15.2 cuts the answer at its stop words ("Observation:") only after the
        # whole answer arrives. Sending them to the server makes the model stop there, instead
        # of writing a made-up tool result for minutes on a slow GPU.
        params = super()._prepare_completion_params(messages, tools)
        if self.stop_sequences and "stop" not in params:
            params["stop"] = list(self.stop_sequences)
        return params

    def get_context_window_size(self) -> int:
        # CrewAI assumes 8192 tokens for a model it doesn't know, and uses the number only to
        # shorten a conversation that got too long. Give it the server's real limit, with
        # CrewAI's usual safety margin of 85%.
        return int(CONTEXT * 0.85)


def crew_llm() -> LocalLLM:
    """The LLM of the four agents."""
    return LocalLLM(model=MODEL, provider=PROVIDER, base_url=BASE_URL, api_key=API_KEY,
                    temperature=TEMPERATURE, seed=SEED)


_client = None


def _openai_client():
    global _client
    if _client is None:
        from openai import OpenAI
        base_url = BASE_URL.rstrip("/")
        if PROVIDER == "ollama" and not base_url.endswith("/v1"):
            base_url += "/v1"
        _client = OpenAI(base_url=base_url, api_key=API_KEY, timeout=900, max_retries=0)
    return _client


def ask_with_images(prompt: str, images_b64=(), max_tokens: int = 1024) -> str:
    """Ask the local model one question, with pictures (base64 PNG). Returns its answer.

    As the old Gemini tools did, an error comes back as text that starts with
    "An error occurred", so the agent sees it instead of the whole run stopping.
    """
    content = [{"type": "text", "text": prompt}]
    content += [{"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}}
                for b64 in images_b64]
    last_error = None
    for attempt in range(1, 4):
        try:
            response = _openai_client().chat.completions.create(
                model=MODEL, messages=[{"role": "user", "content": content}],
                max_tokens=max_tokens, temperature=TEMPERATURE, seed=SEED)
            return response.choices[0].message.content or ""
        except Exception as e:  # server busy or not ready: wait and try again
            last_error = e
            print(f"Local model call failed (try {attempt} of 3): {e}")
            if attempt < 3:
                time.sleep(10)
    print(FAILED_MARK)
    return f"An error occurred: {last_error}"
