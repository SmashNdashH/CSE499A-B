"""Joins the eight scene recordings into the 60-second demo: 1920 x 1080, 30 fps, H.264 with a silent AAC track (as
CSE499A's video has an audio track). Scenes play at normal speed except the ones given a speed below; the model's
wait is fast-forwarded and its caption says so. The total is made exactly 60.0 s, holding the last frame if short."""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[2] / "checks" / "demo-video"   # T3_Website/checks/demo-video, where the scenes are
TARGET = 60.0
SPEED = {}                     # set below: the model's wait takes up the difference, between 2x and 5x
MAX_RUN_SPEED = 5.0
OUT = HERE / sys.argv[1] if len(sys.argv) > 1 else HERE / "demo.mp4"


def duration(f):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-map", "0:v", "-f", "null", "-", "-progress", "pipe:1"],
                         capture_output=True, text=True).stdout
    t = [l.split("=")[1] for l in out.splitlines() if l.startswith("out_time=")][-1]
    h, m, s = t.split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


files = sorted(HERE.glob("scene_*.webm"))
assert len(files) == 8, f"{len(files)} scene files"
durs = {f.stem.split("_", 2)[2]: duration(f) for f in files}
# The model's wait keeps at least RUN_SHOWN seconds on screen, so its caption can be read, at 2x to 5x.
RUN_SHOWN = 3.6
SPEED["run"] = min(MAX_RUN_SPEED, max(2.0, durs["run"] / RUN_SHOWN))
rest = sum(d for n, d in durs.items() if n != "run")
room = TARGET - durs["run"] / SPEED["run"]
uniform = max(1.0, rest / room)            # every other scene the same small speed-up, if one is needed at all
assert uniform <= 1.15, f"the other scenes would need x{uniform:.3f}: re-record with shorter waits"
for n in durs:
    if n != "run":
        SPEED[n] = uniform
plan, total = [], 0.0
for f in files:
    name = f.stem.split("_", 2)[2]
    d = durs[name]
    k = round(SPEED.get(name, 1.0), 4)
    plan.append((f, name, d, k, d / k))
    total += d / k
assert total <= TARGET + 0.05, f"the scenes add up to {total:.2f} s: raise a speed"
pad = max(0.0, TARGET - total)
for f, name, d, k, out in plan:
    print(f"{name:8s} {d:6.2f} s  x{k:<5}  -> {out:6.2f} s")
print(f"total {total:.2f} s, last frame held {pad:.2f} s")

inputs, chains = [], []
for i, (f, name, d, k, out) in enumerate(plan):
    inputs += ["-i", str(f)]
    chains.append(f"[{i}:v]setpts=(PTS-STARTPTS)/{k},fps=30,scale=1920:1080:flags=lanczos,setsar=1[v{i}]")
joined = "".join(f"[v{i}]" for i in range(len(plan)))
graph = ";".join(chains) + f";{joined}concat=n={len(plan)}:v=1:a=0,tpad=stop_mode=clone:stop_duration={pad + 1:.3f},format=yuv420p[v]"
cmd = ["ffmpeg", "-v", "error", "-y", *inputs, "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
       "-filter_complex", graph, "-map", "[v]", "-map", f"{len(plan)}:a",
       "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-r", "30", "-c:a", "aac", "-b:a", "96k",
       "-t", f"{TARGET}", "-movflags", "+faststart", str(OUT)]
subprocess.run(cmd, check=True)
probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,size:stream=codec_name,width,height,r_frame_rate",
                        "-of", "json", str(OUT)], capture_output=True, text=True).stdout
info = json.loads(probe)
print(f"wrote {OUT.name}: {float(info['format']['duration']):.2f} s, {int(info['format']['size']) / 1e6:.1f} MB,",
      [(s["codec_name"], s.get("width"), s.get("height"), s.get("r_frame_rate")) for s in info["streams"]])
