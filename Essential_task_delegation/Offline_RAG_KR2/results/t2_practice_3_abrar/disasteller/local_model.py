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
                          Default 32768, the number the Kaggle notebook gives vLLM.
  LOCAL_LLM_ANSWER_TOKENS The longest answer an agent may write, in tokens. Default 6144:
                          the 4,000-word reconstruction plan is about 5,300 tokens.
  LOCAL_LLM_TEMPERATURE   Default 0.2.
  LOCAL_LLM_SEED          Default 0, so a run can be repeated.
  LOCAL_LLM_NATIVE_TOOLS  0 (default): CrewAI writes the tool list into the prompt and
                          reads the tool calls from the model's text. This works with any
                          model and any chat template.
                          1: the server returns tool calls itself. This needs a chat
                          template that shows tools and, in vLLM, --enable-auto-tool-choice.
  LOCAL_LLM_CALL_LOG      Default llm_calls.jsonl, in the folder you run in: one line per
                          model call (sizes, time, the answer). Empty = no file. Since 7 Nov
                          the guideline search and the main script add a line for each
                          search and each finished report, with its time (latency).
The address must be on this computer (localhost, 127.0.0.1 or ::1). Anything else stops
the program, so a wrong setting can't send data out.

5 Nov 2026, after Kaggle practice run 2. That run stopped in the first task: CrewAI kept
adding tool results to the conversation until one message was longer than the model can
read (16,384 tokens), and vLLM refused it. Changes:
  - Before every agent call, the conversation is measured. If it is too long, older tool
    results are shortened first, and only then the longest message (keeping its start and
    end). So a message can't be over the limit any more, and the run log says when this
    happened ("Model message shortened").
  - CrewAI repeats its whole tool list (about 1,200 tokens) after every third tool use. The
    copies after the first one are replaced by a one-line reminder. In run 2 the agent
    started its work again from the beginning right after such a copy.
  - Every answer may be up to LOCAL_LLM_ANSWER_TOKENS long, and the question is cut to leave
    that much room. Before, vLLM got no answer length and computed "0 tokens left".
  - If the server still says "too long", the call is tried again with a 25% smaller limit
    (at most twice).
  - Every model call is written to llm_calls.jsonl, with vLLM's real token counts, so the
    next run shows what the model answered at each step.
"""

import json
import os
import re
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
CONTEXT = int(os.getenv("LOCAL_LLM_CONTEXT", "32768"))
ANSWER_TOKENS = int(os.getenv("LOCAL_LLM_ANSWER_TOKENS", "6144"))
TEMPERATURE = float(os.getenv("LOCAL_LLM_TEMPERATURE", "0.2"))
SEED = int(os.getenv("LOCAL_LLM_SEED", "0"))
NATIVE_TOOLS = os.getenv("LOCAL_LLM_NATIVE_TOOLS") == "1"
CALL_LOG = os.getenv("LOCAL_LLM_CALL_LOG", "llm_calls.jsonl")

if urlparse(BASE_URL).hostname not in ("localhost", "127.0.0.1", "::1"):
    raise ValueError(f"LOCAL_LLM_BASE_URL must be on this computer (localhost), not {BASE_URL!r}.")
if ANSWER_TOKENS >= CONTEXT // 2:
    raise ValueError(f"LOCAL_LLM_ANSWER_TOKENS ({ANSWER_TOKENS}) must be less than half of "
                     f"LOCAL_LLM_CONTEXT ({CONTEXT}).")

# The run log shows these lines, and check_run.py counts them
FAILED_MARK = "Local model gave no answer after 3 tries"  # a tool that got no answer
SHORTENED_MARK = "Model message shortened"                # the conversation was cut to fit

# ─── Measuring and shortening a conversation ─────────────────────────────────

IMAGE_TOKENS = 2500   # one picture as Qwen2.5-VL sees it; the 1080 x 1522 map is about 2,100
MESSAGE_TOKENS = 8    # the chat template's marks around each message
SAFETY_TOKENS = 512   # room for what the estimate can miss


def estimate_tokens(text: str) -> int:
    """A count that is a little too high on purpose, so it never lets a message through
    that the model can't read. Qwen's tokenizer makes about one token per 4-5 letters of
    English, one per digit, and about one per non-English character. Measured on 5 Nov with
    Qwen2.5-VL's real tokenizer: this estimate is 1.4 to 1.7 times the real count on the
    guideline chunks, the old reports, the practice-2 log and CrewAI's prompts."""
    digits = sum(c.isdigit() for c in text)
    non_ascii = sum(ord(c) > 127 for c in text)
    return int((len(text) - digits - non_ascii) / 3.5) + digits + non_ascii


def _text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(p.get("text", "") for p in content if isinstance(p, dict))
    return "" if content is None else str(content)


def _message_tokens(message: dict) -> int:
    content = message.get("content")
    images = 0
    if isinstance(content, list):
        images = sum(1 for p in content if isinstance(p, dict) and p.get("type") == "image_url")
    tool_calls = json.dumps(message["tool_calls"], default=str) if message.get("tool_calls") else ""
    return MESSAGE_TOKENS + estimate_tokens(_text(content) + tool_calls) + images * IMAGE_TOKENS


# CrewAI's tool list and answer format (its "tools" text); it repeats this after every
# third tool use. The first copy (in the agent's first message) is kept.
TOOL_LIST = re.compile(r"\n*You ONLY have access to the following tools.*?"
                       r"Final Answer: the final answer to the original input question\n```",
                       re.DOTALL)
TOOL_LIST_REMINDER = ("\n\n(Remember the format: Thought, then either Action and Action Input, "
                      "or Final Answer.)")
LEFT_OUT = "\n[... {} characters of this earlier message were left out, to fit the model's limit ...]\n"


def _replace_text(message: dict, new_text: str) -> dict:
    message = dict(message)  # a copy: CrewAI's own conversation is never changed
    message["content"] = new_text
    return message


def _cut_middle(text: str, chars_to_remove: int) -> str:
    keep = max(len(text) - chars_to_remove, 0)
    head, tail = text[:keep * 3 // 5], text[len(text) - (keep - keep * 3 // 5):] if keep else ""
    return head + LEFT_OUT.format(len(text) - keep) + tail


def fit_messages(messages: list, budget: int):
    """Return (messages that fit in `budget` tokens, notes on what was shortened).

    1. Copies of CrewAI's tool list after the first one become a one-line reminder.
    2. If still too long: older tool results (not the last two messages) keep only their
       first 600 and last 300 characters, oldest first.
    3. If still too long: the longest message loses part of its middle, again and again.
    """
    messages = list(messages)
    notes = []

    def total():
        return sum(_message_tokens(m) for m in messages)

    first_list = next((i for i, m in enumerate(messages)
                       if isinstance(m.get("content"), str) and TOOL_LIST.search(m["content"])), None)
    if first_list is not None:
        repeats = 0
        for i in range(first_list + 1, len(messages)):
            text = messages[i].get("content")
            if isinstance(text, str) and TOOL_LIST.search(text):
                new_text, n = TOOL_LIST.subn(TOOL_LIST_REMINDER, text)
                messages[i] = _replace_text(messages[i], new_text)
                repeats += n
        if repeats:
            notes.append(f"{repeats} repeated tool list(s) replaced by a one-line reminder")

    if total() <= budget:
        return messages, notes

    shortened = 0
    for i in range(1, len(messages) - 2):
        if total() <= budget:
            break
        m = messages[i]
        text = m.get("content")
        is_tool_result = m.get("role") == "tool" or (
            m.get("role") == "assistant" and isinstance(text, str) and "\nObservation:" in text)
        if is_tool_result and isinstance(text, str) and len(text) > 1500:
            messages[i] = _replace_text(m, text[:600] + LEFT_OUT.format(len(text) - 900) + text[-300:])
            shortened += 1
    if shortened:
        notes.append(f"{shortened} older tool result(s) shortened")

    cuts = 0
    while total() > budget and cuts < 50:
        i = max(range(len(messages)), key=lambda j: _message_tokens(messages[j]))
        text = messages[i].get("content")
        if not isinstance(text, str) or len(text) < 2000:
            break  # nothing long enough left to cut; the server will say so, and call() retries
        excess = total() - budget
        messages[i] = _replace_text(messages[i], _cut_middle(text, min(len(text) - 1000, excess * 4 + 400)))
        cuts += 1
    if cuts:
        notes.append(f"the longest message(s) cut in the middle {cuts} time(s)")
    return messages, notes


# ─── The agents' LLM ─────────────────────────────────────────────────────────

def _is_too_long_error(error: Exception) -> bool:
    text = str(error).lower()
    return "context length" in text or "maximum context" in text or "too long" in text


class LocalLLM(OpenAICompatibleCompletion):
    """CrewAI's connection to a local OpenAI-style server (vLLM or Ollama), with these changes."""

    def supports_function_calling(self) -> bool:
        # False: CrewAI uses its text format for tool calls (see LOCAL_LLM_NATIVE_TOOLS)
        return NATIVE_TOOLS and super().supports_function_calling()

    def call(self, messages, *args, **kwargs):
        # Too long after all (the estimate was too low): try again with a smaller limit
        self._budget_scale = 1.0
        for attempt in range(3):
            try:
                return super().call(messages, *args, **kwargs)
            except Exception as e:
                if attempt == 2 or not _is_too_long_error(e):
                    raise
                self._budget_scale *= 0.75
                print(f"\n{SHORTENED_MARK}: the server said the message was too long; "
                      f"trying again with a {round((1 - self._budget_scale) * 100)}% smaller limit")

    def _prepare_completion_params(self, messages, tools=None):
        budget = int((CONTEXT - ANSWER_TOKENS - SAFETY_TOKENS) * getattr(self, "_budget_scale", 1.0))
        if isinstance(messages, list):
            before = sum(_message_tokens(m) for m in messages)
            messages, notes = fit_messages(messages, budget)
            after = sum(_message_tokens(m) for m in messages)
            if before > budget:
                print(f"\n{SHORTENED_MARK} to fit {CONTEXT} tokens (estimated {before} -> {after}): "
                      + "; ".join(notes))
            self._last_fit = {"messages": len(messages), "estimated_tokens_before": before,
                              "estimated_tokens_sent": after, "budget": budget, "notes": notes}
        params = super()._prepare_completion_params(messages, tools)
        # CrewAI 1.15.2 cuts the answer at its stop words ("Observation:") only after the
        # whole answer arrives. Sending them to the server makes the model stop there, instead
        # of writing a made-up tool result for minutes on a slow GPU.
        if self.stop_sequences and "stop" not in params:
            params["stop"] = list(self.stop_sequences)
        # Room for the answer, so vLLM does not compute "0 tokens left"
        if "max_tokens" not in params and "max_completion_tokens" not in params:
            params["max_tokens"] = ANSWER_TOKENS
        return params

    def _handle_completion(self, params, *args, **kwargs):
        start = time.time()
        record = {"kind": "agent", "time": round(start, 3), **getattr(self, "_last_fit", {}),
                  "max_tokens": params.get("max_tokens"),
                  "last_message": _text(params["messages"][-1].get("content"))[-400:]
                  if params.get("messages") else ""}
        self._last_usage = None
        try:
            answer = super()._handle_completion(params, *args, **kwargs)
        except Exception as e:
            record.update(seconds=round(time.time() - start, 3), error=str(e)[:500])
            _log_call(record)
            raise
        record.update(seconds=round(time.time() - start, 3), usage=self._last_usage,
                      answer=answer if isinstance(answer, str) else repr(answer)[:2000])
        _log_call(record)
        return answer

    def _track_token_usage_internal(self, usage, *args, **kwargs):
        self._last_usage = usage  # the server's real token counts, for llm_calls.jsonl
        return super()._track_token_usage_internal(usage, *args, **kwargs)

    def get_context_window_size(self) -> int:
        # CrewAI uses this only to split a conversation for summarising after a "too long"
        # error, which the shortening above now prevents. Give it the server's real limit,
        # with CrewAI's usual safety margin of 85%.
        return int(CONTEXT * 0.85)


def crew_llm() -> LocalLLM:
    """The LLM of the four agents."""
    return LocalLLM(model=MODEL, provider=PROVIDER, base_url=BASE_URL, api_key=API_KEY,
                    temperature=TEMPERATURE, seed=SEED)


def _log_call(record: dict) -> None:
    if not CALL_LOG:
        return
    try:
        with open(CALL_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")
    except OSError as e:
        print(f"Could not write {CALL_LOG}: {e}")


# ─── The image tools' questions ──────────────────────────────────────────────

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
        start = time.time()
        try:
            response = _openai_client().chat.completions.create(
                model=MODEL, messages=[{"role": "user", "content": content}],
                max_tokens=max_tokens, temperature=TEMPERATURE, seed=SEED)
            answer = response.choices[0].message.content or ""
            usage = response.usage.model_dump() if getattr(response, "usage", None) else None
            _log_call({"kind": "image", "time": round(start, 3), "images": len(images_b64),
                       "prompt": prompt[:400], "max_tokens": max_tokens, "usage": usage,
                       "seconds": round(time.time() - start, 3), "answer": answer})
            return answer
        except Exception as e:  # server busy or not ready: wait and try again
            last_error = e
            _log_call({"kind": "image", "time": round(start, 3), "images": len(images_b64),
                       "prompt": prompt[:400], "seconds": round(time.time() - start, 3),
                       "error": str(e)[:500]})
            print(f"Local model call failed (try {attempt} of 3): {e}")
            if attempt < 3:
                time.sleep(10)
    print(FAILED_MARK)
    return f"An error occurred: {last_error}"
