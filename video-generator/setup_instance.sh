#!/bin/bash
# Auto-setup script for Wan 2.2 video generation on a Vast.ai GPU instance.
# This runs once on first boot to install dependencies and download the model.

echo "=== Setting up Wan 2.2 Video Generation ==="

# Install system dependencies
apt-get update -qq && apt-get install -y -qq ffmpeg git wget > /dev/null 2>&1 || true
echo "[1/5] System deps installed"

# Upgrade torch to 2.6+ (needed for diffusers 0.33+ custom_op support)
pip install --root-user-action=ignore -q "torch>=2.5" "torchvision>=0.20" --index-url https://download.pytorch.org/whl/cu124 || { echo "ERROR: torch upgrade failed"; exit 1; }

# Install diffusers and deps
pip install --root-user-action=ignore -q "diffusers>=0.33.0" transformers accelerate safetensors sentencepiece protobuf ftfy huggingface_hub || { echo "ERROR: pip install failed"; exit 1; }
pip install --root-user-action=ignore -q imageio imageio-ffmpeg || true
echo "[2/5] Python packages installed"

# Verify versions
python3 -c "import torch, diffusers; print(f'torch={torch.__version__} diffusers={diffusers.__version__} cuda={torch.cuda.is_available()}')"
echo "[3/5] Versions verified"

# Create working directories
mkdir -p /workspace/outputs /workspace/clips

# Create generation script
cat > /workspace/generate_video.py << 'GENERATE_SCRIPT'
import sys
import os
import json
import torch
import gc

MODEL_ID = "Wan-AI/Wan2.1-T2V-1.3B-Diffusers"

_pipe = None

def get_pipeline():
    global _pipe
    if _pipe is None:
        print(f"Loading model {MODEL_ID}...", flush=True)
        from diffusers import WanPipeline
        _pipe = WanPipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.float16,
        )
        _pipe.enable_model_cpu_offload()
        print("Model loaded!", flush=True)
    return _pipe

def generate_clip(prompt, output_path, num_frames=81, height=480, width=832, seed=None):
    """Generate a single video clip."""
    from diffusers.utils import export_to_video
    pipe = get_pipeline()
    generator = None
    if seed is not None:
        generator = torch.Generator(device="cpu").manual_seed(seed)

    print(f"Generating: {prompt[:60]}... ({num_frames} frames, {height}x{width})", flush=True)
    result = pipe(
        prompt=prompt,
        num_frames=num_frames,
        height=height,
        width=width,
        guidance_scale=5.0,
        num_inference_steps=30,
        generator=generator,
        output_type="np",
    )
    export_to_video(result.frames[0], output_path, fps=16)
    del result
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
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

echo "[4/5] Generation script created"

# Pre-download model weights
python3 -c "
from diffusers import WanPipeline
import torch
print('Downloading Wan 2.1 1.3B model...')
pipe = WanPipeline.from_pretrained('Wan-AI/Wan2.1-T2V-1.3B-Diffusers', torch_dtype=torch.float16)
print('Model downloaded successfully!')
" 2>&1

echo "[5/5] Model downloaded"
echo "=== Setup complete! Ready for video generation ==="
