#!/bin/bash
# Auto-setup script for Wan 2.2 video generation on a Vast.ai GPU instance.
# This runs once on first boot to install dependencies and download the model.

set -e

echo "=== Setting up Wan 2.2 Video Generation ==="

# Install system dependencies
apt-get update -qq && apt-get install -y -qq ffmpeg git wget > /dev/null 2>&1
echo "[1/4] System deps installed"

# Install Python packages
pip install -q diffusers transformers accelerate safetensors sentencepiece protobuf
pip install -q imageio imageio-ffmpeg
echo "[2/4] Python packages installed"

# Create working directories
mkdir -p /workspace/outputs /workspace/clips

# Download Wan 2.2 1.3B model (lightweight, fast, fits in 24GB VRAM)
cat > /workspace/generate_video.py << 'GENERATE_SCRIPT'
import sys
import os
import json
import torch
from diffusers import AutoPipelineForText2Video
from diffusers.utils import export_to_video

MODEL_ID = "Wan-AI/Wan2.1-T2V-1.3B"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

_pipe = None

def get_pipeline():
    global _pipe
    if _pipe is None:
        print(f"Loading model {MODEL_ID}...", flush=True)
        _pipe = AutoPipelineForText2Video.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.float16,
        )
        _pipe = _pipe.to(DEVICE)
        _pipe.enable_model_cpu_offload()
        print("Model loaded!", flush=True)
    return _pipe

def generate_clip(prompt, output_path, num_frames=81, height=480, width=832, seed=None):
    """Generate a single video clip."""
    pipe = get_pipeline()
    generator = None
    if seed is not None:
        generator = torch.Generator(device=DEVICE).manual_seed(seed)

    result = pipe(
        prompt=prompt,
        num_frames=num_frames,
        height=height,
        width=width,
        guidance_scale=5.0,
        num_inference_steps=30,
        generator=generator,
    )
    export_to_video(result.frames[0], output_path, fps=16)
    return output_path

if __name__ == "__main__":
    config = json.loads(sys.argv[1])
    prompt = config["prompt"]
    output_path = config["output_path"]
    clip_index = config.get("clip_index", 0)
    seed = config.get("seed", clip_index * 42)
    num_frames = config.get("num_frames", 81)
    height = config.get("height", 480)
    width = config.get("width", 832)

    print(f"Generating clip {clip_index}: {prompt[:50]}...", flush=True)
    generate_clip(prompt, output_path, num_frames=num_frames,
                  height=height, width=width, seed=seed)
    print(f"Clip {clip_index} saved to {output_path}", flush=True)
GENERATE_SCRIPT

echo "[3/4] Generation script created"

# Pre-download model weights
python3 -c "
from diffusers import AutoPipelineForText2Video
import torch
print('Downloading Wan 2.1 1.3B model...')
pipe = AutoPipelineForText2Video.from_pretrained('Wan-AI/Wan2.1-T2V-1.3B', torch_dtype=torch.float16)
print('Model downloaded successfully!')
" 2>&1

echo "[4/4] Model downloaded"
echo "=== Setup complete! Ready for video generation ==="
