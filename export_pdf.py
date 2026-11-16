"""Export the deck to PDF (1 slide = 1 page, 1600x900 px = 1200x675 pt) via headless Chromium.

Usage: python export_pdf.py [out.pdf]   (default: exports/deck.pdf)
Env:   CHROME=/path/to/chromium
The print layout comes from @page / @media print in masters.css.
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
out = Path(sys.argv[1] if len(sys.argv) > 1 else root / "exports" / "deck.pdf").resolve()
chrome = os.environ.get("CHROME") or next(
    (p for n in ("chromium", "google-chrome-stable", "google-chrome", "chromium-browser") if (p := shutil.which(n))), None
)
if not chrome:
    sys.exit("Chromium not found: set CHROME=/path/to/chromium")
out.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(
    [chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
     "--no-pdf-header-footer", "--virtual-time-budget=10000",
     f"--print-to-pdf={out}", (root / "index.html").as_uri()],
    check=True, stderr=subprocess.DEVNULL,
)
print(out)
