#!/usr/bin/env python3
"""Generate surreal single-subject seed images for Remix Relay cold-start.

Each seed becomes a chain-tip a brand-new player can remix. Output goes to
public/seeds/seed-N.webp. Single subject + clean background = remixes well.
"""
import json
import os
import sys
import time
import urllib.request

API = "https://chat.aiwaves.tech/aigram/api/gen-image"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "seeds")
os.makedirs(OUT, exist_ok=True)

STYLE = (
    "surreal dream art, single clear subject centered, simple uncluttered "
    "background, soft cinematic lighting, rich saturated colors, highly "
    "detailed, painterly, square composition, no text, no watermark"
)

SUBJECTS = [
    "an astronaut riding a giant glowing whale through a starry night sky",
    "a lone red door standing upright in an empty golden desert",
    "a giant fluffy cat sitting peacefully in a tiny moonlit city street",
    "a translucent jellyfish floating between trees in a sunlit forest",
    "a vintage brass diving-suit figure standing alone on the cratered moon",
    "a cozy little house with tall bird legs walking across a green meadow",
    "a single glowing koi fish swimming slowly through pink sunset clouds",
    "a small lighthouse glowing on the shell of an enormous sea turtle",
]


def gen(prompt: str) -> str:
    body = json.dumps({"prompt": prompt}).encode()
    req = urllib.request.Request(
        API, data=body, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.loads(r.read())
    url = data.get("url")
    if not url:
        raise RuntimeError(f"no url in response: {data}")
    return url


def main():
    for i, subj in enumerate(SUBJECTS):
        dest = os.path.join(OUT, f"seed-{i}.webp")
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print(f"[{i}] exists, skip")
            continue
        prompt = f"{subj}, {STYLE}"
        for attempt in range(3):
            try:
                print(f"[{i}] gen: {subj[:50]}... (try {attempt+1})", flush=True)
                url = gen(prompt)
                urllib.request.urlretrieve(url, dest)
                sz = os.path.getsize(dest)
                print(f"[{i}] saved {sz} bytes -> {dest}", flush=True)
                break
            except Exception as e:
                print(f"[{i}] FAIL: {e}", flush=True)
                time.sleep(3)
        else:
            print(f"[{i}] GAVE UP", flush=True)
    print("DONE")


if __name__ == "__main__":
    main()
