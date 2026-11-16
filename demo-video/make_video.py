"""Render the API inference demo video from request.json / response.json.

Usage: python demo-video/make_video.py [out.mp4]   (default: exports/inference-demo.mp4)
Needs: chromium (headless screenshots) and ffmpeg. Env: CHROME=/path/to/chromium

request.json / response.json are a real call to POST /extract (val call u2027_00299:call0000,
measured latency ~2.0 s on V100, vLLM). The video is built from deterministic HTML frames
(demo.html?s=<state>), so it can be re-rendered without the server.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

here = Path(__file__).resolve().parent
out = Path(sys.argv[1] if len(sys.argv) > 1 else here.parent / "exports" / "inference-demo.mp4").resolve()
chrome = os.environ.get("CHROME") or next(
    (p for n in ("chromium", "google-chrome-stable", "google-chrome") if (p := shutil.which(n))), None)
if not shutil.which("ffmpeg"):
    sys.exit("need ffmpeg")
if not chrome:
    sys.exit("need chromium (or set CHROME=/path/to/chromium)")

request = json.loads((here / "request.json").read_text())
response = json.loads((here / "response.json").read_text())
LATENCY = 2.0
CMD = "curl -s localhost:8000/extract -H 'content-type: application/json' -d @request.json"
(here / "data.js").write_text(
    "const DATA=" + json.dumps({"request": request, "response": response, "cmd": CMD, "latency": "2,0"},
                               ensure_ascii=False) + ";")

NOTES = [
    "<b>service_state</b> · «вчера» при started_at 2026-09-20 → valid_from <b>2026-09-19</b>",
    "<b>action</b> · что клиент уже пробовал: перезапуск приложения домофона — не помогло",
    "<b>agreement</b> · «через четыре дня» → valid_from <b>2026-09-24</b>",
]
FINAL = "<b>3 из 3 фактов совпали с эталоном val</b>, даты тоже · schema 100%"

# frame = (state, seconds)
frames = [({"phase": "intro"}, 3.0)]
for n in range(0, len(CMD) + 1, 3):
    frames.append(({"phase": "type", "typed": n}, 0.07))
frames.append(({"phase": "type", "typed": len(CMD)}, 0.8))
for i in range(int(LATENCY * 10) + 1):
    frames.append(({"phase": "run", "typed": len(CMD), "elapsed": i / 10}, 0.1))
# response reveal: line count per fact (header 3 lines, 9 lines per fact, footer 2)
HEAD, PER = 3, 9
total = HEAD + PER * len(response["facts"]) + 2
shown = 0
for i in range(len(response["facts"])):
    start = shown + 1
    end = HEAD + PER * (i + 1)
    for ln in range(start, end + 1):
        frames.append(({"phase": "resp", "lines": ln, "hl": i if ln > HEAD + PER * i else None,
                        "note": NOTES[i] if ln > HEAD + PER * i else ""}, 0.08))
    frames.append(({"phase": "resp", "lines": end, "hl": i, "note": NOTES[i]}, 2.4))
    shown = end
frames.append(({"phase": "resp", "lines": total, "hl": None, "note": ""}, 0.4))
frames.append(({"phase": "end", "lines": total, "hl": None, "note": FINAL}, 4.0))

tmp = Path(tempfile.mkdtemp(prefix="demo-frames-"))
uniq = {}
for st, _ in frames:
    uniq.setdefault(json.dumps(st, sort_keys=True), len(uniq))


def shot(item):
    key, idx = item
    url = (here / "demo.html").as_uri() + "?s=" + urllib.parse.quote(key)
    subprocess.run([chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=1", "--window-size=1920,1080", "--virtual-time-budget=3000",
                    f"--screenshot={tmp / f'{idx:04d}.png'}", url], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


with ThreadPoolExecutor(max_workers=4) as ex:
    list(ex.map(shot, uniq.items()))

lst = tmp / "list.txt"
with open(lst, "w") as fh:
    for st, sec in frames:
        fh.write(f"file '{tmp / (format(uniq[json.dumps(st, sort_keys=True)], '04d') + '.png')}'\nduration {sec}\n")
    fh.write(f"file '{tmp / (format(uniq[json.dumps(frames[-1][0], sort_keys=True)], '04d') + '.png')}'\n")
out.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "20", "-movflags", "+faststart", str(out)],
               check=True)
shutil.rmtree(tmp)
print(out)
