#!/usr/bin/env python3
"""
Generate PNG icons for Visit Vantage using OpenAI's gpt-image-1 model.

Usage:
    python3 scripts/generate_icons.py                      # generate all 236 icons
    python3 scripts/generate_icons.py --dry-run             # preview prompts only
    python3 scripts/generate_icons.py --only pirateShip     # generate one icon (all variants)
    python3 scripts/generate_icons.py --batch 1             # generate one batch only
    python3 scripts/generate_icons.py --force               # overwrite existing files

Requires:
    pip3 install openai Pillow
    export OPENAI_API_KEY="sk-..."
"""

import argparse
import base64
import json
import os
import sys
import time
from io import BytesIO
from pathlib import Path

try:
    from openai import OpenAI, RateLimitError, APIError
except ImportError:
    print("Error: openai package not installed. Run: pip3 install openai")
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow package not installed. Run: pip3 install Pillow")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Prompt builders
# ---------------------------------------------------------------------------

GLOBAL_PREAMBLE = (
    "Create a clean vector-style icon illustration. Flat or semi-flat design, crisp edges, "
    "NOT photorealistic. The icon should be centered on a TRANSPARENT background with ~8px "
    "padding on all sides. Medium line weight (2-3px equivalent). PNG with alpha channel transparency."
)

INACTIVE_RULES = {
    "light": (
        "This is the INACTIVE / undiscovered version. "
        "Simplified silhouette/outline only — show the most recognizable shape, stripped of detail. "
        "Muted, ghostly, ~40% apparent opacity feel. "
        "Use ONLY {color} ({color_name}) as the single monochrome color — no other colors. "
        "Thin strokes, minimal fills, no shading or gradients. "
        "Stroke/outline color: #57534e (warm dark gray). "
        "Think of it as a faded rubber stamp or watermark."
    ),
    "dark": (
        "This is the INACTIVE / undiscovered version for DARK MODE. "
        "Simplified silhouette/outline only — show the most recognizable shape, stripped of detail. "
        "Muted, ghostly, ~40% apparent opacity feel. "
        "Use ONLY {color} ({color_name}) as the single monochrome color, brightened ~15-20% for dark background visibility. "
        "Thin strokes, minimal fills, no shading or gradients. "
        "Stroke/outline color: #d4d4d8 (light gray). Fill tones: #a1a1aa. "
        "Think of it as a faded rubber stamp or watermark, glowing subtly on a dark background."
    ),
}

ACTIVE_RULES = {
    "light": (
        "This is the ACTIVE / discovered version — full vivid color, 100% opacity. "
        "Detailed illustration with textures, shading, secondary elements, and environmental context. "
        "Rich illustration with depth — shadows, highlights, fine details. "
        "Stroke/outline color: #57534e (warm dark gray). "
        "The icon is 'coming alive' — dramatic and vibrant."
    ),
    "dark": (
        "This is the ACTIVE / discovered version for DARK MODE — full vivid color, 100% opacity. "
        "Detailed illustration with textures, shading, secondary elements, and environmental context. "
        "Rich illustration with depth. Use lighter highlights instead of dark shadows. "
        "Stroke/outline color: #d4d4d8 (light gray). Fill tones slightly brighter for dark background visibility. "
        "Cool-toned, luminous, slightly ethereal feel. The icon is 'coming alive'."
    ),
}

BEST_OF_BAY_RULES = {
    "light": (
        "This is a BEST OF THE BAY premium icon — elegant gold silhouette style. "
        "Like a gold foil stamp or luxury award badge. "
        "Primary color: #FBBF24 (gold). Use gold tones only — no other colors. "
        "Dark outlines (#57534e) for definition. Medium detail — recognizable and distinctive, but stylized. "
        "Transparent background."
    ),
    "dark": (
        "This is a BEST OF THE BAY premium icon for DARK MODE — elegant gold silhouette style. "
        "Like a gold foil stamp or luxury award badge, glowing on a dark background. "
        "Primary color: #D4A04A (warmer, brighter gold for dark backgrounds). Use gold tones only — no other colors. "
        "Light outlines (#d4d4d8) for definition. Medium detail — recognizable and distinctive, but stylized. "
        "Transparent background."
    ),
}

COLOR_NAMES = {
    "marine": "teal/cyan",
    "birds": "sky blue",
    "nature": "green",
    "culture": "orange",
    "heritage": "purple",
    "sports": "red/pink",
    "folklore": "light purple",
    "landmarks": "gold/yellow",
}


def build_easter_egg_prompt(icon, variant, category_colors):
    """Build the full prompt for an Easter Egg icon variant."""
    state, theme = variant.split("_")  # e.g. "inactive_light" -> ("inactive", "light")
    category = icon["category"]
    color = category_colors[category]
    color_name = COLOR_NAMES[category]

    parts = [GLOBAL_PREAMBLE, ""]

    if state == "inactive":
        rules = INACTIVE_RULES[theme].format(color=color, color_name=color_name)
        parts.append(rules)
        parts.append("")
        parts.append(f"Icon subject: {icon['description']}")
        parts.append(f"What to show: {icon['inactive_prompt']}")
    else:
        parts.append(ACTIVE_RULES[theme])
        parts.append("")
        parts.append(f"Icon subject: {icon['description']}")
        parts.append(f"What to show: {icon['active_prompt']}")

    parts.append("")
    parts.append("IMPORTANT: Transparent PNG background. No solid background color. The icon floats on transparency.")

    return "\n".join(parts)


def build_best_of_bay_prompt(icon, theme):
    """Build the full prompt for a Best of Bay icon variant."""
    parts = [GLOBAL_PREAMBLE, ""]
    parts.append(BEST_OF_BAY_RULES[theme])
    parts.append("")
    parts.append(f"Destination: {icon['destination']}")
    parts.append(f"What to show: {icon['prompt']}")
    parts.append("")
    parts.append("IMPORTANT: Transparent PNG background. No solid background color. The icon floats on transparency.")

    return "\n".join(parts)


def get_all_tasks(manifest):
    """Return list of (svgKey, filename_suffix, prompt, batch) tuples for all 236 images."""
    tasks = []
    category_colors = manifest["category_colors"]

    for icon in manifest["easter_eggs"]:
        for variant in ["inactive_light", "inactive_dark", "active_light", "active_dark"]:
            prompt = build_easter_egg_prompt(icon, variant, category_colors)
            tasks.append((icon["svgKey"], variant, prompt, icon["batch"]))

    for icon in manifest["best_of_bay"]:
        for theme in ["light", "dark"]:
            prompt = build_best_of_bay_prompt(icon, theme)
            tasks.append((icon["svgKey"], theme, prompt, icon["batch"]))

    return tasks


# ---------------------------------------------------------------------------
# API + image processing
# ---------------------------------------------------------------------------

def generate_and_save(client, prompt, output_path, size="1024x1024"):
    """Call gpt-image-1 API and save the downscaled 128x128 PNG."""
    result = client.images.generate(
        model="gpt-image-1",
        prompt=prompt,
        n=1,
        size=size,
        quality="low",
    )

    image_bytes = base64.b64decode(result.data[0].b64_json)

    img = Image.open(BytesIO(image_bytes))
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    img = img.resize((128, 128), Image.LANCZOS)
    img.save(output_path, "PNG")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Generate Visit Vantage PNG icons via OpenAI gpt-image-1")
    parser.add_argument("--manifest", default=None, help="Path to icon_manifest.json")
    parser.add_argument("--output-dir", default=None, help="Output directory (default: public/icons)")
    parser.add_argument("--batch", type=int, default=None, help="Only generate icons from this batch number")
    parser.add_argument("--only", default=None, help="Only generate variants for this svgKey")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts without calling API")
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds between API calls (default: 2)")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    # Resolve paths relative to project root
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent

    manifest_path = Path(args.manifest) if args.manifest else script_dir / "icon_manifest.json"
    output_dir = Path(args.output_dir) if args.output_dir else project_root / "public" / "icons"

    # Load manifest
    if not manifest_path.exists():
        print(f"Error: Manifest not found at {manifest_path}")
        sys.exit(1)

    with open(manifest_path) as f:
        manifest = json.load(f)

    # Build task list
    all_tasks = get_all_tasks(manifest)

    # Filter by batch or svgKey
    if args.batch is not None:
        all_tasks = [t for t in all_tasks if t[3] == args.batch]
    if args.only:
        all_tasks = [t for t in all_tasks if t[0] == args.only]

    if not all_tasks:
        print("No tasks match your filters. Check --batch or --only values.")
        sys.exit(1)

    print(f"Total tasks: {len(all_tasks)} icon variants")
    print(f"Output dir:  {output_dir}")
    print()

    # Dry run — just print prompts
    if args.dry_run:
        for svg_key, suffix, prompt, batch in all_tasks:
            filename = f"{svg_key}_{suffix}.png"
            print(f"{'='*60}")
            print(f"FILE: {filename}  (batch {batch})")
            print(f"{'='*60}")
            print(prompt)
            print()
        print(f"Dry run complete. {len(all_tasks)} prompts printed.")
        return

    # Check API key
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set.")
        print("Run: export OPENAI_API_KEY=\"sk-...\"")
        sys.exit(1)

    client = OpenAI()

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate
    completed = 0
    skipped = 0
    failed = 0
    failed_list = []
    total = len(all_tasks)

    for i, (svg_key, suffix, prompt, batch) in enumerate(all_tasks, 1):
        filename = f"{svg_key}_{suffix}.png"
        output_path = output_dir / filename

        # Skip existing unless --force
        if output_path.exists() and not args.force:
            print(f"[{i}/{total}] SKIP {filename} (already exists)")
            skipped += 1
            continue

        # Try up to 3 times on rate limit
        success = False
        for attempt in range(3):
            try:
                start = time.time()
                print(f"[{i}/{total}] Generating {filename}...", end=" ", flush=True)
                generate_and_save(client, prompt, output_path)
                elapsed = time.time() - start
                print(f"OK ({elapsed:.1f}s)")
                completed += 1
                success = True
                break
            except RateLimitError:
                wait = 60 * (attempt + 1)
                print(f"RATE LIMITED — waiting {wait}s (attempt {attempt + 1}/3)")
                time.sleep(wait)
            except APIError as e:
                print(f"API ERROR: {e}")
                break
            except Exception as e:
                print(f"ERROR: {e}")
                break

        if not success:
            failed += 1
            failed_list.append(filename)

        # Delay between calls (skip if this was skipped or last item)
        if success and i < total:
            time.sleep(args.delay)

    # Summary
    print()
    print(f"{'='*40}")
    print(f"Done! {completed} generated, {skipped} skipped, {failed} failed.")
    print(f"Output: {output_dir}")

    if failed_list:
        failed_path = output_dir / "failed_icons.txt"
        with open(failed_path, "w") as f:
            f.write("\n".join(failed_list) + "\n")
        print(f"Failed icons saved to: {failed_path}")
        print("Re-run with --force to retry failed icons, or use --only <svgKey>")


if __name__ == "__main__":
    main()
