#!/usr/bin/env bash
# Generate surreal single-subject seed images for Remix Relay cold-start via curl.
set -u
API="https://chat.aiwaves.tech/aigram/api/gen-image"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/seeds"
mkdir -p "$OUT"

STYLE="surreal dream art, single clear subject centered, simple uncluttered background, soft cinematic lighting, rich saturated colors, highly detailed, painterly, square composition, no text, no watermark"

SUBJECTS=(
  "an astronaut riding a giant glowing whale through a starry night sky"
  "a lone red door standing upright in an empty golden desert"
  "a giant fluffy cat sitting peacefully in a tiny moonlit city street"
  "a translucent jellyfish floating between trees in a sunlit forest"
  "a vintage brass diving-suit figure standing alone on the cratered moon"
  "a cozy little house with tall bird legs walking across a green meadow"
  "a single glowing koi fish swimming slowly through pink sunset clouds"
  "a small lighthouse glowing on the shell of an enormous sea turtle"
)

i=0
for subj in "${SUBJECTS[@]}"; do
  dest="$OUT/seed-$i.webp"
  if [ -s "$dest" ]; then echo "[$i] exists, skip"; i=$((i+1)); continue; fi
  prompt="$subj, $STYLE"
  body=$(python3 -c 'import json,sys;print(json.dumps({"prompt":sys.argv[1]}))' "$prompt")
  for try in 1 2 3; do
    echo "[$i] gen (try $try): ${subj:0:48}..."
    url=$(curl -s --max-time 300 -X POST "$API" -H "Content-Type: application/json" -d "$body" \
          | python3 -c 'import json,sys;print(json.load(sys.stdin).get("url",""))' 2>/dev/null)
    if [ -n "$url" ]; then
      curl -s --max-time 120 -o "$dest" "$url"
      if [ -s "$dest" ]; then echo "[$i] saved $(wc -c <"$dest") bytes"; break; fi
    fi
    echo "[$i] fail, retry"; sleep 3
  done
  i=$((i+1))
done
echo "DONE"
